import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { emit, listen } from '@tauri-apps/api/event';
import { checkAndCreateWindow, closeWindow } from './helper';

export interface LogData {
    headers: string[];
    rows: string[][];
    filePath: string;
}

export const handleFileOpen = async (filePath?: string): Promise<LogData | null> => {
    try {
        let selectedPath = filePath;

        if (!selectedPath) {
            const selected = await open({
                multiple: false,
                filters: [{
                    name: 'Log Files',
                    extensions: ['log']
                }]
            });

            if (selected && typeof selected === 'string') {
                selectedPath = selected;
                // Add to recent files
                const recentFiles: string[] = JSON.parse(localStorage.getItem('recentFiles') || '[]');
                const updatedFiles = [selected, ...recentFiles.filter((f: string) => f !== selected)].slice(0, 5);
                localStorage.setItem('recentFiles', JSON.stringify(updatedFiles));
            }
        }

        if (selectedPath) {
            const content = await readTextFile(selectedPath);
            const lines = content.split('\n').filter((line: string) => line.trim());

            if (lines.length > 0) {
                const headers = lines[0].split(' ').filter((header: string) => header.trim());
                const rows = lines.slice(1).map((line: string) =>
                    line.split(' ').filter((cell: string) => cell.trim())
                );

                const logData: LogData = {
                    headers,
                    rows,
                    filePath: selectedPath
                };

                sessionStorage.setItem('logData', JSON.stringify(logData));
                return logData;
            }
        }
        return null;
    } catch (err) {
        console.error('Error opening file:', err);
        return null;
    }
};

export const openViewerWindow = async (logData: LogData) => {
    try {
        const fileName = logData.filePath.split('/').pop() || 'log';
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_');

        const webview = await checkAndCreateWindow(`main-${sanitizedFileName}`, {
            url: '/viewer',
            title: `Log Viewer - ${sanitizedFileName}`,
            height: 800,
            width: 1200,
            minHeight: 600,
            minWidth: 800,
            resizable: true,
            center: true,
            decorations: true,
        });

        await webview.once('tauri://created', async () => {
            console.log('Viewer window created successfully');
        });

        // Listen for the main window to be ready
        const unlisten = await listen(`main-${sanitizedFileName}-ready`, async () => {
            console.log('Main window is ready');
            await emit(`log-data-${sanitizedFileName}`, logData);
            // Close the welcome window
            await closeWindow('welcome');
        });

        return () => unlisten()
    } catch (err) {
        console.error('Error managing windows:', err);
        throw err;
    }
}; 
