/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as nls from 'vscode-nls';
import { Command } from '../commandManager';
import { createUriListSnippet, getParentDocumentUri, imageFileExtensions } from '../languageFeatures/dropIntoEditor';
import { coalesce } from '../util/arrays';

const localize = nls.loadMessageBundle();


export class InsertLocalFileLink implements Command {
	public readonly id = 'markdown.editor.insertLinkToLocalFile';

	public async execute() {
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			return;
		}

		const selectedFiles = await vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: true,
			openLabel: localize('insertLink.openLabel', "Insert link"),
			title: localize('insertLink.title', "Insert link"),
			defaultUri: getParentDocumentUri(activeEditor.document),
		});

		return insertLink(activeEditor, selectedFiles ?? [], false);
	}
}

export class InsertLocalImage implements Command {
	public readonly id = 'markdown.editor.insertLocalImage';

	public async execute() {
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			return;
		}

		const selectedFiles = await vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			filters: {
				[localize('insertImage.imagesLabel', "Images")]: Array.from(imageFileExtensions)
			},
			openLabel: localize('insertImage.openLabel', "Insert image"),
			title: localize('insertImage.title', "Insert image"),
			defaultUri: getParentDocumentUri(activeEditor.document),
		});

		return insertLink(activeEditor, selectedFiles ?? [], true);
	}
}

async function insertLink(activeEditor: vscode.TextEditor, selectedFiles: vscode.Uri[], insertAsImage: boolean): Promise<void> {
	if (!selectedFiles.length) {
		return;
	}

	const edit = createInsertLinkEdit(activeEditor, selectedFiles, insertAsImage);
	await vscode.workspace.applyEdit(edit);
}

function createInsertLinkEdit(activeEditor: vscode.TextEditor, selectedFiles: vscode.Uri[], insertAsImage: boolean) {
	const snippetEdits = coalesce(activeEditor.selections.map((selection, i): vscode.SnippetTextEdit | undefined => {
		const selectionText = activeEditor.document.getText(selection);
		console.log(selectionText);

		const snippet = createUriListSnippet(activeEditor.document, selectedFiles, {
			insertAsImage: insertAsImage,
			placeholderText: selectionText,
			placeholderIndex: i + 1,
		});

		return snippet ? new vscode.SnippetTextEdit(selection, snippet) : undefined;
	}));

	const edit = new vscode.WorkspaceEdit();
	edit.set(activeEditor.document.uri, snippetEdits);
	return edit;
}
