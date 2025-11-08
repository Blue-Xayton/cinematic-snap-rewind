import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Clock, CheckCircle2, PlayCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Job {
  id: string;
  status: "queued" | "processing" | "done" | "error";
  createdAt: string;
  duration: number;
  thumbnailUrl?: string;
  mood: string;
}

const JobList = () => {
  const navigate = useNavigate();

  // Mock data
  const jobs: Job[] = [
    {
      id: "job_1234567890",
      status: "done",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      duration: 30,
      mood: "cinematic",
    },
    {
      id: "job_1234567891",
      status: "processing",
      createdAt: new Date(Date.now() - 600000).toISOString(),
      duration: 45,
      mood: "energetic",
    },
    {
      id: "job_1234567892",
      status: "done",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      duration: 30,
      mood: "chill",
    },
  ];

  const getStatusBadge = (status: Job["status"]) => {
    const variants = {
      queued: { color: "bg-muted text-muted-foreground", label: "Queued" },
      processing: { color: "bg-accent/20 text-accent", label: "Processing" },
      done: { color: "bg-green-500/20 text-green-500", label: "Complete" },
      error: { color: "bg-destructive/20 text-destructive", label: "Error" },
    };
    const variant = variants[status];
    return (
      <Badge className={variant.color}>
        {status === "done" && <CheckCircle2 className="mr-1 h-3 w-3" />}
        {variant.label}
      </Badge>
    );
  };

  const formatTimeAgo = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Your Reels</h1>
            <p className="mt-2 text-muted-foreground">Manage and download your video reels</p>
          </div>
          <Button 
            variant="hero"
            onClick={() => navigate('/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>

        {jobs.length === 0 ? (
          <Card className="p-12 text-center">
            <Film className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-semibold text-foreground">No reels yet</h2>
            <p className="mb-6 text-muted-foreground">
              Create your first video reel to get started
            </p>
            <Button variant="hero" onClick={() => navigate('/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Reel
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Card 
                key={job.id}
                className="group cursor-pointer overflow-hidden transition-all hover:shadow-elegant"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[9/16] overflow-hidden bg-gradient-to-br from-secondary to-card">
                  <div className="flex h-full items-center justify-center">
                    <PlayCircle className="h-16 w-16 text-muted-foreground opacity-50 transition-all group-hover:scale-110 group-hover:text-primary" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(job.status)}
                  </div>
                  
                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 rounded-lg bg-background/80 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                    {job.duration}s
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-mono text-muted-foreground">
                      {job.id.slice(0, 16)}...
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTimeAgo(job.createdAt)}
                    </div>
                    <div className="capitalize">
                      {job.mood}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;
