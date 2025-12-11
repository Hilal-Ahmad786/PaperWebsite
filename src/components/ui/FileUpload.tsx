'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
    Upload,
    X,
    FileText,
    Image as ImageIcon,
    FileSpreadsheet,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    maxFiles?: number;
    maxSize?: number; // in MB
    onUpload: (files: File[]) => Promise<void>;
}

interface FileStatus {
    file: File;
    progress: number;
    error?: string;
    status: 'pending' | 'uploading' | 'completed' | 'error';
}

export function FileUpload({
    maxFiles = 5,
    maxSize = 5,
    onUpload
}: FileUploadProps) {
    const t = useTranslations();
    const [files, setFiles] = useState<FileStatus[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        // Check size
        if (file.size > maxSize * 1024 * 1024) {
            return t('upload.error.size', { size: maxSize });
        }

        // Check type
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!validTypes.includes(file.type)) {
            return t('upload.error.type');
        }

        return null;
    };

    const handleFiles = async (newFiles: File[]) => {
        const remainingSlots = maxFiles - files.length;
        const filesToProcess = newFiles.slice(0, remainingSlots);

        const newFileStatuses: FileStatus[] = filesToProcess.map(file => ({
            file,
            progress: 0,
            status: 'pending',
            error: validateFile(file) || undefined
        }));

        setFiles(prev => [...prev, ...newFileStatuses]);

        // Simulate upload for valid files
        for (let i = 0; i < newFileStatuses.length; i++) {
            const fileStatus = newFileStatuses[i];
            if (!fileStatus.error) {
                await simulateUpload(fileStatus.file);
            }
        }

        // Notify parent of valid uploaded files
        const validFiles = [...files, ...newFileStatuses]
            .filter(f => f.status === 'completed')
            .map(f => f.file);

        if (validFiles.length > 0) {
            onUpload(validFiles);
        }
    };

    const simulateUpload = async (file: File) => {
        setFiles(prev => prev.map(f =>
            f.file === file ? { ...f, status: 'uploading' } : f
        ));

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            setFiles(prev => prev.map(f =>
                f.file === file ? { ...f, progress } : f
            ));
        }

        setFiles(prev => prev.map(f =>
            f.file === file ? { ...f, status: 'completed' } : f
        ));
    };

    const removeFile = (fileToRemove: File) => {
        setFiles(prev => prev.filter(f => f.file !== fileToRemove));
    };

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files?.length) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    }, [files.length, maxFiles]);

    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-400" />;
        if (type.includes('image')) return <ImageIcon className="w-8 h-8 text-blue-400" />;
        if (type.includes('sheet')) return <FileSpreadsheet className="w-8 h-8 text-green-400" />;
        return <FileText className="w-8 h-8 text-text-secondary" />;
    };

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
                    isDragging
                        ? "border-brand-primary bg-brand-primary/10"
                        : "border-border-primary bg-background-tertiary hover:border-brand-primary/50",
                    files.length >= maxFiles && "opacity-50 cursor-not-allowed"
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    disabled={files.length >= maxFiles}
                    onChange={(e) => {
                        if (e.target.files?.length) {
                            handleFiles(Array.from(e.target.files));
                        }
                    }}
                    accept=".pdf,.jpg,.jpeg,.png,.xlsx"
                />

                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-background-secondary flex items-center justify-center">
                        <Upload className={cn(
                            "w-6 h-6",
                            isDragging ? "text-brand-primary" : "text-text-secondary"
                        )} />
                    </div>
                    <div>
                        <p className="text-text-primary font-medium">
                            {t('upload.dropzone.title')}
                        </p>
                        <p className="text-sm text-text-secondary mt-1">
                            {t('upload.dropzone.subtitle', { max: maxSize })}
                        </p>
                    </div>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-3">
                    {files.map((fileStatus, index) => (
                        <div
                            key={`${fileStatus.file.name}-${index}`}
                            className="bg-background-tertiary border border-border-primary rounded-lg p-3 flex items-center gap-4 group"
                        >
                            {/* Icon */}
                            <div className="shrink-0">
                                {getFileIcon(fileStatus.file.type)}
                            </div>

                            {/* Info & Progress */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-sm font-medium text-text-primary truncate pr-2">
                                        {fileStatus.file.name}
                                    </p>
                                    <button
                                        onClick={() => removeFile(fileStatus.file)}
                                        className="text-text-tertiary hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {fileStatus.error ? (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {fileStatus.error}
                                    </p>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="h-1 bg-background-primary rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-300",
                                                    fileStatus.status === 'completed' ? "bg-brand-primary" : "bg-blue-500"
                                                )}
                                                style={{ width: `${fileStatus.progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-text-tertiary">
                                            <span>{(fileStatus.file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            {fileStatus.status === 'completed' && (
                                                <span className="text-brand-primary flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    {t('upload.status.completed')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
