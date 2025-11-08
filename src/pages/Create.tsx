import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Upload, FileVideo, FileImage, Sparkles, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
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

    try {
      // Create FormData
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
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
        description: "Your video reel is being created...",
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
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">Upload Media</h2>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-all ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 hover:bg-card/50'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-lg font-medium text-foreground">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Photos, videos, or ZIP files (max 500MB)
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {files.length} file{files.length !== 1 ? 's' : ''} selected
                  </p>
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border bg-secondary/30 p-3">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg bg-card p-2">
                        <div className="flex items-center gap-2">
                          {file.type.startsWith('image/') ? (
                            <FileImage className="h-4 w-4 text-accent" />
                          ) : (
                            <FileVideo className="h-4 w-4 text-primary" />
                          )}
                          <span className="text-sm text-foreground">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 px-2"
                        >
                          ×
                        </Button>
                      </div>
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
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">Settings</h2>
              
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

            <Card className="border-primary/20 bg-primary/5 p-6">
              <div className="mb-4 flex items-start gap-3">
                <Sparkles className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">AI Processing</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Our AI will analyze every frame, detect the best moments, sync to beats, 
                    and create a professional edit automatically.
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                ⏱️ Estimated time: 2-5 minutes
              </p>
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
