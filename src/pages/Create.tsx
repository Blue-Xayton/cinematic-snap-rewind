import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Upload, Sparkles, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FileUploadItem } from "@/components/FileUploadItem";
import { MediaPreviewGallery } from "@/components/MediaPreviewGallery";
import { TemplateSelector } from "@/components/TemplateSelector";

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [jobName, setJobName] = useState("");
  const [mood, setMood] = useState("cinematic");
  const [track, setTrack] = useState("track1");
  const [duration, setDuration] = useState([30]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [mode, setMode] = useState<"template" | "custom">("template");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type: ${file.name}. Allowed types: JPG, PNG, WEBP, MP4, MOV, WEBM`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large: ${file.name}. Maximum size is 100MB`;
    }
    return null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    droppedFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });
    
    if (errors.length > 0) {
      toast({
        title: "Invalid files",
        description: errors[0] + (errors.length > 1 ? ` (and ${errors.length - 1} more)` : ''),
        variant: "destructive",
      });
    }
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      const validFiles: File[] = [];
      const errors: string[] = [];
      
      selectedFiles.forEach(file => {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      });
      
      if (errors.length > 0) {
        toast({
          title: "Invalid files",
          description: errors[0] + (errors.length > 1 ? ` (and ${errors.length - 1} more)` : ''),
          variant: "destructive",
        });
      }
      
      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
      }
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload at least one photo or video",
        variant: "destructive",
      });
      return;
    }

    // Generate default name if not provided
    const finalName = jobName.trim() || generateDefaultName();

    try {
      // Create FormData
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('name', finalName);
      formData.append('mood', mood);
      formData.append('track', track);
      formData.append('target_duration', duration[0].toString());

      // Call create-job edge function
      const supabase = (await import("@/integrations/supabase/client")).supabase;
      const { data, error } = await supabase.functions.invoke('create-job', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Processing started!",
        description: `Creating "${finalName}"...`,
      });
      
      // Navigate to job detail page
      navigate(`/jobs/${data.job_id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create job",
        variant: "destructive",
      });
    }
  };

  const generateDefaultName = () => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(':').slice(0, 2).join('');
    return `MyReel_${dateStr}_${timeStr}`;
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplateId(template.id);
    setMood(template.mood);
    setTrack(template.track);
    setDuration([template.target_duration]);
    
    toast({
      title: "Template applied",
      description: `Using "${template.name}" settings`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            ← Back
          </Button>
          <h1 className="text-4xl font-bold text-foreground">Create Your Reel</h1>
          <p className="mt-2 text-muted-foreground">Upload your memories and let AI do the magic</p>
        </div>

        {/* Mode Selector */}
        <div className="mb-8" data-tutorial="mode-selector">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={mode === "template" ? "default" : "outline"}
                onClick={() => setMode("template")}
                className="flex-1"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Use Template
              </Button>
              <Button
                variant={mode === "custom" ? "default" : "outline"}
                onClick={() => setMode("custom")}
                className="flex-1"
              >
                Customize Settings
              </Button>
            </div>
          </Card>
        </div>

        {/* Template Selector */}
        {mode === "template" && (
          <div className="mb-8" data-tutorial="template-selector">
            <TemplateSelector 
              onSelectTemplate={handleSelectTemplate}
              selectedTemplateId={selectedTemplateId}
            />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upload Section */}
          <div>
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h2 className="mb-4 text-xl font-semibold text-foreground flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Media Library
              </h2>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                  isDragging 
                    ? 'border-primary bg-primary/10 shadow-glow' 
                    : 'border-border/50 hover:border-primary/50 hover:bg-card/30'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                  onChange={handleFileInput}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <div className="pointer-events-none">
                  <Upload className="mx-auto mb-3 h-10 w-10 text-primary" />
                  <p className="mb-1 text-base font-medium text-foreground">
                    Drop files or click to upload
                  </p>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG, MP4, MOV • Max 100MB per file
                  </p>
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {files.length} file{files.length !== 1 ? 's' : ''}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFiles([])}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </Button>
                  </div>
                  <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg bg-muted/20 p-2">
                    {files.map((file, index) => (
                      <FileUploadItem
                        key={index}
                        file={file}
                        index={index}
                        onRemove={removeFile}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Media Preview Gallery */}
              {files.length > 0 && (
                <div className="mt-6">
                  <MediaPreviewGallery 
                    files={files}
                    onRemove={removeFile}
                  />
                </div>
              )}

              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // Create sample files with correct MIME types
                    const sampleFiles = [
                      new File([new Blob()], "sample_beach.jpg", { type: "image/jpeg" }),
                      new File([new Blob()], "sample_sunset.mp4", { type: "video/mp4" }),
                      new File([new Blob()], "sample_nature.jpg", { type: "image/jpeg" }),
                      new File([new Blob()], "sample_city.png", { type: "image/png" }),
                      new File([new Blob()], "sample_adventure.mov", { type: "video/quicktime" }),
                    ];
                    setFiles(sampleFiles);
                    toast({
                      title: "Sample loaded",
                      description: "5 demo files added to your library",
                    });
                  }}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Load Sample Dataset
                </Button>
              </div>
            </Card>
          </div>

          {/* Settings Section */}
          <div className="space-y-6">
            {mode === "custom" && (
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50" data-tutorial="custom-settings">
                <h2 className="mb-6 text-xl font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Custom Settings
                </h2>

              {/* Job Name */}
              <div className="mb-6">
                <Label htmlFor="job-name" className="mb-2 block text-foreground">
                  Reel Name
                </Label>
                <Input
                  id="job-name"
                  type="text"
                  placeholder="My Summer Memories"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="bg-background/50"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Leave blank to auto-generate
                </p>
              </div>
              
              {/* Mood Selection */}
              <div className="mb-6">
                <Label className="mb-3 block text-foreground">Mood</Label>
                <RadioGroup value={mood} onValueChange={setMood}>
                  <div className="flex items-center space-x-2 rounded-lg border border-border p-3 hover:bg-secondary/50">
                    <RadioGroupItem value="cinematic" id="cinematic" />
                    <Label htmlFor="cinematic" className="flex-1 cursor-pointer">
                      <span className="font-medium text-foreground">Cinematic</span>
                      <span className="block text-sm text-muted-foreground">
                        Dramatic contrasts, rich colors
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border border-border p-3 hover:bg-secondary/50">
                    <RadioGroupItem value="energetic" id="energetic" />
                    <Label htmlFor="energetic" className="flex-1 cursor-pointer">
                      <span className="font-medium text-foreground">Energetic</span>
                      <span className="block text-sm text-muted-foreground">
                        Vibrant, high saturation
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border border-border p-3 hover:bg-secondary/50">
                    <RadioGroupItem value="chill" id="chill" />
                    <Label htmlFor="chill" className="flex-1 cursor-pointer">
                      <span className="font-medium text-foreground">Chill</span>
                      <span className="block text-sm text-muted-foreground">
                        Soft, desaturated tones
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Music Track */}
              <div className="mb-6">
                <Label className="mb-3 block text-foreground">
                  <Music className="mr-2 inline h-4 w-4" />
                  Music Track
                </Label>
                <Select value={track} onValueChange={setTrack}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="track1">Upbeat Summer (98 BPM)</SelectItem>
                    <SelectItem value="track2">Emotional Piano (72 BPM)</SelectItem>
                    <SelectItem value="track3">Epic Cinematic (110 BPM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div>
                <Label className="mb-3 block text-foreground">
                  Target Duration: {duration[0]}s
                </Label>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  min={15}
                  max={60}
                  step={5}
                  className="mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  15s - 60s (recommended: 30s for social media)
                </p>
              </div>
            </Card>
            )}

            {mode === "template" && selectedTemplateId && (
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <h2 className="mb-4 text-xl font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Template Selected
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your reel will be created using the selected template's pre-configured mood, music, and duration settings.
                </p>
              </Card>
            )}

            <Card className="border-primary/30 bg-gradient-card p-6">
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-lg bg-primary/20 p-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">AI-Powered Processing</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    Our AI will automatically enhance your reel with:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Smart frame analysis to pick the best moments</li>
                    <li>• Beat detection for perfect music sync</li>
                    <li>• Seamless auto transitions</li>
                    <li>• Professional color grading</li>
                    <li>• Optimal timing and pacing</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span>Estimated processing time: 2-5 minutes</span>
              </div>
            </Card>

            <Button 
              size="lg" 
              variant="hero" 
              className="w-full text-lg"
              onClick={handleSubmit}
              disabled={files.length === 0 || (mode === "template" && !selectedTemplateId)}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Create My Reel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
