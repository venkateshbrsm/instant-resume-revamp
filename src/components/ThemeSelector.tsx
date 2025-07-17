import { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Palette, ChevronDown } from "lucide-react";

export const colorThemes = [
  { id: 'navy', name: 'Navy Professional', primary: '#3b82f6', secondary: '#60a5fa', accent: '#93c5fd' },
  { id: 'charcoal', name: 'Charcoal Gray', primary: '#6b7280', secondary: '#9ca3af', accent: '#d1d5db' },
  { id: 'burgundy', name: 'Burgundy Wine', primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
  { id: 'forest', name: 'Forest Green', primary: '#22c55e', secondary: '#4ade80', accent: '#86efac' },
  { id: 'bronze', name: 'Bronze Gold', primary: '#eab308', secondary: '#fbbf24', accent: '#fcd34d' },
  { id: 'slate', name: 'Slate Blue', primary: '#64748b', secondary: '#94a3b8', accent: '#cbd5e1' }
];

interface ThemeSelectorProps {
  selectedTheme: typeof colorThemes[0];
  onThemeChange: (theme: typeof colorThemes[0]) => void;
}

export function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">{selectedTheme.name}</span>
          <span className="sm:hidden">Theme</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {colorThemes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => onThemeChange(theme)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="flex gap-1">
              <div 
                className="w-3 h-3 rounded-full border border-border/20" 
                style={{ backgroundColor: theme.primary }}
              />
              <div 
                className="w-3 h-3 rounded-full border border-border/20" 
                style={{ backgroundColor: theme.secondary }}
              />
              <div 
                className="w-3 h-3 rounded-full border border-border/20" 
                style={{ backgroundColor: theme.accent }}
              />
            </div>
            <span className="text-sm">{theme.name}</span>
            {selectedTheme.id === theme.id && (
              <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}