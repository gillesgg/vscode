/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// import * as assert from 'assert';

import { SpectronApplication, LATEST_PATH, CODE_WORKSPACE_PATH } from "../spectron/application";
import { CommonActions } from '../areas/common';

let app: SpectronApplication;
let common: CommonActions;

export function testMultiRoot() {
	context('Multi Root', () => {

		beforeEach(async function () {
			app = new SpectronApplication(LATEST_PATH, this.currentTest.fullTitle(), (this.currentTest as any).currentRetry(), [CODE_WORKSPACE_PATH]);
			common = new CommonActions(app);

			return await app.start();
		});

		afterEach(async function () {
			return await app.stop();
		});

		it('shows results from all folders', async function () {
			await app.wait();
		});
	});
}