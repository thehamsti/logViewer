import { Window as TauriWindow } from '@tauri-apps/api/window';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import type { WebviewOptions } from '@tauri-apps/api/webview';
import type { WindowOptions } from '@tauri-apps/api/window';

type WebviewWindowOptions = Omit<WebviewOptions, 'width' | 'height' | 'x' | 'y'> & WindowOptions;

/**
 * Sanitizes a filename by removing special characters and spaces
 * @param fileName The filename to sanitize
 * @returns The sanitized filename
 */
export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9]/g, '_');
}

/**
 * Checks if a window exists by label
 * @param label The label of the window to check
 * @returns True if the window exists, false otherwise
 */
export async function windowExists(label: string): Promise<boolean> {
  const window = await TauriWindow.getByLabel(label);
  return window !== null;
}

/**
 * Closes a window by label
 * @param label The label of the window to close
 */
export async function closeWindow(label: string): Promise<void> {
  const window = await TauriWindow.getByLabel(label);
  if (window) {
    await window.close();
    console.log(`Window with label ${label} closed`);
  } else {
    throw new Error(`Window with label ${label} not found`);
  }
}

/**
 * Gets the current window
 * @returns The current window
 */
export async function getCurrentWindow(): Promise<TauriWindow | null> {
  return await TauriWindow.getCurrent();
}

/**
 * Gets a window by label
 * @param label The label of the window to get
 * @returns The window
 */
export async function getWindowByLabel(label: string): Promise<TauriWindow | null> {
  return await TauriWindow.getByLabel(label);
}

/**
 * Creates a new window
 * @param label The label of the window to create
 * @param options The options for the window
 * @returns The new window
 */
export async function createWindow(label: string, options: WebviewWindowOptions): Promise<WebviewWindow> {
  const newWindow = new WebviewWindow(label, options);
  return newWindow;
}

// Check and create a window if it doesn't exist
export async function checkAndCreateWindow(label: string, options: WebviewWindowOptions): Promise<WebviewWindow> {
  if (!(await windowExists(label))) {
    return await createWindow(label, options);
  }
  const window = await getWindowByLabel(label);
  if (!window) {
    throw new Error(`Window with label ${label} not found`);
  }
  return window as WebviewWindow;
}
