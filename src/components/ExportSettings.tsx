import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Sparkles } from "lucide-react";

interface ExportSettingsProps {
  onRegenerate: (settings: {
    quality: string;
    resolution: string;
    fps: number;
    format: string;
  }) => void;
  disabled?: boolean;
}

export const ExportSettings = ({ onRegenerate, disabled }: ExportSettingsProps) => {
  const [open, setOpen] = useState(false);
  const [quality, setQuality] = useState("high");
  const [resolution, setResolution] = useState("1080x1920");
  const [fps, setFps] = useState([30]);
  const [format, setFormat] = useState("mp4");

  const handleRegenerate = () => {
    onRegenerate({
      quality,
      resolution,
      fps: fps[0],
      format,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled} className="gap-2">
          <Settings className="h-4 w-4" />
          Export Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Regenerate Video
          </DialogTitle>
          <DialogDescription>
            Customize export settings and regenerate your video with the current timeline edits
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quality */}
          <div className="space-y-3">
            <Label htmlFor="quality" className="text-base font-medium">
              Quality Preset
            </Label>
            <RadioGroup value={quality} onValueChange={setQuality}>
              <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="draft" id="draft" />
                <Label htmlFor="draft" className="flex-1 cursor-pointer">
                  <div className="font-medium">Draft</div>
                  <div className="text-xs text-muted-foreground">Fast preview, lower quality</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="flex-1 cursor-pointer">
                  <div className="font-medium">High Quality</div>
                  <div className="text-xs text-muted-foreground">Balanced quality and size</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="ultra" id="ultra" />
                <Label htmlFor="ultra" className="flex-1 cursor-pointer">
                  <div className="font-medium">Ultra HD</div>
                  <div className="text-xs text-muted-foreground">Maximum quality, larger file</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Resolution */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Resolution</Label>
            <Select value={resolution} onValueChange={setResolution}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720x1280">720 × 1280 (HD)</SelectItem>
                <SelectItem value="1080x1920">1080 × 1920 (Full HD)</SelectItem>
                <SelectItem value="1440x2560">1440 × 2560 (2K)</SelectItem>
                <SelectItem value="2160x3840">2160 × 3840 (4K)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Frame Rate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Frame Rate</Label>
              <span className="text-sm font-mono text-muted-foreground">{fps[0]} fps</span>
            </div>
            <Slider
              value={fps}
              onValueChange={setFps}
              min={24}
              max={60}
              step={6}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>24 fps</span>
              <span>30 fps</span>
              <span>60 fps</span>
            </div>
          </div>

          {/* Format */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                <SelectItem value="webm">WebM</SelectItem>
                <SelectItem value="mov">MOV (ProRes)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Info */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. render time:</span>
                <span className="font-medium">~3-5 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. file size:</span>
                <span className="font-medium">~25-40 MB</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRegenerate} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Regenerate Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
