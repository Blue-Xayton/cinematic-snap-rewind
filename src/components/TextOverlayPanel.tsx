import { useState } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useEditorStore } from '@/stores/editorStore';
import { Type, Trash2 } from 'lucide-react';

export const TextOverlayPanel = () => {
  const { textOverlays, currentTime, addTextOverlay, removeTextOverlay } = useEditorStore();
  const [newText, setNewText] = useState('');

  const handleAddText = () => {
    if (!newText.trim()) return;

    addTextOverlay({
      id: `text-${Date.now()}`,
      text: newText,
      timestamp: currentTime,
      duration: 3,
      style: {
        fontSize: 48,
        color: '#FFFFFF',
        fontFamily: 'Arial',
        position: { x: 0.5, y: 0.5 },
      },
    });

    setNewText('');
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Type className="h-5 w-5" />
        <h3 className="font-semibold">Text Overlays</h3>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="text-input">Add Text</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="text-input"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Enter text..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
            />
            <Button onClick={handleAddText} size="sm">
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Text will appear at current time: {currentTime.toFixed(1)}s
          </p>
        </div>

        {textOverlays.length > 0 && (
          <div className="space-y-2">
            <Label>Active Overlays</Label>
            {textOverlays.map((overlay) => (
              <div
                key={overlay.id}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{overlay.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {overlay.timestamp.toFixed(1)}s - {(overlay.timestamp + overlay.duration).toFixed(1)}s
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeTextOverlay(overlay.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
