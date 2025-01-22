import { Plugin, Notice } from "obsidian";
import { BrowserWindow } from "electron";

const className = "sidebar-vibrancy";

const setVibrancyFailedMsg =
	"Failed to update the vibrancy value, are you on the right platform?";

function hasTranslucentClass() {
	return document.body.hasClass("is-translucent");
}

function setVibrancy(
	electronWindow: Electron.BrowserWindow | undefined,
	vibrancy: "under-window" | null = "under-window",
) {
	const { platform } = globalThis.process;
	if (!electronWindow || platform !== "darwin") {
		return false;
	}

	electronWindow.setBackgroundColor("#00000000");
	if (!hasTranslucentClass()) {
		electronWindow.setVibrancy(vibrancy);
	}
	return true;
}

function enable(electronWindow: Electron.BrowserWindow | undefined) {
	if (!setVibrancy(electronWindow)) {
		console.warn(setVibrancyFailedMsg);
	}
	document.body.addClass(className);
}

function disable(electronWindow: Electron.BrowserWindow | undefined) {
	if (!setVibrancy(electronWindow, null)) {
		return;
	}
	document.body.removeClass(className);
}

function checkForTranslucentWindowOpt() {
	if (!hasTranslucentClass()) {
		return;
	}
	const msg =
		'The "Translucent window" option appears to be enabled, please disable it and restart the plugin';
	new Notice(msg);
	throw new Error(msg);
}

export default class SidebarVibrancy extends Plugin {
	private electronWindow?: BrowserWindow;
	async onload() {
		checkForTranslucentWindowOpt();
		this.electronWindow = globalThis
			.require("electron")
			// @ts-ignore
			.remote.getCurrentWindow() as BrowserWindow;

		enable(this.electronWindow);
	}

	onunload() {
		disable(this.electronWindow);
	}
}
