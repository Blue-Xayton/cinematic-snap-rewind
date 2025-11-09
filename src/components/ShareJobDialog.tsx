import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Trash2, Crown, Eye, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SharedUser {
  id: string;
  shared_with_user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
  email?: string;
}

interface ShareJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobName: string;
  isOwner: boolean;
}

export const ShareJobDialog = ({ open, onOpenChange, jobId, jobName, isOwner }: ShareJobDialogProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSharedUsers = async () => {
    if (!isOwner) return;
    
    const { data, error } = await supabase
      .from('shared_jobs')
      .select('*')
      .eq('job_id', jobId);

    if (!error && data) {
      setSharedUsers(data);
    }
  };

  const handleShare = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Find user by email (note: in production, you'd need a cloud function for this)
      const { data: targetUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', email) // Simplified - in production use proper email lookup
        .single();

      if (!targetUser) {
        toast({
          title: "User not found",
          description: "No user exists with that email",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('shared_jobs')
        .insert({
          job_id: jobId,
          shared_with_user_id: targetUser.id,
          role,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Job shared successfully",
        description: `${email} can now ${role === 'editor' ? 'edit' : 'view'} this job`,
      });

      setEmail("");
      fetchSharedUsers();
    } catch (error: any) {
      toast({
        title: "Error sharing job",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('shared_jobs')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      toast({
        title: "Access removed",
        description: "User no longer has access to this job",
      });

      fetchSharedUsers();
    } catch (error: any) {
      toast({
        title: "Error removing access",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3" />;
      case 'editor':
        return <Edit className="h-3 w-3" />;
      case 'viewer':
        return <Eye className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-accent text-accent-foreground';
      case 'editor':
        return 'bg-primary/20 text-primary';
      case 'viewer':
        return 'bg-muted text-muted-foreground';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{jobName}"</DialogTitle>
          <DialogDescription>
            Collaborate with others by sharing this video project
          </DialogDescription>
        </DialogHeader>

        {isOwner && (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Permission</Label>
              <Select value={role} onValueChange={(v: 'viewer' | 'editor') => setRole(v)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Viewer - Can view only
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Editor - Can edit
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleShare}
              disabled={loading}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Share Job
            </Button>

            {sharedUsers.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <Label className="text-sm font-semibold mb-3 block">Shared with</Label>
                <div className="space-y-2">
                  {sharedUsers.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{share.email || 'User'}</span>
                        <Badge className={`text-xs ${getRoleColor(share.role)}`}>
                          {getRoleIcon(share.role)}
                          <span className="ml-1">{share.role}</span>
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveShare(share.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!isOwner && (
          <div className="py-6 text-center text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>You have {role} access to this job</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
