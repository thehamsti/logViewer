import { ErrorBoundary } from './components/ErrorBoundary';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Welcome } from './pages/Welcome';
import { Viewer } from './pages/Viewer';
import { listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';
import { ThemeProvider, useTheme } from './components/theme-provider';
import './App.css';
import { handleFileOpen, openViewerWindow } from './utils/fileHandling';

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

// Separate component for routes that can use router hooks
function AppRoutes() {
    const { theme, setTheme } = useTheme();

    const navigate = useNavigate();

    useEffect(() => {
        // Listen for navigation events
        const unlisten = listen('navigate-to-viewer', () => {
            navigate('/viewer');
        });

        return () => {
            unlisten.then(fn => fn()); // Cleanup listener
        };
    }, [navigate]);

    const handleFileOpenClick = async (filePath?: string) => {
        try {
            console.log('handleFileOpenClick', filePath);
            const logData = await handleFileOpen(filePath);
            if (logData) {
                await openViewerWindow(logData);
            }
        } catch (err) {
            console.error('Error handling file:', err);
        }
    };

    // on file-open event, open the file
    useEffect(() => {
        const unlisten = listen('file-open', async () => {
            await handleFileOpenClick();
        });

        return () => {
            unlisten.then(fn => fn()); // Cleanup listener
        };
    }, [handleFileOpenClick]);


    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    useHotkeys([
        ['mod+O', (_e) => handleFileOpenClick()],
        ['mod+J', toggleTheme],
    ]);

    return (
        <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/viewer" element={<Viewer />} />
            <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <>
            <ThemeProvider defaultTheme="auto">
                <ErrorBoundary>
                    <BrowserRouter>
                        <AppRoutes />
                    </BrowserRouter>
                </ErrorBoundary>
            </ThemeProvider>
        </>
    );
}

export default App;
