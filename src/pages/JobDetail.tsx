import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Share2, CheckCircle2, Loader2, PlayCircle, Trash2, Copy, Check, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Timeline } from "@/components/Timeline";
import { TransitionSelector } from "@/components/TransitionSelector";
import { ExportSettings } from "@/components/ExportSettings";
import { ShareJobDialog } from "@/components/ShareJobDialog";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface TimelineClip {
  id: string;
  thumbnail: string;
  startTime: number;
  duration: number;
  transition: "fade" | "slide" | "zoom" | "none";
}

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [jobName, setJobName] = useState<string>("");
  const [status, setStatus] = useState<JobStatus>("queued");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [beatThumbnails, setBeatThumbnails] = useState<BeatThumbnail[]>([]);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [hasTimelineChanges, setHasTimelineChanges] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [collaborationDialogOpen, setCollaborationDialogOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(true);

  // Fetch job details and subscribe to real-time updates
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (jobError) {
        console.error('Error fetching job:', jobError);
        setLoading(false);
        return;
      }
      
      if (jobData) {
        setJobName(jobData.name || `Reel ${jobId.slice(0, 8)}`);
        setStatus(jobData.status as JobStatus || 'queued');
        setFinalVideoUrl(jobData.final_video_url);
        
        // Check if current user is the owner
        const { data: { user } } = await supabase.auth.getUser();
        setIsOwner(user?.id === jobData.user_id);
        
        // Calculate progress based on status
        const statusProgress: Record<string, number> = {
          'queued': 5,
          'ingesting': 20,
          'scoring': 45,
          'beat_mapping': 60,
          'assembling': 80,
          'rendering': 95,
          'done': 100,
          'error': 0,
        };
        setProgress(statusProgress[jobData.status] || 0);
      }
      
      // Fetch logs
      const { data: logsData } = await supabase
        .from('job_logs')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });
      
      if (logsData) {
        setLogs(logsData.map(log => ({
          timestamp: new Date(log.created_at).toLocaleTimeString(),
          level: log.level as "info" | "success" | "error",
          message: log.message,
        })));
      }
      
      // Fetch media files for timeline
      const { data: mediaFiles } = await supabase
        .from('media_files')
        .select('*')
        .eq('job_id', jobId);
      
      if (mediaFiles && mediaFiles.length > 0) {
        const clips: TimelineClip[] = mediaFiles.slice(0, 8).map((file, i) => {
          const { data: publicUrl } = supabase.storage
            .from('media')
            .getPublicUrl(file.file_path);
          
          return {
            id: `clip-${file.id}`,
            thumbnail: publicUrl.publicUrl,
            startTime: i * 3.75,
            duration: 3.75,
            transition: ["fade", "slide", "zoom", "none"][i % 4] as TimelineClip["transition"],
          };
        });
        setTimelineClips(clips);
        
        // Mock beat thumbnails
        const mockBeats: BeatThumbnail[] = clips.map((clip, i) => ({
          index: i,
          beatTime: i * 2.5,
          thumbnailUrl: clip.thumbnail,
          clipName: `clip_${i + 1}.mp4`,
        }));
        setBeatThumbnails(mockBeats);
      }
      
      setLoading(false);
    };
    
    fetchJob();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          console.log('Job update:', payload);
          const newJob = payload.new as any;
          if (newJob) {
            setStatus(newJob.status as JobStatus);
            setFinalVideoUrl(newJob.final_video_url);
            
            const statusProgress: Record<string, number> = {
              'queued': 5,
              'ingesting': 20,
              'scoring': 45,
              'beat_mapping': 60,
              'assembling': 80,
              'rendering': 95,
              'done': 100,
              'error': 0,
            };
            setProgress(statusProgress[newJob.status] || 0);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'job_logs',
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          console.log('New log:', payload);
          const newLog = payload.new as any;
          if (newLog) {
            setLogs(prev => [...prev, {
              timestamp: new Date(newLog.created_at).toLocaleTimeString(),
              level: newLog.level as "info" | "success" | "error",
              message: newLog.message,
            }]);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job deleted",
        description: "The job has been removed successfully",
      });
      navigate('/jobs');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job",
        variant: "destructive",
      });
      setDeleting(false);
    }
  };

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
          
          // Initialize timeline clips
          const clips: TimelineClip[] = mockThumbnails.slice(0, 8).map((t, i) => ({
            id: `clip-${t.index}`,
            thumbnail: t.thumbnailUrl,
            startTime: i * 3.75,
            duration: 3.75,
            transition: ["fade", "slide", "zoom", "none"][i % 4] as TimelineClip["transition"],
          }));
          setTimelineClips(clips);
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
    if (finalVideoUrl) {
      const link = document.createElement('a');
      link.href = finalVideoUrl;
      link.download = `${jobName.replace(/\s+/g, '_')}.mp4`;
      link.click();
      toast({
        title: "Download started",
        description: "Your video is being downloaded",
      });
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/jobs/${jobId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const handleShareVideo = async () => {
    if (!finalVideoUrl) {
      toast({
        title: "Video not ready",
        description: "Please wait for the video to finish processing",
        variant: "destructive",
      });
      return;
    }
    
    // Open share dialog to show the link
    setShareDialogOpen(true);
  };

  const handleClipSelect = (clipId: string) => {
    setSelectedClipId(clipId);
  };

  const handleTransitionChange = (transition: "fade" | "slide" | "zoom" | "none") => {
    if (!selectedClipId) return;
    
    const currentClip = timelineClips.find(c => c.id === selectedClipId);
    if (!currentClip || currentClip.transition === transition) return;
    
    setTimelineClips(prev => 
      prev.map(clip => 
        clip.id === selectedClipId 
          ? { ...clip, transition } 
          : clip
      )
    );
    setHasTimelineChanges(true);
    
    toast({
      title: "Transition updated",
      description: `Changed to ${transition} transition. Regenerate to apply changes.`,
    });
  };

  const handleClipsReorder = (reorderedClips: TimelineClip[]) => {
    setTimelineClips(reorderedClips);
    setHasTimelineChanges(true);
    
    toast({
      title: "Timeline updated",
      description: "Clip order has been changed. Regenerate to apply changes.",
    });
  };

  const handleRegenerate = (settings: any) => {
    console.log("Regenerating with settings:", settings);
    console.log("Timeline clips:", timelineClips);
    
    toast({
      title: "Regenerating video",
      description: "Your video is being regenerated with the new settings...",
    });
    
    setHasTimelineChanges(false);
    
    // Here you would call the backend to regenerate
    // For now, just simulate
    setTimeout(() => {
      toast({
        title: "Video regenerated",
        description: "Your video has been updated with the new timeline!",
      });
    }, 3000);
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

  if (loading) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-32 mb-4" />
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full" />
              </Card>
              <Card className="p-6">
                <Skeleton className="aspect-[9/16] w-full max-w-md mx-auto" />
              </Card>
            </div>
            <div>
              <Card className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
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
            <div className="flex items-center gap-2">
              <Badge className={statusColors[status]}>
                {status === "done" ? (
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                ) : (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                )}
                {statusLabels[status]}
              </Badge>
              {isOwner && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCollaborationDialogOpen(true)}
                  title="Share with team"
                >
                  <Users className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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
              <>
                <Timeline 
                  duration={30} 
                  beats={beatThumbnails.map(t => ({ time: t.beatTime, intensity: 0.8 }))}
                  clips={timelineClips}
                  currentTime={progress === 100 ? 30 : (progress / 100) * 30}
                  onClipsReorder={handleClipsReorder}
                  selectedClipId={selectedClipId}
                  onClipSelect={handleClipSelect}
                />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <TransitionSelector
                    selectedClipId={selectedClipId}
                    currentTransition={
                      timelineClips.find(c => c.id === selectedClipId)?.transition || "none"
                    }
                    onTransitionChange={handleTransitionChange}
                  />
                  
                  <Card className="p-6 bg-card/50 backdrop-blur-sm">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Regenerate</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Apply your timeline changes and export
                      </p>
                    </div>
                    
                    {hasTimelineChanges && (
                      <div className="mb-4 rounded-lg bg-accent/10 border border-accent/30 p-3">
                        <p className="text-sm text-accent">
                          ⚠️ You have unsaved timeline changes
                        </p>
                      </div>
                    )}
                    
                    <ExportSettings 
                      onRegenerate={handleRegenerate}
                      disabled={status !== "done"}
                    />
                  </Card>
                </div>
              </>
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
                    onClick={handleShareVideo}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
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
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Video</DialogTitle>
            <DialogDescription>
              Copy this link to share your video reel with others
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <div className="flex h-10 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm">
                <input
                  readOnly
                  value={`${window.location.origin}/jobs/${jobId}`}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>
            <Button 
              size="sm" 
              className="px-3"
              onClick={() => {
                handleCopyLink();
                setShareDialogOpen(false);
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            {navigator.share && (
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.share({
                      title: jobName,
                      text: `Check out my video reel: ${jobName}`,
                      url: `${window.location.origin}/jobs/${jobId}`,
                    });
                    toast({
                      title: "Shared successfully",
                    });
                    setShareDialogOpen(false);
                  } catch (error: any) {
                    if (error.name !== 'AbortError') {
                      console.error('Share failed:', error);
                    }
                  }
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share via...
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Collaboration Share Dialog */}
      <ShareJobDialog
        open={collaborationDialogOpen}
        onOpenChange={setCollaborationDialogOpen}
        jobId={jobId || ''}
        jobName={jobName}
        isOwner={isOwner}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this job and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JobDetail;
