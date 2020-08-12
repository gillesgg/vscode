/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KeyboardLayoutContribution } from 'vs/workbench/services/keybinding/browser/keyboardLayouts/_.contribution';


KeyboardLayoutContribution.INSTANCE.registerKeyboardLayout({
	layout: { model: 'pc104', layout: 'ru', variant: ',', options: '', rules: 'base' },
	secondaryLayouts: [],
	mapping: {
		Sleep: [],
		WakeUp: [],
		KeyA: ['ф', 'Ф', 'ф', 'Ф', 0],
		KeyB: ['и', 'И', 'и', 'И', 0],
		KeyC: ['с', 'С', 'с', 'С', 0],
		KeyD: ['в', 'В', 'в', 'В', 0],
		KeyE: ['у', 'У', 'у', 'У', 0],
		KeyF: ['а', 'А', 'а', 'А', 0],
		KeyG: ['п', 'П', 'п', 'П', 0],
		KeyH: ['р', 'Р', 'р', 'Р', 0],
		KeyI: ['ш', 'Ш', 'ш', 'Ш', 0],
		KeyJ: ['о', 'О', 'о', 'О', 0],
		KeyK: ['л', 'Л', 'л', 'Л', 0],
		KeyL: ['д', 'Д', 'д', 'Д', 0],
		KeyM: ['ь', 'Ь', 'ь', 'Ь', 0],
		KeyN: ['т', 'Т', 'т', 'Т', 0],
		KeyO: ['щ', 'Щ', 'щ', 'Щ', 0],
		KeyP: ['з', 'З', 'з', 'З', 0],
		KeyQ: ['й', 'Й', 'й', 'Й', 0],
		KeyR: ['к', 'К', 'к', 'К', 0],
		KeyS: ['ы', 'Ы', 'ы', 'Ы', 0],
		KeyT: ['е', 'Е', 'е', 'Е', 0],
		KeyU: ['г', 'Г', 'г', 'Г', 0],
		KeyV: ['м', 'М', 'м', 'М', 0],
		KeyW: ['ц', 'Ц', 'ц', 'Ц', 0],
		KeyX: ['ч', 'Ч', 'ч', 'Ч', 0],
		KeyY: ['н', 'Н', 'н', 'Н', 0],
		KeyZ: ['я', 'Я', 'я', 'Я', 0],
		Digit1: ['1', '!', '1', '!', 0],
		Digit2: ['2', '"', '2', '"', 0],
		Digit3: ['3', '№', '3', '№', 0],
		Digit4: ['4', ';', '4', ';', 0],
		Digit5: ['5', '%', '5', '%', 0],
		Digit6: ['6', ':', '6', ':', 0],
		Digit7: ['7', '?', '7', '?', 0],
		Digit8: ['8', '*', '₽', '', 0],
		Digit9: ['9', '(', '9', '(', 0],
		Digit0: ['0', ')', '0', ')', 0],
		Enter: ['\r', '\r', '\r', '\r', 0],
		Escape: ['\u001b', '\u001b', '\u001b', '\u001b', 0],
		Backspace: ['\b', '\b', '\b', '\b', 0],
		Tab: ['\t', '', '\t', '', 0],
		Space: [' ', ' ', ' ', ' ', 0],
		Minus: ['-', '_', '-', '_', 0],
		Equal: ['=', '+', '=', '+', 0],
		BracketLeft: ['х', 'Х', 'х', 'Х', 0],
		BracketRight: ['ъ', 'Ъ', 'ъ', 'Ъ', 0],
		Backslash: ['\\', '/', '\\', '/', 0],
		Semicolon: ['ж', 'Ж', 'ж', 'Ж', 0],
		Quote: ['э', 'Э', 'э', 'Э', 0],
		Backquote: ['ё', 'Ё', 'ё', 'Ё', 0],
		Comma: ['б', 'Б', 'б', 'Б', 0],
		Period: ['ю', 'Ю', 'ю', 'Ю', 0],
		Slash: ['.', ',', '.', ',', 0],
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
		PrintScreen: ['', '', '', '', 0],
		ScrollLock: [],
		Pause: [],
		Insert: [],
		Home: [],
		PageUp: ['/', '/', '/', '/', 0],
		Delete: [],
		End: [],
		PageDown: [],
		ArrowRight: [],
		ArrowLeft: [],
		ArrowDown: [],
		ArrowUp: [],
		NumLock: [],
		NumpadDivide: [],
		NumpadMultiply: ['*', '*', '*', '*', 0],
		NumpadSubtract: ['-', '-', '-', '-', 0],
		NumpadAdd: ['+', '+', '+', '+', 0],
		NumpadEnter: [],
		Numpad1: ['', '1', '', '1', 0],
		Numpad2: ['', '2', '', '2', 0],
		Numpad3: ['', '3', '', '3', 0],
		Numpad4: ['', '4', '', '4', 0],
		Numpad5: ['', '5', '', '5', 0],
		Numpad6: ['', '6', '', '6', 0],
		Numpad7: ['', '7', '', '7', 0],
		Numpad8: ['', '8', '', '8', 0],
		Numpad9: ['', '9', '', '9', 0],
		Numpad0: ['', '0', '', '0', 0],
		NumpadDecimal: ['', ',', '', ',', 0],
		IntlBackslash: ['/', '|', '|', '¦', 0],
		ContextMenu: [],
		Power: [],
		NumpadEqual: [],
		F13: [],
		F14: [],
		F15: [],
		F16: [],
		F17: [],
		F18: [],
		F19: [],
		F20: [],
		F21: [],
		F22: [],
		F23: [],
		F24: [],
		Open: [],
		Help: [],
		Select: [],
		Again: [],
		Undo: [],
		Cut: [],
		Copy: [],
		Paste: [],
		Find: [],
		AudioVolumeMute: [],
		AudioVolumeUp: [],
		AudioVolumeDown: [],
		NumpadComma: [],
		IntlRo: [],
		KanaMode: [],
		IntlYen: [],
		Convert: [],
		NonConvert: [],
		Lang1: [],
		Lang2: [],
		Lang3: [],
		Lang4: [],
		Lang5: [],
		NumpadParenLeft: [],
		NumpadParenRight: [],
		ControlLeft: [],
		ShiftLeft: [],
		AltLeft: [],
		MetaLeft: [],
		ControlRight: [],
		ShiftRight: [],
		AltRight: ['\r', '\r', '\r', '\r', 0],
		MetaRight: ['.', '.', '.', '.', 0],
		BrightnessUp: [],
		BrightnessDown: [],
		MediaPlay: [],
		MediaRecord: [],
		MediaFastForward: [],
		MediaRewind: [],
		MediaTrackNext: [],
		MediaTrackPrevious: [],
		MediaStop: [],
		Eject: [],
		MediaPlayPause: [],
		MediaSelect: [],
		LaunchMail: [],
		LaunchApp2: [],
		LaunchApp1: [],
		SelectTask: [],
		LaunchScreenSaver: [],
		BrowserSearch: [],
		BrowserHome: [],
		BrowserBack: [],
		BrowserForward: [],
		BrowserStop: [],
		BrowserRefresh: [],
		BrowserFavorites: [],
		MailReply: [],
		MailForward: [],
		MailSend: []
	}
});
