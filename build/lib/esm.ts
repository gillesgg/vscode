/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import * as fs from 'fs';

// TODO@esm remove this

const outDirectory = path.join(__dirname, '..', '..', 'out-build');
const esmMarkerFile = path.join(outDirectory, 'esm');

export function setESM(isESM: boolean) {
	const result = () => new Promise<void>((resolve, _) => {
		if (isESM) {
			fs.mkdirSync(outDirectory, { recursive: true });
			fs.writeFileSync(esmMarkerFile, 'true', 'utf8');
			console.warn(`Setting build to ESM: true`);
		} else {
			console.warn(`Setting build to ESM: false`);
		}

		resolve();
	});
	result.taskName = 'set-esm';
	return result;
}

export function isESM(): boolean {
	try {
		return fs.readFileSync(esmMarkerFile, 'utf8') === 'true';
	} catch (error) {
		return false;
	}
}
