import { useState, ChangeEvent } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Upload, Video, Loader2 } from 'lucide-react';
import { toast } from './ui/use-toast';

// Define the backend response type from FastAPI
interface UploadResponse {
  message: string;
  output_video: string; // e.g., "/videos/My_Reel.mp4"
  files_processed: number;
}

/**
 * VideoPreview Component
 * 
 * Integrates with Python FastAPI backend for ReliveAI video generation
 * - Allows users to upload multiple images/videos
 * - Sends files to backend at http://localhost:8000/upload/
 * - Displays generated cinematic reel with controls
 */
export const VideoPreview = () => {
  // State for selected files from user input
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // State for optional reel title (defaults to "My Reel")
  const [title, setTitle] = useState<string>('My Reel');
  
  // State to track backend processing status
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // State to store the generated video URL from backend
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  /**
   * Handle file selection from input element
   * Filters for valid image/video formats only
   */
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Convert FileList to Array for easier manipulation
    const fileArray = Array.from(files);
    
    // Filter for valid image/video MIME types
    const validFiles = fileArray.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });

    // Show error if no valid files selected
    if (validFiles.length === 0) {
      toast({
        title: 'Invalid files',
        description: 'Please select image or video files only',
        variant: 'destructive',
      });
      return;
    }

    // Update state with valid files
    setSelectedFiles(validFiles);
    toast({
      title: 'Files selected',
      description: `${validFiles.length} file(s) ready for upload`,
    });
  };

  /**
   * Upload files to FastAPI backend and process into reel
   * POST /upload/ with multipart/form-data
   */
  const handleUpload = async () => {
    // Validate that files are selected
    if (selectedFiles.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select files before uploading',
        variant: 'destructive',
      });
      return;
    }

    // Set processing state and clear previous video
    setIsProcessing(true);
    setGeneratedVideoUrl(null);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Append all selected files with key "files" (FastAPI expects List[UploadFile])
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // Construct URL with title as query parameter
      const uploadUrl = `http://localhost:8000/upload/?title=${encodeURIComponent(title)}`;

      // Send POST request to backend
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header - browser sets it automatically with boundary
      });

      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      // Parse JSON response from backend
      const data: UploadResponse = await response.json();

      // Construct full video URL from relative path
      // Backend returns: "/videos/My_Reel.mp4"
      const videoUrl = `http://localhost:8000${data.output_video}`;
      setGeneratedVideoUrl(videoUrl);

      // Show success notification
      toast({
        title: 'Video generated!',
        description: `Processed ${data.files_processed} files successfully`,
      });

    } catch (error) {
      // Handle errors and show user feedback
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      // Always reset processing state
      setIsProcessing(false);
    }
  };

  /**
   * Reset component to initial state for new upload
   */
  const handleReset = () => {
    setSelectedFiles([]);
    setGeneratedVideoUrl(null);
    setTitle('My Reel');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 space-y-6 bg-card">
      {/* Header Section */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">ReliveAI Video Generator</h2>
        <p className="text-muted-foreground">
          Upload your images and videos to create a cinematic reel powered by AI
        </p>
      </div>

      {/* Upload Interface - shown before video is generated */}
      {!generatedVideoUrl && (
        <>
          {/* Title Input Field */}
          <div className="space-y-2">
            <label htmlFor="title-input" className="text-sm font-medium text-foreground">
              Reel Title (Optional)
            </label>
            <Input
              id="title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Reel"
              disabled={isProcessing}
              className="bg-background"
            />
          </div>

          {/* File Input - accepts multiple files */}
          <div className="space-y-2">
            <label htmlFor="file-input" className="text-sm font-medium text-foreground">
              Select Media Files
            </label>
            <Input
              id="file-input"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              disabled={isProcessing}
              className="cursor-pointer file:cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Select multiple images or videos (JPG, PNG, MP4, MOV, etc.)
            </p>
          </div>

          {/* Selected Files Counter */}
          {selectedFiles.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 rounded-lg">
              <Video className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {selectedFiles.length} file(s) selected
              </span>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={isProcessing || selectedFiles.length === 0}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Processing your reel...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Generate Reel
              </>
            )}
          </Button>

          {/* Processing Info */}
          {isProcessing && (
            <p className="text-sm text-center text-muted-foreground animate-pulse">
              This may take a minute. AI is analyzing your media and creating magic ✨
            </p>
          )}
        </>
      )}

      {/* Video Player - shown after successful generation */}
      {generatedVideoUrl && (
        <div className="space-y-4">
          {/* Video Container - 9:16 aspect ratio for vertical video */}
          <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden max-w-md mx-auto shadow-xl">
            <video
              src={generatedVideoUrl}
              controls
              autoPlay
              loop
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Button onClick={handleReset} variant="outline" size="lg">
              Create Another Reel
            </Button>
            <Button
              onClick={() => {
                // Download video by creating temporary link
                const link = document.createElement('a');
                link.href = generatedVideoUrl;
                link.download = `${title.replace(/\s+/g, '_')}.mp4`;
                link.click();
              }}
              size="lg"
            >
              Download Video
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
