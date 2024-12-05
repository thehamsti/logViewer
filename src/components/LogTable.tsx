import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    IconColumns,
    IconSortAscending,
    IconSortDescending,
    IconLetterCase,
} from "@tabler/icons-react";

interface LogTableProps {
    headers: string[];
    rows: string[][];
    searchTerm: string;
    loading?: boolean;
}

interface ColumnWidth {
    [key: number]: number;
}

const LOG_LEVEL_COLORS = {
    ERROR: "text-red-500 dark:text-red-400",
    WARN: "text-yellow-500 dark:text-yellow-400",
    INFO: "text-blue-500 dark:text-blue-400",
    DEBUG: "text-gray-500 dark:text-gray-400"
};

export function LogTable(
    { headers, rows, searchTerm, loading = false }: LogTableProps,
) {
    const [sortConfig, setSortConfig] = useState<{
        key: number;
        direction: "asc" | "desc" | null;
    }>({ key: -1, direction: null });
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [columnWidths, setColumnWidths] = useState<ColumnWidth>({});
    const [resizing, setResizing] = useState<number | null>(null);
    const tableRef = useRef<HTMLTableElement>(null);
    const [visibleColumns, setVisibleColumns] = useState<boolean[]>(
        new Array(headers.length).fill(true),
    );
    const [activeSearchTerm, setActiveSearchTerm] = useState<string>("");
    const [caseSensitive, setCaseSensitive] = useState(false);

    useEffect(() => {
        setVisibleColumns(new Array(headers.length).fill(true));
    }, [headers]);


    useEffect(() => {
        setActiveSearchTerm(searchTerm);
    }, [searchTerm]);

    const handleSort = (columnIndex: number) => {
        let direction: "asc" | "desc" | null = "asc";

        if (sortConfig.key === columnIndex) {
            if (sortConfig.direction === "asc") direction = "desc";
            else if (sortConfig.direction === "desc") direction = null;
        }

        setSortConfig({ key: columnIndex, direction });
    };

    const handleRowClick = (rowIndex: number) => {
        setExpandedRow(expandedRow === rowIndex ? null : rowIndex);
    };

    const startResizing = useCallback((index: number) => {
        setResizing(index);
    }, []);

    const stopResizing = useCallback(() => {
        setResizing(null);
    }, []);

    const resize = useCallback((e: MouseEvent) => {
        if (resizing === null || !tableRef.current) return;

        const table = tableRef.current;
        const tableRect = table.getBoundingClientRect();
        const minWidth = 100;
        const maxWidth = tableRect.width - (headers.length - 1) * minWidth;

        const newWidth = Math.max(
            minWidth,
            Math.min(maxWidth, e.clientX - tableRect.left - resizing * minWidth),
        );

        setColumnWidths((prev) => ({
            ...prev,
            [resizing]: newWidth,
        }));
    }, [resizing, headers.length]);

    useEffect(() => {
        if (resizing !== null) {
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResizing);

            return () => {
                window.removeEventListener("mousemove", resize);
                window.removeEventListener("mouseup", stopResizing);
            };
        }
    }, [resizing, resize, stopResizing]);

    const toggleColumn = (index: number) => {
        setVisibleColumns((prev) => {
            const newVisible = [...prev];
            newVisible[index] = !newVisible[index];
            if (newVisible.every((v) => !v)) {
                newVisible[index] = true;
            }
            return newVisible;
        });
    };

    const columnVisibilityMenu = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto hover:bg-muted"
                    title="Show/Hide Columns"
                >
                    <IconColumns className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-semibold">
                    Toggle Columns
                </DropdownMenuLabel>
                {headers.map((header, index) => (
                    <DropdownMenuItem
                        key={index}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleColumn(index);
                        }}
                    >
                        <div className="flex items-center gap-2 w-full">
                            <Checkbox
                                checked={visibleColumns[index]}
                                id={`column-${index}`}
                            />
                            <label
                                htmlFor={`column-${index}`}
                                className="flex-1 cursor-pointer"
                            >
                                {header}
                            </label>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    if (loading) {
        return (
            <div className="p-8 space-y-6">
                {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <div className="h-6 bg-muted animate-pulse rounded w-1/4" />
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4 opacity-70" />
                    </div>
                ))}
            </div>
        );
    }

    if (!rows || rows.length === 0) {
        return (
            <div className="h-[calc(100vh-48px)] flex flex-col items-center justify-center p-8 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                    <IconColumns className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No Logs Available</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                    There are no logs to display. Try opening a different log file or
                    checking the file contents.
                </p>
            </div>
        );
    }

    const sortedAndFilteredRows = [...rows]
        .filter((row) => {
            if (!activeSearchTerm) return true;
            try {
                const regex = new RegExp(activeSearchTerm, caseSensitive ? '' : 'i');
                return row.some(cell => regex.test(cell));
            } catch (e) {
                // If regex is invalid, fall back to normal string search
                return row.some(cell =>
                    caseSensitive
                        ? cell.includes(activeSearchTerm)
                        : cell.toLowerCase().includes(activeSearchTerm.toLowerCase())
                );
            }
        })
        .sort((a, b) => {
            if (sortConfig.direction === null || sortConfig.key === -1) return 0;

            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (sortConfig.direction === "asc") {
                return aValue.localeCompare(bValue);
            }
            return bValue.localeCompare(aValue);
        });

    if (sortedAndFilteredRows.length === 0) {
        return (
            <div className="h-[calc(100vh-48px)] flex flex-col items-center justify-center p-8 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                    <IconColumns className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No Matching Logs</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                    No logs match your search criteria. Try adjusting your search term or
                    filters.
                </p>
            </div>
        );
    }

    const getLogLevelColor = (text: string) => {
        for (const [level, color] of Object.entries(LOG_LEVEL_COLORS)) {
            if (text.includes(level)) {
                return color;
            }
        }
        return "";
    };

    return (
        <>
            <div className="flex items-center justify-end gap-2 p-2 border-b bg-background">
                {/* <Button */}
                {/*     variant="ghost" */}
                {/*     size="sm" */}
                {/*     className="hover:bg-muted" */}
                {/*     onClick={() => setCaseSensitive(!caseSensitive)} */}
                {/*     title={`Case ${caseSensitive ? 'Sensitive' : 'Insensitive'} Search`} */}
                {/* > */}
                {/*     <IconLetterCase className={`h-4 w-4 ${caseSensitive ? 'text-primary' : ''}`} /> */}
                {/* </Button> */}
                {columnVisibilityMenu}
            </div>
            <ScrollArea className="p-4" style={{ height: `calc(100vh - 120px)` }}>
                <Table ref={tableRef} className="relative">
                    <TableHeader className="sticky top-0 z-10 bg-background">
                        <TableRow>
                            {headers.map((header, index) => (
                                visibleColumns[index] && (
                                    <TableHead
                                        key={index}
                                        className="relative cursor-pointer select-none transition-colors hover:bg-muted/50"
                                        style={{
                                            width: columnWidths[index] || "auto",
                                        }}
                                        onClick={() => handleSort(index)}
                                    >
                                        <div className="flex items-center justify-between gap-2 py-1">
                                            <span className="font-semibold text-sm text-foreground">
                                                {header}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {sortConfig.key === index && sortConfig.direction && (
                                                    sortConfig.direction === "asc"
                                                        ? (
                                                            <IconSortAscending className="h-4 w-4 text-primary" />
                                                        )
                                                        : (
                                                            <IconSortDescending className="h-4 w-4 text-primary" />
                                                        )
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                startResizing(index);
                                            }}
                                            className={`absolute right-0 top-0 h-full w-1 cursor-col-resize transition-colors ${resizing === index
                                                ? "bg-primary"
                                                : "hover:bg-primary/50"
                                                }`}
                                        />
                                    </TableHead>
                                )
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedAndFilteredRows.map((row, rowIndex) => (
                            <React.Fragment key={rowIndex}>
                                <TableRow
                                    className="cursor-pointer transition-colors hover:bg-muted/50"
                                    onClick={() =>
                                        handleRowClick(rowIndex)}
                                    data-selected={expandedRow === rowIndex}
                                >
                                    {row.map((cell, cellIndex) => (
                                        visibleColumns[cellIndex] && (
                                            <TableCell
                                                key={cellIndex}
                                                style={{
                                                    width: columnWidths[cellIndex] || "auto",
                                                    maxWidth: columnWidths[cellIndex] || "auto",
                                                }}
                                                className={`truncate text-sm ${getLogLevelColor(cell)}`}
                                            >
                                                {activeSearchTerm
                                                    ? (
                                                        highlightSearchTerm(cell, activeSearchTerm, caseSensitive)
                                                    )
                                                    : cell}
                                            </TableCell>
                                        )
                                    ))}
                                </TableRow>
                                {expandedRow === rowIndex && (
                                    <TableRow>
                                        <TableCell colSpan={headers.length} className="p-0">
                                            <Card className="rounded-none border-x-0 shadow-none">
                                                <div className="space-y-4 p-6">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-lg text-foreground">
                                                            Detailed Log Entry
                                                        </span>
                                                        <Badge variant="secondary" className="text-xs">
                                                            Row {rowIndex + 1}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {headers.map((header, index) => (
                                                            <div key={index} className="space-y-1">
                                                                <span className="text-sm font-medium text-muted-foreground">
                                                                    {header}
                                                                </span>
                                                                <p className={`break-words ${getLogLevelColor(row[index])}`}>
                                                                    {activeSearchTerm
                                                                        ? (
                                                                            highlightSearchTerm(
                                                                                row[index],
                                                                                activeSearchTerm,
                                                                                caseSensitive,
                                                                            )
                                                                        )
                                                                        : (
                                                                            row[index]
                                                                        )}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </Card>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </>
    );
}
function highlightSearchTerm(text: string, searchTerm: string, caseSensitive: boolean) {
    if (!searchTerm) return text;

    try {
        const regex = new RegExp(`(${searchTerm})`, caseSensitive ? 'g' : 'gi');
        const parts = text.split(regex);
        return (
            <>
                {parts.map((part, i) => {
                    try {
                        if (part.match(new RegExp(searchTerm, caseSensitive ? '' : 'i'))) {
                            return (
                                <span
                                    key={i}
                                    className="bg-yellow-200 dark:bg-yellow-900 px-1 rounded"
                                >
                                    {part}
                                </span>
                            );
                        }
                    } catch (e) {
                        // If regex is invalid, fall back to exact match
                        if (caseSensitive ? part === searchTerm : part.toLowerCase() === searchTerm.toLowerCase()) {
                            return (
                                <span
                                    key={i}
                                    className="bg-yellow-200 dark:bg-yellow-900 px-1 rounded"
                                >
                                    {part}
                                </span>
                            );
                        }
                    }
                    return part;
                })}
            </>
        );
    } catch (e) {
        // If regex is invalid, fall back to normal string search
        const parts = text.split(new RegExp(`(${searchTerm})`, caseSensitive ? 'g' : 'gi'));
        return (
            <>
                {parts.map((part, i) =>
                    (caseSensitive ? part === searchTerm : part.toLowerCase() === searchTerm.toLowerCase())
                        ? (
                            <span
                                key={i}
                                className="bg-yellow-200 dark:bg-yellow-900 px-1 rounded"
                            >
                                {part}
                            </span>
                        )
                        : part
                )}
            </>
        );
    }
}

