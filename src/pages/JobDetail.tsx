import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, CheckCircle2, Loader2, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Timeline } from "@/components/Timeline";
import { supabase } from "@/integrations/supabase/client";

type JobStatus = "queued" | "ingesting" | "scoring" | "beat_mapping" | "assembling" | "rendering" | "done" | "error";

interface LogEntry {
  timestamp: string;
  level: "info" | "success" | "error";
  message: string;
}

interface BeatThumbnail {
  index: number;
  beatTime: number;
  thumbnailUrl: string;
  clipName: string;
}

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [jobName, setJobName] = useState<string>("");
  const [status, setStatus] = useState<JobStatus>("queued");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [beatThumbnails, setBeatThumbnails] = useState<BeatThumbnail[]>([]);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      
      const { data, error } = await supabase
        .from('jobs')
        .select('name')
        .eq('id', jobId)
        .single();
      
      if (data) {
        setJobName(data.name || `Reel ${jobId.slice(0, 8)}`);
      }
    };
    
    fetchJob();
  }, [jobId]);

  // Simulate processing pipeline
  useEffect(() => {
    const stages: Array<{status: JobStatus, duration: number, progress: number}> = [
      { status: "queued", duration: 1000, progress: 5 },
      { status: "ingesting", duration: 3000, progress: 20 },
      { status: "scoring", duration: 4000, progress: 45 },
      { status: "beat_mapping", duration: 2000, progress: 60 },
      { status: "assembling", duration: 3000, progress: 80 },
      { status: "rendering", duration: 4000, progress: 95 },
      { status: "done", duration: 500, progress: 100 },
    ];

    let currentStage = 0;

    const advanceStage = () => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage];
        setStatus(stage.status);
        setProgress(stage.progress);
        
        // Add log entry
        const logMessages: Record<JobStatus, string> = {
          queued: "Job queued and waiting for worker",
          ingesting: "Extracting and normalizing media files...",
          scoring: "Analyzing frames with AI (CLIP model)",
          beat_mapping: "Detecting beats and mapping timeline",
          assembling: "Building timeline with transitions",
          rendering: "Final encode (1080x1920, CRF 18)",
          done: "✅ Video ready!",
          error: "An error occurred",
        };

        setLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          level: stage.status === "done" ? "success" : "info",
          message: logMessages[stage.status],
        }]);

        // Generate mock thumbnails during beat_mapping
        if (stage.status === "beat_mapping") {
          const mockThumbnails: BeatThumbnail[] = Array.from({ length: 12 }, (_, i) => ({
            index: i,
            beatTime: i * 2.5,
            thumbnailUrl: `https://images.unsplash.com/photo-${1500000000000 + i}?w=360&h=640&fit=crop`,
            clipName: `clip_${i + 1}.mp4`,
          }));
          setBeatThumbnails(mockThumbnails);
        }

        // Set final video when done
        if (stage.status === "done") {
          setFinalVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
        }

        currentStage++;
        setTimeout(advanceStage, stage.duration);
      }
    };

    advanceStage();
  }, []);

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your video is being downloaded",
    });
  };

  const handleShare = () => {
    toast({
      title: "Share link copied",
      description: "Link copied to clipboard",
    });
  };

  const statusColors: Record<JobStatus, string> = {
    queued: "bg-muted text-muted-foreground",
    ingesting: "bg-accent/20 text-accent",
    scoring: "bg-accent/20 text-accent",
    beat_mapping: "bg-accent/20 text-accent",
    assembling: "bg-accent/20 text-accent",
    rendering: "bg-primary/20 text-primary",
    done: "bg-green-500/20 text-green-500",
    error: "bg-destructive/20 text-destructive",
  };

  const statusLabels: Record<JobStatus, string> = {
    queued: "Queued",
    ingesting: "Ingesting Media",
    scoring: "AI Scoring",
    beat_mapping: "Beat Detection",
    assembling: "Assembling Timeline",
    rendering: "Final Render",
    done: "Complete",
    error: "Error",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/jobs')}
            className="mb-4"
          >
            ← Back to Jobs
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">{jobName || "Loading..."}</h1>
              <p className="mt-2 text-muted-foreground">
                {status === "done" ? "Your reel is ready!" : "Creating your video reel"}
              </p>
            </div>
            <Badge className={statusColors[status]}>
              {status === "done" ? (
                <CheckCircle2 className="mr-1 h-4 w-4" />
              ) : (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              )}
              {statusLabels[status]}
            </Badge>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - 2/3 width */}
          <div className="space-y-6 lg:col-span-2">
            {/* Progress Card */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Progress</h2>
                <span className="text-2xl font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                {statusLabels[status]}
              </p>
            </Card>

            {/* Interactive Timeline */}
            {beatThumbnails.length > 0 && (
              <Timeline 
                duration={30} 
                beats={beatThumbnails.map(t => ({ time: t.beatTime, intensity: 0.8 }))}
                clips={beatThumbnails.slice(0, 8).map((t, i) => ({
                  id: `clip-${t.index}`,
                  thumbnail: t.thumbnailUrl,
                  startTime: i * 3.75,
                  duration: 3.75,
                  transition: ["fade", "slide", "zoom", "none"][i % 4] as "fade" | "slide" | "zoom" | "none",
                }))}
                currentTime={progress === 100 ? 30 : (progress / 100) * 30}
              />
            )}

            {/* Video Player */}
            {finalVideoUrl && (
              <Card className="overflow-hidden p-6">
                <h2 className="mb-4 text-xl font-semibold text-foreground">Final Video</h2>
                <div className="aspect-[9/16] max-w-md mx-auto overflow-hidden rounded-xl border-2 border-border bg-black">
                  <video 
                    controls 
                    className="h-full w-full"
                    poster="/placeholder.svg"
                  >
                    <source src={finalVideoUrl} type="video/mp4" />
                  </video>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button 
                    variant="hero" 
                    className="flex-1"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Video
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Logs Sidebar - 1/3 width */}
          <div>
            <Card className="sticky top-8 p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">Processing Logs</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto rounded-lg border border-border bg-secondary/30 p-3">
                {logs.map((log, index) => (
                  <div 
                    key={index}
                    className={`rounded-lg p-3 text-sm ${
                      log.level === "success" 
                        ? "bg-green-500/10 text-green-500" 
                        : log.level === "error"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-card text-foreground"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <p>{log.message}</p>
                  </div>
                ))}
                {status !== "done" && status !== "error" && (
                  <div className="flex items-center gap-2 rounded-lg bg-card p-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
