/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from 'vs/base/common/uri';

export interface IActivity {
	id: string;
	name: string;
	keybindingId?: string;
	cssClass?: string;
	iconUrl?: URI;
}

export const GLOBAL_ACTIVITY_ID = 'workbench.action.globalActivity';
export const ACCOUNTS_ACTIIVTY_ID = 'workbench.action.accountsActivity';
