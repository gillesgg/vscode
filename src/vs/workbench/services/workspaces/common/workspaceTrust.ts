/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Codicon } from 'vs/base/common/codicons';
import { Emitter } from 'vs/base/common/event';
import { MarkdownString } from 'vs/base/common/htmlContent';
import { splitName } from 'vs/base/common/labels';
import { Disposable, IDisposable, toDisposable } from 'vs/base/common/lifecycle';
import { LinkedList } from 'vs/base/common/linkedList';
import { Schemas } from 'vs/base/common/network';
import { isWeb } from 'vs/base/common/platform';
import Severity from 'vs/base/common/severity';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKey, IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IRemoteAuthorityResolverService, ResolverResult } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { IStorageService, StorageScope, StorageTarget } from 'vs/platform/storage/common/storage';
import { IWorkspaceContextService, WorkbenchState } from 'vs/platform/workspace/common/workspace';
import { WorkspaceTrustRequestOptions, IWorkspaceTrustManagementService, IWorkspaceTrustInfo, IWorkspaceTrustUriInfo, IWorkspaceTrustRequestService, IWorkspaceTrustTransitionParticipant, WorkspaceTrustUriResponse } from 'vs/platform/workspace/common/workspaceTrust';
import { isSingleFolderWorkspaceIdentifier, isUntitledWorkspace, toWorkspaceIdentifier } from 'vs/platform/workspaces/common/workspaces';
import { Memento, MementoObject } from 'vs/workbench/common/memento';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IUriIdentityService } from 'vs/workbench/services/uriIdentity/common/uriIdentity';

export const WORKSPACE_TRUST_ENABLED = 'security.workspace.trust.enabled';
export const WORKSPACE_TRUST_STARTUP_PROMPT = 'security.workspace.trust.startupPrompt';
export const WORKSPACE_TRUST_UNTRUSTED_FILES = 'security.workspace.trust.untrustedFiles';
export const WORKSPACE_TRUST_EMPTY_WINDOW = 'security.workspace.trust.emptyWindow';
export const WORKSPACE_TRUST_EXTENSION_SUPPORT = 'extensions.supportUntrustedWorkspaces';
export const WORKSPACE_TRUST_STORAGE_KEY = 'content.trust.model.key';

export const WorkspaceTrustContext = {
	IsTrusted: new RawContextKey<boolean>('isWorkspaceTrusted', false, localize('workspaceTrustCtx', "Whether the current workspace has been trusted by the user."))
};

export function isWorkspaceTrustEnabled(configurationService: IConfigurationService): boolean {
	if (isWeb) {
		return false;
	}

	return (configurationService.inspect<boolean>(WORKSPACE_TRUST_ENABLED).userValue ?? configurationService.inspect<boolean>(WORKSPACE_TRUST_ENABLED).defaultValue) ?? false;
}

export class WorkspaceTrustManagementService extends Disposable implements IWorkspaceTrustManagementService {

	_serviceBrand: undefined;

	private readonly storageKey = WORKSPACE_TRUST_STORAGE_KEY;

	private readonly _onDidChangeTrust = this._register(new Emitter<boolean>());
	readonly onDidChangeTrust = this._onDidChangeTrust.event;

	private readonly _onDidChangeTrustedFolders = this._register(new Emitter<void>());
	readonly onDidChangeTrustedFolders = this._onDidChangeTrustedFolders.event;

	private readonly _onDidInitiateWorkspaceTrustRequestOnStartup = this._register(new Emitter<void>());
	readonly onDidInitiateWorkspaceTrustRequestOnStartup = this._onDidInitiateWorkspaceTrustRequestOnStartup.event;

	private _trustStateInfo!: IWorkspaceTrustInfo;

	private _remoteAuthority!: ResolverResult;
	private readonly _trustState: WorkspaceTrustState;
	private readonly _trustTransitionManager: WorkspaceTrustTransitionManager;

	constructor(
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IRemoteAuthorityResolverService private readonly remoteAuthorityResolverService: IRemoteAuthorityResolverService,
		@IStorageService private readonly storageService: IStorageService,
		@IUriIdentityService private readonly uriIdentityService: IUriIdentityService,
		@IWorkbenchEnvironmentService private readonly environmentService: IWorkbenchEnvironmentService,
		@IWorkspaceContextService private readonly workspaceService: IWorkspaceContextService,
	) {
		super();

		this._trustState = new WorkspaceTrustState(this.storageService);
		this._trustTransitionManager = this._register(new WorkspaceTrustTransitionManager());

		// Remote - resolve remote authority
		if (this.environmentService.remoteAuthority) {
			this.remoteAuthorityResolverService.resolveAuthority(this.environmentService.remoteAuthority)
				.then(async result => {
					this._remoteAuthority = result;
					await this.updateWorkspaceTrust();

					// Show workspace trust modal dialog
					this._onDidInitiateWorkspaceTrustRequestOnStartup.fire();
				});
		}

		this.registerListeners();
	}

	private registerListeners(): void {
		this._register(this.workspaceService.onDidChangeWorkspaceFolders(async () => await this.updateWorkspaceTrust()));
		this._register(this.workspaceService.onDidChangeWorkbenchState(async () => await this.updateWorkspaceTrust()));
		this._register(this.storageService.onDidChangeValue(async changeEvent => {
			/* This will only execute if storage was changed by a user action in a separate window */
			if (changeEvent.key === this.storageKey && JSON.stringify(this._trustStateInfo) !== JSON.stringify(this.loadTrustInfo())) {
				this._trustStateInfo = this.loadTrustInfo();
				this._onDidChangeTrustedFolders.fire();

				await this.updateWorkspaceTrust();
			}
		}));
	}

	private loadTrustInfo(): IWorkspaceTrustInfo {
		const infoAsString = this.storageService.get(this.storageKey, StorageScope.GLOBAL);

		let result: IWorkspaceTrustInfo | undefined;
		try {
			if (infoAsString) {
				result = JSON.parse(infoAsString);
			}
		} catch { }

		if (!result) {
			result = {
				uriTrustInfo: []
			};
		}

		if (!result.uriTrustInfo) {
			result.uriTrustInfo = [];
		}

		result.uriTrustInfo = result.uriTrustInfo.map(info => { return { uri: URI.revive(info.uri), trusted: info.trusted }; });
		result.uriTrustInfo = result.uriTrustInfo.filter(info => info.trusted);

		return result;
	}

	private async saveTrustInfo(): Promise<void> {
		this.storageService.store(this.storageKey, JSON.stringify(this._trustStateInfo), StorageScope.GLOBAL, StorageTarget.MACHINE);
		this._onDidChangeTrustedFolders.fire();

		await this.updateWorkspaceTrust();
	}

	private async calculateWorkspaceTrust(): Promise<boolean> {
		if (!isWorkspaceTrustEnabled(this.configurationService)) {
			return true;
		}

		// Automated test runs with vscode-test
		if (this.environmentService.extensionTestsLocationURI) {
			return true;
		}

		// Remote
		if (this.environmentService.remoteAuthority) {
			return this._remoteAuthority?.options?.isTrusted ?? false;
		}

		// Empty workspace
		if (this.workspaceService.getWorkbenchState() === WorkbenchState.EMPTY) {
			// Use memento if present, otherwise default to restricted mode
			// Workspace may transition to trusted based on the opened editors
			return this._trustState.isTrusted ?? false;
		}

		// Workspace
		const workspaceUris = await this.getWorkspaceUris();
		const trusted = this.getUrisTrust(workspaceUris);

		return trusted;
	}

	private async getCanonicalUri(uri: URI): Promise<URI> {
		return (this.environmentService.remoteAuthority && this._remoteAuthority) ?
			await this.remoteAuthorityResolverService.getCanonicalURI(uri) : uri;
	}

	private getUrisTrust(uris: URI[]): boolean {
		let state = true;
		for (const uri of uris) {
			const { trusted } = this.getUriTrustInfo(uri);

			if (!trusted) {
				state = trusted;
				return state;
			}
		}

		return state;
	}

	private async getWorkspaceUris(): Promise<URI[]> {
		const workspaceUris: URI[] = [];

		// Workspace folders
		for (const { uri } of this.workspaceService.getWorkspace().folders) {
			workspaceUris.push(await this.getCanonicalUri(uri));
		}

		// Workspace file
		const workspaceConfiguration = this.workspaceService.getWorkspace().configuration;
		if (workspaceConfiguration && !isUntitledWorkspace(workspaceConfiguration, this.environmentService)) {
			workspaceUris.push(await this.getCanonicalUri(workspaceConfiguration));
		}

		return workspaceUris;
	}

	private async updateWorkspaceTrust(trusted?: boolean): Promise<void> {
		if (trusted === undefined) {
			trusted = await this.calculateWorkspaceTrust();
		}

		if (this.isWorkpaceTrusted() === trusted) { return; }

		// Update workspace trust
		this._trustState.isTrusted = trusted;

		// Run workspace trust transition participants
		await this._trustTransitionManager.participate(trusted);

		// Fire workspace trust change event
		this._onDidChangeTrust.fire(trusted);
	}

	get acceptsOutOfWorkspaceFiles(): boolean {
		return this._trustState.acceptsOutOfWorkspaceFiles;
	}

	set acceptsOutOfWorkspaceFiles(value: boolean) {
		this._trustState.acceptsOutOfWorkspaceFiles = value;
	}

	addWorkspaceTrustTransitionParticipant(participant: IWorkspaceTrustTransitionParticipant): IDisposable {
		return this._trustTransitionManager.addWorkspaceTrustTransitionParticipant(participant);
	}

	getUriTrustInfo(uri: URI): IWorkspaceTrustUriInfo {
		let resultState = false;
		let maxLength = -1;

		let resultUri = uri;

		for (const trustInfo of this._trustStateInfo.uriTrustInfo) {
			if (this.uriIdentityService.extUri.isEqualOrParent(uri, trustInfo.uri)) {
				const fsPath = trustInfo.uri.fsPath;
				if (fsPath.length > maxLength) {
					maxLength = fsPath.length;
					resultState = trustInfo.trusted;
					resultUri = trustInfo.uri;
				}
			}
		}

		return { trusted: resultState, uri: resultUri };
	}

	async setUrisTrust(uris: URI[], trusted: boolean): Promise<void> {
		let changed = false;

		for (const uri of uris) {
			if (trusted) {
				const foundItem = this._trustStateInfo.uriTrustInfo.find(trustInfo => this.uriIdentityService.extUri.isEqual(trustInfo.uri, uri));
				if (!foundItem) {
					this._trustStateInfo.uriTrustInfo.push({ uri, trusted: true });
					changed = true;
				}
			} else {
				const previousLength = this._trustStateInfo.uriTrustInfo.length;
				this._trustStateInfo.uriTrustInfo = this._trustStateInfo.uriTrustInfo.filter(trustInfo => !this.uriIdentityService.extUri.isEqual(trustInfo.uri, uri));
				if (previousLength !== this._trustStateInfo.uriTrustInfo.length) {
					changed = true;
				}
			}
		}

		if (changed) {
			await this.saveTrustInfo();
		}
	}

	canSetWorkspaceTrust(): boolean {
		// Remote - remote authority not yet resolved, or remote authority explicitly sets workspace trust
		if (this.environmentService.remoteAuthority && (!this._remoteAuthority || this._remoteAuthority.options?.isTrusted !== undefined)) {
			return false;
		}

		// Empty workspace
		if (this.workspaceService.getWorkbenchState() === WorkbenchState.EMPTY) {
			return true;
		}

		// Untrusted workspace
		if (!this.isWorkpaceTrusted()) {
			return true;
		}

		// Trusted workspace
		// Can only be trusted explicitly in the single folder scenario
		const workspaceIdentifier = toWorkspaceIdentifier(this.workspaceService.getWorkspace());
		if (!(isSingleFolderWorkspaceIdentifier(workspaceIdentifier) && workspaceIdentifier.uri.scheme === Schemas.file)) {
			return false;
		}

		// If the current folder isn't trusted directly, return false
		const trustInfo = this.getUriTrustInfo(workspaceIdentifier.uri);
		if (!trustInfo.trusted || !this.uriIdentityService.extUri.isEqual(workspaceIdentifier.uri, trustInfo.uri)) {
			return false;
		}

		// Check if the parent is also trusted
		if (this.canSetParentFolderTrust()) {
			const { parentPath } = splitName(workspaceIdentifier.uri.fsPath);
			const parentIsTrusted = this.getUriTrustInfo(URI.file(parentPath)).trusted;
			if (parentIsTrusted) {
				return false;
			}
		}

		return true;
	}

	canSetParentFolderTrust(): boolean {
		const workspaceIdentifier = toWorkspaceIdentifier(this.workspaceService.getWorkspace());
		return isSingleFolderWorkspaceIdentifier(workspaceIdentifier) && workspaceIdentifier.uri.scheme === Schemas.file;
	}

	async initializeWorkspaceTrust(): Promise<void> {
		this._trustStateInfo = this.loadTrustInfo();
		this._trustState.isTrusted = await this.calculateWorkspaceTrust();
	}

	isWorkpaceTrusted(): boolean {
		return this._trustState.isTrusted ?? false;
	}

	async setParentFolderTrust(trusted: boolean): Promise<void> {
		const workspaceIdentifier = toWorkspaceIdentifier(this.workspaceService.getWorkspace());
		if (isSingleFolderWorkspaceIdentifier(workspaceIdentifier) && workspaceIdentifier.uri.scheme === Schemas.file) {
			const { parentPath } = splitName(workspaceIdentifier.uri.fsPath);

			await this.setUrisTrust([URI.file(parentPath)], trusted);
		}
	}

	async setWorkspaceTrust(trusted: boolean): Promise<void> {
		// Empty workspace
		if (this.workspaceService.getWorkbenchState() === WorkbenchState.EMPTY) {
			await this.updateWorkspaceTrust(trusted);
			return;
		}

		const workspaceFolders = await this.getWorkspaceUris();
		await this.setUrisTrust(workspaceFolders, trusted);
	}

	getTrustedFolders(): URI[] {
		return this._trustStateInfo.uriTrustInfo.map(info => info.uri);
	}

	async setTrustedFolders(uris: URI[]): Promise<void> {
		this._trustStateInfo.uriTrustInfo = [];
		for (const uri of uris) {
			const cleanUri = this.uriIdentityService.extUri.removeTrailingPathSeparator(uri);
			let added = false;
			for (const addedUri of this._trustStateInfo.uriTrustInfo) {
				if (this.uriIdentityService.extUri.isEqual(addedUri.uri, cleanUri)) {
					added = true;
					break;
				}
			}

			if (added) {
				continue;
			}

			this._trustStateInfo.uriTrustInfo.push({
				trusted: true,
				uri: cleanUri
			});
		}

		await this.saveTrustInfo();
	}
}

export class WorkspaceTrustRequestService extends Disposable implements IWorkspaceTrustRequestService {
	_serviceBrand: undefined;

	private _trusted!: boolean;
	private _modalTrustRequestPromise?: Promise<boolean | undefined>;
	private _modalTrustRequestResolver?: (trusted: boolean | undefined) => void;
	private readonly _ctxWorkspaceTrustState: IContextKey<boolean>;

	private readonly _onDidInitiateWorkspaceTrustRequest = this._register(new Emitter<WorkspaceTrustRequestOptions | undefined>());
	readonly onDidInitiateWorkspaceTrustRequest = this._onDidInitiateWorkspaceTrustRequest.event;


	constructor(
		@IContextKeyService contextKeyService: IContextKeyService,
		@IDialogService private readonly dialogService: IDialogService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IWorkspaceContextService private readonly workspaceService: IWorkspaceContextService,
		@IWorkspaceTrustManagementService private readonly workspaceTrustManagementService: IWorkspaceTrustManagementService
	) {
		super();

		this._register(this.workspaceTrustManagementService.onDidChangeTrust(trusted => this.trusted = trusted));

		this._ctxWorkspaceTrustState = WorkspaceTrustContext.IsTrusted.bindTo(contextKeyService);

		this.trusted = this.workspaceTrustManagementService.isWorkpaceTrusted();
	}

	private get trusted(): boolean {
		return this._trusted;
	}

	private set trusted(trusted: boolean) {
		this._trusted = trusted;
		this._ctxWorkspaceTrustState.set(trusted);
	}

	private get untrustedFilesSetting(): 'prompt' | 'open' | 'newWindow' {
		return this.configurationService.getValue(WORKSPACE_TRUST_UNTRUSTED_FILES);
	}

	private set untrustedFilesSetting(value: 'prompt' | 'open' | 'newWindow') {
		this.configurationService.updateValue(WORKSPACE_TRUST_UNTRUSTED_FILES, value);
	}

	private resolveRequest(trusted?: boolean): void {
		if (this._modalTrustRequestResolver) {
			this._modalTrustRequestResolver(trusted ?? this.trusted);

			this._modalTrustRequestResolver = undefined;
			this._modalTrustRequestPromise = undefined;
		}
	}

	cancelRequest(): void {
		if (this._modalTrustRequestResolver) {
			this._modalTrustRequestResolver(undefined);

			this._modalTrustRequestResolver = undefined;
			this._modalTrustRequestPromise = undefined;
		}
	}

	async completeRequest(trusted?: boolean): Promise<void> {
		if (trusted === undefined || trusted === this.trusted) {
			this.resolveRequest(trusted);
			return;
		}

		// Update storage, transition workspace, and resolve the promise
		await this.workspaceTrustManagementService.setWorkspaceTrust(trusted);
		this.resolveRequest(trusted);
	}

	async requestOpenUris(uris: URI[]): Promise<WorkspaceTrustUriResponse> {
		// If workspace is untrusted, there is no conflict
		if (!this.trusted) {
			return WorkspaceTrustUriResponse.Open;
		}

		const allTrusted = uris.map(uri => {
			return this.workspaceTrustManagementService.getUriTrustInfo(uri).trusted;
		}).every(trusted => trusted);

		// If all uris are trusted, there is no conflict
		if (allTrusted) {
			return WorkspaceTrustUriResponse.Open;
		}

		// If user has setting, don't need to ask
		if (this.untrustedFilesSetting !== 'prompt') {
			if (this.untrustedFilesSetting === 'newWindow') {
				return WorkspaceTrustUriResponse.OpenInNewWindow;
			}

			if (this.untrustedFilesSetting === 'open') {
				return WorkspaceTrustUriResponse.Open;
			}
		}

		// If we already asked the user, don't need to ask again
		if (this.workspaceTrustManagementService.acceptsOutOfWorkspaceFiles) {
			return WorkspaceTrustUriResponse.Open;
		}

		const markdownDetails = [
			this.workspaceService.getWorkbenchState() !== WorkbenchState.EMPTY ?
				localize('openLooseFileWorkspaceDetails', "You are trying to open untrusted files in a workspace which is trusted.") :
				localize('openLooseFileWindowDetails', "You are trying to open untrusted files in a window which is trusted."),
			localize('openLooseFileLearnMore', "If you don't trust the authors of these files, we recommend to open them in Restricted Mode in a new window as the files may be malicious. See [our docs](https://aka.ms/vscode-workspace-trust) to learn more.")
		];

		const result = await this.dialogService.show(Severity.Info, localize('openLooseFileMesssage', "Do you trust the authors of these files?"), [localize('open', "Open"), localize('newWindow', "Open in Restricted Mode"), localize('cancel', "Cancel")], {
			cancelId: 2,
			checkbox: {
				label: localize('openLooseFileWorkspaceCheckbox', "Remember my decision for all workspaces"),
				checked: false
			},
			custom: {
				icon: Codicon.shield,
				markdownDetails: markdownDetails.map(md => { return { markdown: new MarkdownString(md) }; })
			}
		});

		const saveResponseIfChecked = (response: WorkspaceTrustUriResponse, checked: boolean) => {
			if (checked) {
				if (response === WorkspaceTrustUriResponse.Open) {
					this.untrustedFilesSetting = 'open';
				}

				if (response === WorkspaceTrustUriResponse.OpenInNewWindow) {
					this.untrustedFilesSetting = 'newWindow';
				}
			}

			return response;
		};

		switch (result.choice) {
			case 0:
				this.workspaceTrustManagementService.acceptsOutOfWorkspaceFiles = true;
				return saveResponseIfChecked(WorkspaceTrustUriResponse.Open, !!result.checkboxChecked);
			case 1:
				return saveResponseIfChecked(WorkspaceTrustUriResponse.OpenInNewWindow, !!result.checkboxChecked);
			default:
				return WorkspaceTrustUriResponse.Cancel;
		}
	}

	async requestWorkspaceTrust(options?: WorkspaceTrustRequestOptions): Promise<boolean | undefined> {
		// Trusted workspace
		if (this.trusted) {
			return this.trusted;
		}

		// Modal request
		if (!this._modalTrustRequestPromise) {
			// Create promise
			this._modalTrustRequestPromise = new Promise(resolve => {
				this._modalTrustRequestResolver = resolve;
			});
		} else {
			// Return existing promise
			return this._modalTrustRequestPromise;
		}

		this._onDidInitiateWorkspaceTrustRequest.fire(options);
		return this._modalTrustRequestPromise;
	}
}

class WorkspaceTrustTransitionManager extends Disposable {

	private readonly participants = new LinkedList<IWorkspaceTrustTransitionParticipant>();

	addWorkspaceTrustTransitionParticipant(participant: IWorkspaceTrustTransitionParticipant): IDisposable {
		const remove = this.participants.push(participant);
		return toDisposable(() => remove());
	}

	async participate(trusted: boolean): Promise<void> {
		for (const participant of this.participants) {
			await participant.participate(trusted);
		}
	}

	override dispose(): void {
		this.participants.clear();
	}
}

class WorkspaceTrustState {
	private readonly _memento: Memento;
	private readonly _mementoObject: MementoObject;

	private readonly _acceptsOutOfWorkspaceFilesKey = 'acceptsOutOfWorkspaceFiles';
	private readonly _isTrustedKey = 'isTrusted';

	constructor(storageService: IStorageService) {
		this._memento = new Memento('workspaceTrust', storageService);
		this._mementoObject = this._memento.getMemento(StorageScope.WORKSPACE, StorageTarget.MACHINE);
	}

	get acceptsOutOfWorkspaceFiles(): boolean {
		return this._mementoObject[this._acceptsOutOfWorkspaceFilesKey] ?? false;
	}

	set acceptsOutOfWorkspaceFiles(value: boolean) {
		this._mementoObject[this._acceptsOutOfWorkspaceFilesKey] = value;
		this._memento.saveMemento();
	}

	get isTrusted(): boolean | undefined {
		return this._mementoObject[this._isTrustedKey];
	}

	set isTrusted(value: boolean | undefined) {
		this._mementoObject[this._isTrustedKey] = value;
		if (!value) {
			this._mementoObject[this._acceptsOutOfWorkspaceFilesKey] = value;
		}

		this._memento.saveMemento();
	}
}

registerSingleton(IWorkspaceTrustRequestService, WorkspaceTrustRequestService);
