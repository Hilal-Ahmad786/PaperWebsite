'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    Search,
    Download,
    ChevronLeft,
    ChevronRight,
    Filter,
    MoreHorizontal,
    Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (row: T) => void;
    isLoading?: boolean;
}

export function DataTable<T extends { id: string | number } & Record<string, any>>({
    columns,
    data,
    onRowClick,
    isLoading = false
}: DataTableProps<T>) {
    const t = useTranslations();

    // State
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [globalFilter, setGlobalFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

    // Sorting
    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filtering & Sorting Logic
    const processedData = useMemo(() => {
        let result = [...data];

        // Global Filter
        if (globalFilter) {
            const lowerFilter = globalFilter.toLowerCase();
            result = result.filter((row) =>
                Object.values(row).some((val) =>
                    String(val).toLowerCase().includes(lowerFilter)
                )
            );
        }

        // Column Filters
        Object.keys(filters).forEach((key) => {
            const filterValue = filters[key].toLowerCase();
            if (filterValue) {
                result = result.filter((row) =>
                    String(row[key]).toLowerCase().includes(filterValue)
                );
            }
        });

        // Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, globalFilter, filters, sortConfig]);

    // Pagination Logic
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const paginatedData = processedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Selection Logic
    const toggleSelectAll = () => {
        if (selectedRows.size === paginatedData.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(paginatedData.map((row) => row.id)));
        }
    };

    const toggleSelectRow = (id: string | number) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = columns.map((col) => col.label).join(',');
        const rows = processedData.map((row) =>
            columns.map((col) => {
                const val = row[col.key as string];
                return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
            }).join(',')
        );
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'export.csv';
        link.click();
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <input
                        type="text"
                        placeholder={t('datatable.search')}
                        className="w-full bg-background-tertiary border border-border-primary rounded-md pl-10 pr-4 py-2 text-sm text-text-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={exportToCSV} className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('datatable.export')}</span>
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-background-secondary border border-border-primary rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background-tertiary border-b border-border-primary">
                                <th className="p-4 w-12">
                                    <input
                                        type="checkbox"
                                        className="rounded border-border-primary bg-background-primary text-brand-primary focus:ring-brand-primary"
                                        checked={paginatedData.length > 0 && selectedRows.size === paginatedData.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                {columns.map((col) => (
                                    <th
                                        key={String(col.key)}
                                        className={cn(
                                            "p-4 text-xs font-bold text-text-secondary uppercase tracking-wider select-none",
                                            col.sortable && "cursor-pointer hover:text-brand-primary transition-colors"
                                        )}
                                        onClick={() => col.sortable && handleSort(String(col.key))}
                                    >
                                        <div className="flex items-center gap-2">
                                            {col.label}
                                            {col.sortable && (
                                                <span className="text-text-tertiary">
                                                    {sortConfig?.key === col.key ? (
                                                        sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                    ) : (
                                                        <ChevronsUpDown className="w-3 h-3 opacity-50" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-primary">
                            {isLoading ? (
                                // Skeleton Loading
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-4 w-4 bg-background-tertiary rounded" /></td>
                                        {columns.map((_, j) => (
                                            <td key={j} className="p-4"><div className="h-4 bg-background-tertiary rounded w-3/4" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : paginatedData.length === 0 ? (
                                // Empty State
                                <tr>
                                    <td colSpan={columns.length + 1} className="p-12 text-center text-text-tertiary">
                                        <div className="flex flex-col items-center gap-2">
                                            <Filter className="w-8 h-8 opacity-50" />
                                            <p>{t('datatable.noData')}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                // Data Rows
                                paginatedData.map((row, index) => (
                                    <tr
                                        key={row.id}
                                        className={cn(
                                            "group transition-colors hover:bg-white/5",
                                            index % 2 === 0 ? "bg-transparent" : "bg-background-tertiary/30",
                                            selectedRows.has(row.id) && "bg-brand-primary/10"
                                        )}
                                        onClick={() => onRowClick?.(row)}
                                    >
                                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="rounded border-border-primary bg-background-primary text-brand-primary focus:ring-brand-primary"
                                                checked={selectedRows.has(row.id)}
                                                onChange={() => toggleSelectRow(row.id)}
                                            />
                                        </td>
                                        {columns.map((col) => (
                                            <td key={String(col.key)} className="p-4 text-sm text-text-primary font-mono">
                                                {col.render ? col.render(row[col.key as string], row) : row[col.key as string]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-border-primary flex flex-col sm:flex-row justify-between items-center gap-4 bg-background-tertiary">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <span>{t('datatable.rowsPerPage')}</span>
                        <select
                            className="bg-background-secondary border border-border-primary rounded px-2 py-1 focus:border-brand-primary outline-none"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            {[10, 25, 50, 100].map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        <span className="hidden sm:inline">
                            {t('datatable.showing', {
                                start: (currentPage - 1) * itemsPerPage + 1,
                                end: Math.min(currentPage * itemsPerPage, processedData.length),
                                total: processedData.length
                            })}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-text-primary font-mono">
                            {currentPage} / {totalPages || 1}
                        </span>
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
