"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileSpreadsheet,
  FileText,
  File,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FileUploadZoneProps {
  strategyId: string;
  brandName: string;
  sector: string;
  onUploadComplete: (result: ImportResult) => void;
  onError: (error: string) => void;
}

export interface ImportResult {
  importedFileId?: string;
  fileName: string;
  metadata?: {
    fileName: string;
    fileType: string;
    wordCount: number;
    pageCount?: number;
  };
  mappedVariables: Record<string, string>;
  confidence: number;
  unmappedVariables: string[];
}

const ACCEPTED_EXTENSIONS = [".xlsx", ".docx", ".pdf"];
const ACCEPT_STRING =
  ".xlsx,.docx,.pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf";
const MAX_SIZE_MB = 10;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FileUploadZone({
  strategyId,
  brandName,
  sector,
  onUploadComplete,
  onError,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSetFile(file);
    },
    [],
  );

  const validateAndSetFile = (file: File) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      onError(
        `Format non supporté (${ext}). Formats acceptés : ${ACCEPTED_EXTENSIONS.join(", ")}`,
      );
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onError(`Le fichier dépasse ${MAX_SIZE_MB} Mo`);
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress("Envoi du fichier...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("strategyId", strategyId);
      formData.append("brandName", brandName);
      formData.append("sector", sector);

      setUploadProgress("Extraction du texte...");

      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Erreur lors de l'import";
        try {
          const data = (await response.json()) as { error?: string };
          errorMessage = data.error ?? errorMessage;
        } catch {
          // Response was not JSON (e.g. HTML error page)
          errorMessage = `Erreur serveur (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      setUploadProgress("Mapping IA des variables...");

      const result = (await response.json()) as ImportResult;
      onUploadComplete(result);
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Erreur lors de l'import",
      );
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
      case "docx":
      case "doc":
        return <FileText className="h-8 w-8 text-blue-600" />;
      case "pdf":
        return <File className="h-8 w-8 text-red-600" />;
      default:
        return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {!selectedFile && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          }`}
        >
          <Upload
            className={`mb-4 h-12 w-12 ${isDragOver ? "text-primary" : "text-muted-foreground"}`}
          />
          <p className="mb-1 text-lg font-medium">
            Glissez-déposez votre fichier ici
          </p>
          <p className="text-sm text-muted-foreground">
            ou cliquez pour sélectionner
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Formats acceptés : Excel (.xlsx), Word (.docx), PDF (.pdf) — Max{" "}
            {MAX_SIZE_MB} Mo
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_STRING}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Selected file preview */}
      {selectedFile && (
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            {getFileIcon(selectedFile.name)}
            <div className="flex-1">
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            {!isUploading && (
              <Button variant="ghost" size="icon" onClick={removeFile}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload button */}
      {selectedFile && (
        <div className="flex items-center gap-4">
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadProgress}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importer et analyser
              </>
            )}
          </Button>
        </div>
      )}

      {/* Upload progress detail */}
      {isUploading && (
        <p className="text-center text-sm text-muted-foreground">
          L&apos;IA analyse le contenu du fichier et mappe les informations aux
          variables ADVERTIS. Cela peut prendre 30 à 60 secondes...
        </p>
      )}
    </div>
  );
}
