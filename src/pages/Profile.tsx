import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, User, LogOut, Film, Trash2, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";

const profileSchema = z.object({
  display_name: z.string().trim().max(100, "Display name must be less than 100 characters").optional(),
  bio: z.string().trim().max(500, "Bio must be less than 500 characters").optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [jobCount, setJobCount] = useState(0);
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
    loadJobCount();
  }, []);

  const ensureProfile = async (userId: string, userCreatedAt: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          created_at: userCreatedAt,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return newProfile;
    }

    return data;
  };

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const profileData = await ensureProfile(user.id, user.created_at);
      
      setProfile(profileData);
      setFormData({
        display_name: profileData.display_name || "",
        bio: profileData.bio || "",
      });
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadJobCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setJobCount(count || 0);
    } catch (error: any) {
      console.error("Error loading job count:", error);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Profile picture must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await ensureProfile(user.id, user.created_at);

      const fileExt = file.name.split(".").pop();
      const timestamp = Date.now();
      const filePath = `${user.id}/profile-picture-${timestamp}.${fileExt}`;

      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from("media").remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ 
          id: user.id,
          avatar_url: publicUrl,
          created_at: user.created_at
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      toast({ title: "Profile picture updated successfully!" });
    } catch (error: any) {
      toast({
        title: "Error uploading profile picture",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    setRemoving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from("media").remove([oldPath]);
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: null });
      toast({ title: "Profile picture removed successfully!" });
    } catch (error: any) {
      toast({
        title: "Error removing profile picture",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRemoving(false);
    }
  };

  const handleUpdateProfile = async () => {
    setErrors({});
    
    const validation = profileSchema.safeParse(formData);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await ensureProfile(user.id, user.created_at);

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          display_name: formData.display_name || null,
          bio: formData.bio || null,
          created_at: user.created_at,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, ...formData });
      setEditing(false);
      toast({ title: "Profile updated successfully!" });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordErrors({});
    
    const validation = passwordSchema.safeParse(passwordData);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setPasswordErrors(newErrors);
      return;
    }

    setUpdatingPassword(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No user email found");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword,
      });

      if (signInError) {
        setPasswordErrors({ currentPassword: "Current password is incorrect" });
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (updateError) throw updateError;

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setChangingPassword(false);
      toast({ title: "Password changed successfully!" });
    } catch (error: any) {
      toast({
        title: "Error changing password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = profile?.display_name
    ? profile.display_name.substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <Card className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Button variant="outline" size="sm" disabled={uploading} asChild>
                    <span>
                      {uploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Picture
                    </span>
                  </Button>
                </label>
                {profile?.avatar_url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRemoveProfilePicture}
                    disabled={removing}
                    className="text-destructive hover:text-destructive"
                  >
                    {removing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Remove Picture
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Profile
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage your account information
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Film className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Videos</p>
                    <p className="text-2xl font-bold">{jobCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <User className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="text-sm font-semibold">
                      {new Date(profile?.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Display Name</label>
                    <Input
                      value={formData.display_name}
                      onChange={(e) =>
                        setFormData({ ...formData, display_name: e.target.value })
                      }
                      placeholder="Enter your display name"
                      className="mt-1.5"
                    />
                    {errors.display_name && (
                      <p className="text-sm text-destructive mt-1">{errors.display_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Tell us about yourself"
                      rows={4}
                      className="mt-1.5"
                    />
                    {errors.bio && (
                      <p className="text-sm text-destructive mt-1">{errors.bio}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleUpdateProfile} disabled={updating}>
                      {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          display_name: profile?.display_name || "",
                          bio: profile?.bio || "",
                        });
                        setErrors({});
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Display Name
                    </label>
                    <p className="text-lg mt-1">
                      {profile?.display_name || "Not set"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Bio
                    </label>
                    <p className="text-lg mt-1 whitespace-pre-wrap">
                      {profile?.bio || "No bio yet"}
                    </p>
                  </div>

                  <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Security</h2>
              </div>
              <p className="text-muted-foreground">
                Manage your password and account security
              </p>
            </div>

            <Separator />

            {changingPassword ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Current Password</label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    placeholder="Enter your current password"
                    className="mt-1.5"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-destructive mt-1">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    placeholder="Enter your new password"
                    className="mt-1.5"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    placeholder="Confirm your new password"
                    className="mt-1.5"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleChangePassword} disabled={updatingPassword}>
                    {updatingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Update Password
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setChangingPassword(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      setPasswordErrors({});
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <Button onClick={() => setChangingPassword(true)}>
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
