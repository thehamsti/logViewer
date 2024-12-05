import { CircleHelp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { SearchBar } from './SearchBar';
import { ErrorBoundary } from './ErrorBoundary';
import { ModeToggle } from './mode-toggle';

interface HeaderProps {
    onOpenFile?: () => void;
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    searchInputRef?: React.RefObject<HTMLInputElement>;
    disableFileOpen?: boolean;
    disableSearch?: boolean;
}

export function Header({ onOpenFile, searchTerm, onSearchChange, searchInputRef, disableFileOpen, disableSearch }: HeaderProps) {
    return (
        <header className="h-12 border-b sticky top-0 bg-background text-foreground z-10">
            <div className="h-full px-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {!disableFileOpen && (
                        <Button
                            variant="outline"
                            onClick={onOpenFile}
                            className="text-foreground"
                        >
                            Open file
                        </Button>
                    )}
                    {!disableSearch && (
                        <ErrorBoundary>
                            <SearchBar
                                value={searchTerm || ''}
                                onChange={onSearchChange || (() => { })}
                                ref={searchInputRef}
                            />
                        </ErrorBoundary>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    title="Settings"
                                    className="hover:bg-transparent text-foreground"
                                >
                                    <CircleHelp size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="flex flex-col gap-2">
                                    <span>Keyboard shortcuts</span>
                                    <ul className="flex flex-col gap-2">
                                        <li><span className="text-sm">⌘O - Open file</span></li>
                                        <li><span className="text-sm">⌘F - Find in log</span></li>
                                        <li><span className="text-sm">⌘J - Toggle theme</span></li>
                                    </ul>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </header>
    );
}
