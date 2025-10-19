
import React, { useCallback, useState } from 'react';
import { XCircleIcon } from '../icons/XCircleIcon';

interface FileUploadProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ selectedFile, onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const allowedExtensions = ['.pdf', '.docx', '.txt', '.md', '.pptx', '.xlsx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (allowedExtensions.includes(fileExtension)) {
        onFileSelect(file);
      } else {
        alert('Please select a supported file (PDF, DOCX, PPTX, XLSX, TXT, MD).');
        onFileSelect(null);
      }
    }
  };

  const resetFile = () => {
    onFileSelect(null);
  };

  const onDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);
  
  const onDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled) {
      handleFileChange(e.dataTransfer.files);
    }
  }, [disabled, handleFileChange]);

  if (selectedFile) {
    return (
      <div className="mt-4 p-3 sm:p-4 bg-gray-700/50 border border-gray-600 rounded-lg flex items-center justify-between gap-2">
        <p className="text-xs sm:text-sm text-cyan-300 font-medium truncate flex-1 min-w-0">{selectedFile.name}</p>
        <button onClick={resetFile} disabled={disabled} className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 flex-shrink-0">
          <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <label
        htmlFor="file-upload"
        className={`relative flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
          ${isDragging ? 'border-cyan-400 bg-gray-700/60 animate-pulse' : 'border-gray-600 bg-transparent hover:bg-gray-700/30'}
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center justify-center pt-4 pb-5 px-4 text-center">
           <svg className="w-6 h-6 sm:w-8 sm:h-8 mb-3 sm:mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
           <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-gray-400"><span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop</p>
           <p className="text-xs text-gray-500">PDF, DOCX, PPTX, XLSX, TXT, MD files</p>
        </div>
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          accept=".pdf,.docx,.txt,.md,.pptx,.xlsx"
          onChange={(e) => handleFileChange(e.target.files)} 
          disabled={disabled}
        />
      </label>
    </div>
  );
};

export default FileUpload;
