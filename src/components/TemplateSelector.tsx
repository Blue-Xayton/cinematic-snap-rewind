import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Crown, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  mood: string;
  track: string;
  target_duration: number;
  default_transitions: string[];
  is_premium: boolean;
}

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void;
  selectedTemplateId?: string | null;
}

export const TemplateSelector = ({ onSelectTemplate, selectedTemplateId }: TemplateSelectorProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('video_templates')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        // Transform the data to match our Template interface
        const transformedData = (data || []).map(template => ({
          ...template,
          default_transitions: Array.isArray(template.default_transitions) 
            ? template.default_transitions 
            : JSON.parse(template.default_transitions as string),
        }));
        
        setTemplates(transformedData);
      } catch (error: any) {
        toast({
          title: "Error loading templates",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [toast]);

  if (loading) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Choose a Template
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Choose a Template
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={`group relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all hover:shadow-glow ${
              selectedTemplateId === template.id
                ? "border-primary shadow-glow"
                : "border-border/50 hover:border-primary/50"
            }`}
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
              {template.thumbnail_url ? (
                <img
                  src={template.thumbnail_url}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-primary/50" />
                </div>
              )}
              
              {/* Premium badge */}
              {template.is_premium && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-accent text-accent-foreground">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              )}

              {/* Selected indicator */}
              {selectedTemplateId === template.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Template info */}
            <div className="p-4 bg-card">
              <h4 className="font-semibold text-foreground mb-1">{template.name}</h4>
              {template.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {template.description}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {template.mood}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {template.target_duration}s
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
