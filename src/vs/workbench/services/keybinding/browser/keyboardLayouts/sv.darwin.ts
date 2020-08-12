/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KeyboardLayoutContribution } from 'vs/workbench/services/keybinding/browser/keyboardLayouts/_.contribution';


KeyboardLayoutContribution.INSTANCE.registerKeyboardLayout({
	layout: { id: 'com.apple.keylayout.Swedish-Pro', lang: 'sv', localizedName: 'Swedish - Pro' },
	secondaryLayouts: [],
	mapping: {
		KeyA: ['a', 'A', '', '◊', 0],
		KeyB: ['b', 'B', '›', '»', 0],
		KeyC: ['c', 'C', 'ç', 'Ç', 0],
		KeyD: ['d', 'D', '∂', '∆', 0],
		KeyE: ['e', 'E', 'é', 'É', 0],
		KeyF: ['f', 'F', 'ƒ', '∫', 0],
		KeyG: ['g', 'G', '¸', '¯', 0],
		KeyH: ['h', 'H', '˛', '˘', 0],
		KeyI: ['i', 'I', 'ı', 'ˆ', 0],
		KeyJ: ['j', 'J', '√', '¬', 0],
		KeyK: ['k', 'K', 'ª', 'º', 0],
		KeyL: ['l', 'L', 'ﬁ', 'ﬂ', 0],
		KeyM: ['m', 'M', '’', '”', 0],
		KeyN: ['n', 'N', '‘', '“', 0],
		KeyO: ['o', 'O', 'œ', 'Œ', 0],
		KeyP: ['p', 'P', 'π', '∏', 0],
		KeyQ: ['q', 'Q', '•', '°', 0],
		KeyR: ['r', 'R', '®', '√', 0],
		KeyS: ['s', 'S', 'ß', '∑', 0],
		KeyT: ['t', 'T', '†', '‡', 0],
		KeyU: ['u', 'U', 'ü', 'Ü', 0],
		KeyV: ['v', 'V', '‹', '«', 0],
		KeyW: ['w', 'W', 'Ω', '˝', 0],
		KeyX: ['x', 'X', '≈', 'ˇ', 0],
		KeyY: ['y', 'Y', 'µ', '˜', 0],
		KeyZ: ['z', 'Z', '÷', '⁄', 0],
		Digit1: ['1', '!', '©', '¡', 0],
		Digit2: ['2', '"', '@', '”', 0],
		Digit3: ['3', '#', '£', '¥', 0],
		Digit4: ['4', '€', '$', '¢', 0],
		Digit5: ['5', '%', '∞', '‰', 0],
		Digit6: ['6', '&', '§', '¶', 0],
		Digit7: ['7', '/', '|', '\\', 0],
		Digit8: ['8', '(', '[', '{', 0],
		Digit9: ['9', ')', ']', '}', 0],
		Digit0: ['0', '=', '≈', '≠', 0],
		Enter: [],
		Escape: [],
		Backspace: [],
		Tab: [],
		Space: [' ', ' ', ' ', ' ', 0],
		Minus: ['+', '?', '±', '¿', 0],
		Equal: ['´', '`', '´', '`', 3],
		BracketLeft: ['å', 'Å', '˙', '˚', 0],
		BracketRight: ['¨', '^', '~', '^', 7],
		Backslash: ['\'', '*', '™', '’', 0],
		Semicolon: ['ö', 'Ö', 'ø', 'Ø', 0],
		Quote: ['ä', 'Ä', 'æ', 'Æ', 0],
		Backquote: ['<', '>', '≤', '≥', 0],
		Comma: [',', ';', '‚', '„', 0],
		Period: ['.', ':', '…', '·', 0],
		Slash: ['-', '_', '–', '—', 0],
		CapsLock: [],
		F1: [],
		F2: [],
		F3: [],
		F4: [],
		F5: [],
		F6: [],
		F7: [],
		F8: [],
		F9: [],
		F10: [],
		F11: [],
		F12: [],
		Insert: [],
		Home: [],
		PageUp: [],
		Delete: [],
		End: [],
		PageDown: [],
		ArrowRight: [],
		ArrowLeft: [],
		ArrowDown: [],
		ArrowUp: [],
		NumLock: [],
		NumpadDivide: ['/', '/', '/', '/', 0],
		NumpadMultiply: ['*', '*', '*', '*', 0],
		NumpadSubtract: ['-', '-', '-', '-', 0],
		NumpadAdd: ['+', '+', '+', '+', 0],
		NumpadEnter: [],
		Numpad1: ['1', '1', '1', '1', 0],
		Numpad2: ['2', '2', '2', '2', 0],
		Numpad3: ['3', '3', '3', '3', 0],
		Numpad4: ['4', '4', '4', '4', 0],
		Numpad5: ['5', '5', '5', '5', 0],
		Numpad6: ['6', '6', '6', '6', 0],
		Numpad7: ['7', '7', '7', '7', 0],
		Numpad8: ['8', '8', '8', '8', 0],
		Numpad9: ['9', '9', '9', '9', 0],
		Numpad0: ['0', '0', '0', '0', 0],
		NumpadDecimal: [',', '.', ',', '.', 0],
		IntlBackslash: ['§', '°', '¶', '•', 0],
		ContextMenu: [],
		NumpadEqual: ['=', '=', '=', '=', 0],
		F13: [],
		F14: [],
		F15: [],
		F16: [],
		F17: [],
		F18: [],
		F19: [],
		F20: [],
		AudioVolumeMute: [],
		AudioVolumeUp: ['', '=', '', '=', 0],
		AudioVolumeDown: [],
		NumpadComma: [],
		IntlRo: [],
		KanaMode: [],
		IntlYen: [],
		ControlLeft: [],
		ShiftLeft: [],
		AltLeft: [],
		MetaLeft: [],
		ControlRight: [],
		ShiftRight: [],
		AltRight: [],
		MetaRight: []
	}
});
