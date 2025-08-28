import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Palette } from "lucide-react";
import { resumeTemplates, type ResumeTemplate } from "@/lib/resumeTemplates";

interface TemplateSelectorProps {
  selectedTemplate: ResumeTemplate;
  selectedColorTheme: { id: string; name: string; primary: string; secondary: string; accent: string; };
  onTemplateChange: (template: ResumeTemplate) => void;
  onColorThemeChange: (colorTheme: { id: string; name: string; primary: string; secondary: string; accent: string; }) => void;
}

export function TemplateSelector({ 
  selectedTemplate, 
  selectedColorTheme, 
  onTemplateChange, 
  onColorThemeChange 
}: TemplateSelectorProps) {
  const [showColorThemes, setShowColorThemes] = useState(false);

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div className="bg-card/80 rounded-lg p-4 border border-border/50">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Choose Template Design
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {resumeTemplates.filter((template) => template.id === 'modern').map((template) => (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedTemplate.id === template.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-accent/5'
              }`}
              onClick={() => {
                onTemplateChange(template);
                // Reset to first color theme of new template
                onColorThemeChange(template.colorThemes[0]);
                setShowColorThemes(false);
              }}
            >
              <CardContent className="p-3">
                <div className="relative mb-3">
                  <img 
                    src={template.preview} 
                    alt={`${template.name} template preview`}
                    className="w-full h-32 object-cover rounded-md bg-muted"
                    onError={(e) => {
                      // Fallback if image doesn't load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-32 bg-muted rounded-md flex items-center justify-center">
                          <span class="text-xs text-muted-foreground">${template.name}</span>
                        </div>
                      `;
                    }}
                  />
                  {selectedTemplate.id === template.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-semibold text-sm">{template.name}</h5>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.features.slice(0, 2).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                        {feature}
                      </Badge>
                    ))}
                    {template.features.length > 2 && (
                      <Badge variant="outline" className="text-xs px-2 py-0">
                        +{template.features.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Color Theme Selection */}
        <div className="border-t border-border/50 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-foreground">Color Scheme</h5>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowColorThemes(!showColorThemes)}
              className="text-xs"
            >
              {showColorThemes ? 'Hide Options' : 'More Colors'}
            </Button>
          </div>
          
          <div className={`grid gap-2 transition-all duration-200 ${
            showColorThemes ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3 sm:grid-cols-4'
          }`}>
            {(showColorThemes ? selectedTemplate.colorThemes : selectedTemplate.colorThemes.slice(0, 3))
              .map((colorTheme) => (
                <button
                  key={colorTheme.id}
                  onClick={() => onColorThemeChange(colorTheme)}
                  className={`flex items-center gap-2 p-2 rounded-md border transition-all duration-200 text-left ${
                    selectedColorTheme.id === colorTheme.id
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border hover:border-primary/50 hover:bg-accent/5'
                  }`}
                >
                  <div className="flex gap-1">
                    <div 
                      className="w-3 h-3 rounded-full border border-white/50"
                      style={{ backgroundColor: colorTheme.primary }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-white/50"
                      style={{ backgroundColor: colorTheme.accent }}
                    />
                  </div>
                  <span className="text-xs font-medium truncate">
                    {colorTheme.name}
                  </span>
                  {selectedColorTheme.id === colorTheme.id && (
                    <Check className="w-3 h-3 text-primary ml-auto flex-shrink-0" />
                  )}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}