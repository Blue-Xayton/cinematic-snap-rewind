import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Image as ImageIcon, Video } from "lucide-react";
import { useState, useEffect } from "react";

interface MediaPreviewGalleryProps {
  files: File[];
  onRemove: (index: number) => void;
}

export const MediaPreviewGallery = ({ files, onRemove }: MediaPreviewGalleryProps) => {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    // Generate previews for images and videos
    const newPreviews = files.map((file) => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        return URL.createObjectURL(file);
      }
      return "";
    });

    setPreviews(newPreviews);

    // Cleanup URLs on unmount
    return () => {
      newPreviews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [files]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">
        Uploaded Files ({files.length})
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {files.map((file, index) => (
          <Card
            key={`${file.name}-${index}`}
            className="group relative overflow-hidden hover:shadow-lg transition-all animate-scale-in"
          >
            {/* Preview */}
            <div className="aspect-square bg-muted relative">
              {file.type.startsWith("image/") ? (
                <img
                  src={previews[index]}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : file.type.startsWith("video/") ? (
                <video
                  src={previews[index]}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {file.type.startsWith("image/") ? (
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  ) : (
                    <Video className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
              )}

              {/* Type Badge */}
              <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium">
                {file.type.startsWith("image/") ? "Image" : "Video"}
              </div>

              {/* Remove Button */}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>

            {/* File Info */}
            <div className="p-2 space-y-1">
              <p className="text-xs font-medium text-foreground truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
