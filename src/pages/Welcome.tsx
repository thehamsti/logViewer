import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconFolderOpen, IconClock, IconArrowRight } from '@tabler/icons-react';
import { handleFileOpen, openViewerWindow } from '../utils/fileHandling';
import { ModeToggle } from '@/components/mode-toggle';

export function Welcome() {
    const [recentFiles, setRecentFiles] = useState<string[]>([]);

    useEffect(() => {
        // Load recent files from localStorage
        const savedFiles = localStorage.getItem('recentFiles');
        if (savedFiles) {
            setRecentFiles(JSON.parse(savedFiles));
        }
    }, []);

    const handleFileOpenClick = async (filePath?: string) => {
        try {
            const logData = await handleFileOpen(filePath);
            if (logData) {
                await openViewerWindow(logData);
            }
        } catch (err) {
            console.error('Error handling file:', err);
        }
    };

    return (
        <>
            <header className="fixed p-4 top-0 right-0 z-10 bg-background text-foreground">
                <ModeToggle />
            </header>
            <div className="min-h-screen w-full bg-background p-6 flex items-center justify-center">
                <Card className="w-[500px] p-8">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-2">
                            <h1 className="text-3xl font-bold">Welcome to Log Viewer</h1>
                            <p className="text-muted-foreground">A modern, fast log file viewer</p>
                        </div>

                        <Button
                            size="lg"
                            className="w-full"
                            onClick={() => handleFileOpenClick()}
                            data-action="open-file"
                        >
                            <IconFolderOpen className="mr-2 h-5 w-5" />
                            Open File
                        </Button>

                        {recentFiles.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-semibold">Recent Files</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            localStorage.removeItem('recentFiles');
                                            setRecentFiles([]);
                                        }}
                                    >
                                        Clear History
                                    </Button>
                                </div>
                                <ul className="flex flex-col gap-2">
                                    {recentFiles.map((file, index) => (
                                        <li key={index} className="flex items-center gap-2 w-full">
                                            <div className="bg-primary/10 p-1.5 rounded-full flex-shrink-0">
                                                <IconClock className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                                <span className="text-sm truncate">
                                                    {file}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex-shrink-0"
                                                    onClick={() => handleFileOpenClick(file)}
                                                >
                                                    Open
                                                    <IconArrowRight className="ml-2 h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </>
    );
}
