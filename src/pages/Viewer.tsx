import { useState, useEffect, useRef } from 'react';
import { LogTable } from '../components/LogTable';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Window as TauriWindow } from '@tauri-apps/api/window';
import { emit, listen } from '@tauri-apps/api/event';
import { handleFileOpen } from '../utils/fileHandling';

import { Header } from "@/components/Header"

interface LogData {
    headers: string[];
    rows: string[][];
    filePath: string;
}

type HotkeyHandler = (e: KeyboardEvent) => void;

function useHotkeys(hotkeys: [string, HotkeyHandler][]) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isMod = event.metaKey || event.ctrlKey;

            hotkeys.forEach(([combo, handler]) => {
                const key = combo.split('+')[1].toLowerCase();
                if (isMod && event.key.toLowerCase() === key) {
                    handler(event);
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hotkeys]);
}

export function Viewer() {
    const [headers, setHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<string[][]>([]);
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const setupListener = async () => {
            const currentWindow = await TauriWindow.getCurrent();
            const title = await currentWindow?.title();
            const sanitizedFileName = title?.split(' - ')[1];

            console.log('Listening for log-data event');
            console.log(`listening for log-data-${sanitizedFileName}`);
            const unlisten = await listen(`log-data-${sanitizedFileName}`, (event) => {
                const logData = event.payload as LogData;
                console.log('Received log-data event');
                console.log(logData);
                setHeaders(logData.headers);
                setRows(logData.rows);
                setLoading(false);
            });
            // Emit the log-data event
            await emit(`main-${sanitizedFileName}-ready`);
            return () => unlisten();
        };

        setupListener();
    }, []);

    const handleOpenFile = async () => {
        setLoading(true);
        try {
            const logData = await handleFileOpen();
            if (logData) {
                setHeaders(logData.headers);
                setRows(logData.rows);
                // Update the document title
                const sanitizedFileName = logData.filePath.split('/').pop();
                const windowTitle = `Log Viewer - ${sanitizedFileName}`;
                await TauriWindow.getCurrent()?.setTitle(windowTitle);
            }
        } catch (err) {
            console.error('Error handling file:', err);
            setError('Failed to open file');
        } finally {
            setLoading(false);
        }
    };

    useHotkeys([
        ['mod+F', (e) => {
            e.preventDefault();
            searchInputRef.current?.focus();
            searchInputRef.current?.select();
        }],
    ]);

    return (
        <div className="flex flex-col">
            <Header
                onOpenFile={handleOpenFile}
                searchTerm={searchTerm}
                onSearchChange={(value) => setSearchTerm(value)}
                searchInputRef={searchInputRef}
            />

            <main className="flex-1">
                {error ? (
                    <div className="p-4 text-destructive">
                        {error} wtf is happening
                    </div>
                ) : (
                    <ErrorBoundary>
                        <LogTable
                            headers={headers}
                            rows={rows}
                            searchTerm={searchTerm}
                            loading={loading}
                        />
                    </ErrorBoundary>
                )}
            </main>
        </div>
    );
}
