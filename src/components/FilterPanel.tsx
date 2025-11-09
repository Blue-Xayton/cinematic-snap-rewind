import { Card } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { useEditorStore } from '@/stores/editorStore';

export const FilterPanel = () => {
  const { clips, selectedClipId, updateClip } = useEditorStore();
  
  const selectedClip = clips.find((c) => c.id === selectedClipId);

  if (!selectedClip) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground text-center">
          Select a clip to apply filters
        </p>
      </Card>
    );
  }

  const handleFilterChange = (
    filterName: 'brightness' | 'contrast' | 'saturation',
    value: number
  ) => {
    updateClip(selectedClip.id, {
      filters: {
        ...selectedClip.filters,
        [filterName]: value,
      },
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold">Filters</h3>

      <div className="space-y-3">
        <div>
          <Label className="text-sm">Brightness</Label>
          <Slider
            min={0.5}
            max={2}
            step={0.1}
            value={[selectedClip.filters.brightness]}
            onValueChange={([value]) => handleFilterChange('brightness', value)}
            className="mt-2"
          />
          <span className="text-xs text-muted-foreground">
            {selectedClip.filters.brightness.toFixed(1)}x
          </span>
        </div>

        <div>
          <Label className="text-sm">Contrast</Label>
          <Slider
            min={0.5}
            max={2}
            step={0.1}
            value={[selectedClip.filters.contrast]}
            onValueChange={([value]) => handleFilterChange('contrast', value)}
            className="mt-2"
          />
          <span className="text-xs text-muted-foreground">
            {selectedClip.filters.contrast.toFixed(1)}x
          </span>
        </div>

        <div>
          <Label className="text-sm">Saturation</Label>
          <Slider
            min={0}
            max={2}
            step={0.1}
            value={[selectedClip.filters.saturation]}
            onValueChange={([value]) => handleFilterChange('saturation', value)}
            className="mt-2"
          />
          <span className="text-xs text-muted-foreground">
            {selectedClip.filters.saturation.toFixed(1)}x
          </span>
        </div>
      </div>
    </Card>
  );
};
