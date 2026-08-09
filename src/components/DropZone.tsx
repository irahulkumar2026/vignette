import React, { useState, useRef } from 'react';
import { importComicFileProgressive, type ParsedComicResult } from '../utils';
import { Upload, FileArchive, Loader2, AlertCircle, X } from 'lucide-react';
import { type ToastMessage } from './Toast';

interface DropZoneProps {
  isOpen?: boolean;
  onClose?: () => void;
  onImportSuccess?: (result: ParsedComicResult) => void;
  onShowToast?: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  isOpen = false,
  onClose,
  onImportSuccess,
  onShowToast,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [progressMsg, setProgressMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setErrorMsg(null);

    const fileList = Array.from(files);
    let importedCount = 0;
    let lastResult: ParsedComicResult | null = null;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setCurrentFile(file.name);
      setProgressMsg(`Importing ${i + 1} of ${fileList.length}...`);

      try {
        const { metadataResult } = await importComicFileProgressive(file, (imported, total) => {
          setProgressMsg(
            `File ${i + 1}/${fileList.length}: Page caching (${imported}/${total})`
          );
        });

        importedCount++;
        lastResult = metadataResult;

        if (onImportSuccess) {
          onImportSuccess(metadataResult);
        }
      } catch (err) {
        console.error(`Failed to import ${file.name}:`, err);
        setErrorMsg(
          err instanceof Error ? err.message : `Failed to parse ${file.name}`
        );
      }
    }

    setIsProcessing(false);
    setCurrentFile(null);
    setProgressMsg(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Trigger Android-style Vignette Toast Notification and close dialog immediately!
    if (importedCount > 0) {
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title:
            importedCount === 1
              ? `Imported "${lastResult?.metadata.title || 'Comic'}"`
              : `Imported ${importedCount} comics to library`,
          description: `${lastResult?.metadata.pageCount || 'Multiple'} pages • Caching in background`,
        });
      }

      // Close modal immediately!
      if (onClose) onClose();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 surface-overlay backdrop-blur-sm animate-fade-in select-none">
      <div className="surface-elevated max-w-lg w-full p-6 rounded-modal border border-vg-border-strong relative shadow-2xl">
        {/* Close Button */}
        {onClose && !isProcessing && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-button text-text-muted hover:text-text-primary hover:bg-vg-active transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Title */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-text-primary flex items-center space-x-2">
            <FileArchive className="w-5 h-5 text-accent-blue" />
            <span>Import Comic Archives</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Drag and drop <code>.cbz</code>, <code>.cbr</code>, <code>.zip</code>, or <code>.rar</code> files directly.
          </p>
        </div>

        {/* Drop Zone Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`p-8 rounded-card border-2 border-dashed transition-all duration-150 text-center cursor-pointer flex flex-col items-center justify-center min-h-[200px] ${
            isDragging
              ? 'border-accent-blue bg-accent-blue/10 scale-[0.99]'
              : 'border-vg-border-strong bg-vg-secondary hover:bg-vg-tertiary hover:border-text-secondary'
          } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".cbz,.cbr,.zip,.rar"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {isProcessing ? (
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="w-10 h-10 text-accent-blue animate-spin" />
              <div>
                <p className="text-sm font-semibold text-text-primary truncate max-w-xs">{currentFile}</p>
                <p className="text-xs text-text-secondary mt-1 font-mono">{progressMsg}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-vg-tertiary flex items-center justify-center text-accent-blue border border-vg-border">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Drop your comic files here
                </p>
                <p className="text-xs text-text-muted mt-1">
                  or <span className="text-accent-blue font-medium">browse files</span> (supports batch selection)
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                {['.cbz', '.cbr', '.zip', '.rar'].map((ext) => (
                  <span
                    key={ext}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-vg-tertiary text-text-secondary border border-vg-border"
                  >
                    {ext}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-button bg-accent-red/10 border border-accent-red/30 text-accent-red text-xs font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
