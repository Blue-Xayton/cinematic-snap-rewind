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

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [jobName, setJobName] = useState("");
  const [mood, setMood] = useState("cinematic");
  const [track, setTrack] = useState("track1");
  const [duration, setDuration] = useState([30]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
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

              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // Simulate loading sample dataset
                    toast({
                      title: "Sample loaded",
                      description: "Demo photos and videos added",
                    });
                    setFiles([
                      new File([], "sample_1.jpg"),
                      new File([], "sample_2.mp4"),
                      new File([], "sample_3.jpg"),
                    ]);
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
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h2 className="mb-6 text-xl font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Style & Settings
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

            <Card className="border-primary/30 bg-gradient-card p-6">
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-lg bg-primary/20 p-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">AI Magic</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Smart frame analysis • Beat detection • Auto transitions • Color grading • Professional timing
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span>Processing time: 2-5 minutes</span>
              </div>
            </Card>

            <Button 
              size="lg" 
              variant="hero" 
              className="w-full text-lg"
              onClick={handleSubmit}
              disabled={files.length === 0}
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
