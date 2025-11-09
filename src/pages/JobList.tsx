import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Film, Clock, CheckCircle2, PlayCircle, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface Job {
  id: string;
  name: string;
  status: "queued" | "processing" | "done" | "error";
  created_at: string;
  target_duration: number;
  mood: string;
  progress: number;
}

const JobList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs((data || []) as Job[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    setJobToDelete(jobId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    
    setDeletingId(jobToDelete);
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobToDelete);

      if (error) throw error;

      setJobs(jobs.filter(j => j.id !== jobToDelete));
      toast({
        title: "Job deleted",
        description: "The job has been removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

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

  if (loading) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[9/16] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
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
                className="group cursor-pointer overflow-hidden transition-all hover:shadow-elegant relative"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                {/* Delete Button */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteClick(e, job.id)}
                  disabled={deletingId === job.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

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
                    {job.target_duration}s
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 truncate">
                    {job.name || `Reel ${job.id.slice(0, 8)}`}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTimeAgo(job.created_at)}
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
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JobList;
