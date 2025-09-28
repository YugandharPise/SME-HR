import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { StockRowData } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Trash2, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockRowProps {
  rowData: StockRowData;
  onDelete: (id: string) => void;
  onUpdate: (id: string, field: keyof Omit<StockRowData, 'id' | 'images'>, value: string) => void;
  onFilesChange: (id: string, files: File[]) => void;
  hasError: boolean;
}

export function StockRow({ rowData, onDelete, onUpdate, onFilesChange, hasError }: StockRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onFilesChange(rowData.id, [...rowData.images, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...rowData.images];
    newFiles.splice(index, 1);
    onFilesChange(rowData.id, newFiles);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      onFilesChange(rowData.id, [...rowData.images, ...newFiles]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="flex items-start space-x-2 p-2 rounded-lg hover:bg-muted">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 flex-grow">
        <Input
          placeholder="Stock ISIN"
          value={rowData.isin}
          onChange={(e) => onUpdate(rowData.id, 'isin', e.target.value)}
          className={cn(hasError && !rowData.isin ? 'border-red-500 focus-visible:ring-red-500' : '')}
        />
        <Input
          placeholder="Stock Code"
          value={rowData.code}
          onChange={(e) => onUpdate(rowData.id, 'code', e.target.value)}
          className={cn(hasError && !rowData.code ? 'border-red-500 focus-visible:ring-red-500' : '')}
        />
        <Input
          placeholder="Comment"
          value={rowData.comment}
          onChange={(e) => onUpdate(rowData.id, 'comment', e.target.value)}
        />
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-2 flex flex-col items-center justify-center text-sm text-muted-foreground cursor-pointer h-full min-h-[36px] transition-colors',
            isDragging ? 'border-primary bg-primary/10' : 'border-input'
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,application/pdf"
          />
          {rowData.images.length === 0 ? (
            <div className="flex items-center space-x-2">
              <UploadCloud className="h-4 w-4" />
              <span>Images</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {rowData.images.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="text-xs bg-muted px-2 py-1 rounded-full flex items-center">
                    <span>{file.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      className="ml-1 opacity-50 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => onDelete(rowData.id)} className="shrink-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete Row</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
