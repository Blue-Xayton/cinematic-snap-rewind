import { useState, useEffect } from "react";
import { FileVideo, FileImage, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface FileUploadItemProps {
  file: File;
  index: number;
  onRemove: (index: number) => void;
  title?: string; // optional custom title for reel
  onVideoReady?: (videoUrl: string) => void; // callback when backend returns video path
}

type ValidationStatus = "validating" | "valid" | "invalid" | "uploading";

interface ValidationResult {
  status: ValidationStatus;
  error?: string;
  size?: string;
  duration?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export const FileUploadItem = ({ file, index, onRemove, title = "My Reel", onVideoReady }: FileUploadItemProps) => {
  const [validation, setValidation] = useState<ValidationResult>({ status: "validating" });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    validateFile();
  }, [file]);

  const validateFile = async () => {
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
    const validVideoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
    const isValidType = [...validImageTypes, ...validVideoTypes].includes(file.type);

    if (!isValidType) {
      setValidation({
        status: "invalid",
        error: "Unsupported file type. Use JPG, PNG, MP4, or MOV.",
        size: formatFileSize(file.size),
      });
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100 MB
    if (file.size > maxSize) {
      setValidation({
        status: "invalid",
        error: "File too large. Max size is 100MB.",
        size: formatFileSize(file.size),
      });
      return;
    }

    // For videos, try to get duration
    if (file.type.startsWith("video/")) {
      try {
        const duration = await getVideoDuration(file);
        setValidation({
          status: "valid",
          size: formatFileSize(file.size),
          duration: `${duration.toFixed(1)}s`,
        });
      } catch {
        setValidation({
          status: "valid",
          size: formatFileSize(file.size),
        });
      }
    } else {
      setValidation({
        status: "valid",
        size: formatFileSize(file.size),
      });
    }

    // After validation, start uploading
    if (validation.status === "valid") {
      uploadFileToBackend(file);
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => reject();
      video.src = URL.createObjectURL(file);
    });
  };

  const uploadFileToBackend = async (file: File) => {
    setValidation((prev) => ({ ...prev, status: "uploading" }));
    const formData = new FormData();
    formData.append("files", file);
    formData.append("title", title);

    try {
      const res = await fetch("https://sporular-georgiana-anacoluthically.ngrok-free.dev/upload/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("Upload failed:", errData);
        setValidation((prev) => ({ ...prev, status: "invalid", error: "Upload failed" }));
        return;
      }

      const data = await res.json();
      console.log("Upload success:", data);

      setProgress(100);
      setValidation((prev) => ({ ...prev, status: "valid" }));

      if (onVideoReady && data.output_video) {
        onVideoReady(`https://sporular-georgiana-anacoluthically.ngrok-free.dev${data.output_video}`);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setValidation((prev) => ({ ...prev, status: "invalid", error: "Upload error" }));
    }
  };

  const getStatusIcon = () => {
    switch (validation.status) {
      case "validating":
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case "valid":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "invalid":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (validation.status) {
      case "validating":
        return (
          <Badge variant="outline" className="bg-muted/50">
            Validating
          </Badge>
        );
      case "valid":
        return <Badge className="bg-green-500/20 text-green-500">Ready</Badge>;
      case "invalid":
        return <Badge variant="destructive">Invalid</Badge>;
      case "uploading":
        return <Badge className="bg-blue-500/20 text-blue-500">Uploading</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="group rounded-lg border border-border bg-card/50 p-3 transition-all hover:bg-card hover:shadow-elegant">
      <div className="flex items-start gap-3">
        {/* File icon */}
        <div className="mt-0.5">
          {file.type.startsWith("image/") ? (
            <FileImage className="h-5 w-5 text-accent" />
          ) : (
            <FileVideo className="h-5 w-5 text-primary" />
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                {validation.size && <span>{validation.size}</span>}
                {validation.duration && (
                  <>
                    <span>•</span>
                    <span>{validation.duration}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusIcon()}
              {getStatusBadge()}
            </div>
          </div>

          {/* Progress bar */}
          {(validation.status === "uploading" || validation.status === "validating") && (
            <Progress value={progress} className="h-1 mt-2" />
          )}

          {/* Error message */}
          {validation.status === "invalid" && validation.error && (
            <p className="text-xs text-destructive mt-1">{validation.error}</p>
          )}
        </div>

        {/* Remove button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
