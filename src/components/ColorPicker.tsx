import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette, Check } from "lucide-react";

interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

interface ColorPickerProps {
  selectedColorTheme: ColorTheme;
  onColorThemeChange: (colorTheme: ColorTheme) => void;
}

export function ColorPicker({ selectedColorTheme, onColorThemeChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColors, setCustomColors] = useState({
    primary: selectedColorTheme.primary,
    secondary: selectedColorTheme.secondary,
    accent: selectedColorTheme.accent,
  });

  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent', value: string) => {
    const newCustomColors = { ...customColors, [colorType]: value };
    setCustomColors(newCustomColors);
  };

  const applyCustomColors = () => {
    const customTheme: ColorTheme = {
      id: 'custom',
      name: 'Custom',
      primary: customColors.primary,
      secondary: customColors.secondary,
      accent: customColors.accent,
    };
    onColorThemeChange(customTheme);
    setIsOpen(false);
  };

  const resetToSelected = () => {
    setCustomColors({
      primary: selectedColorTheme.primary,
      secondary: selectedColorTheme.secondary,
      accent: selectedColorTheme.accent,
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <Palette className="w-4 h-4" />
          Custom Colors
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Custom Color Theme</h4>
            <p className="text-xs text-muted-foreground">
              Create your own color scheme by selecting colors for each element.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="primary-color" className="text-xs font-medium">
                Primary Color
              </Label>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded border border-border flex-shrink-0"
                  style={{ backgroundColor: customColors.primary }}
                />
                <Input
                  id="primary-color"
                  type="color"
                  value={customColors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="flex-1 h-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color" className="text-xs font-medium">
                Secondary Color
              </Label>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded border border-border flex-shrink-0"
                  style={{ backgroundColor: customColors.secondary }}
                />
                <Input
                  id="secondary-color"
                  type="color"
                  value={customColors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="flex-1 h-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent-color" className="text-xs font-medium">
                Accent Color
              </Label>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded border border-border flex-shrink-0"
                  style={{ backgroundColor: customColors.accent }}
                />
                <Input
                  id="accent-color"
                  type="color"
                  value={customColors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="flex-1 h-8"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={applyCustomColors}
              size="sm"
              className="flex-1 gap-2"
            >
              <Check className="w-3 h-3" />
              Apply
            </Button>
            <Button 
              onClick={resetToSelected}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Reset
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}