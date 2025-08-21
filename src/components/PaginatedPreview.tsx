import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { ModernTemplatePreview } from "./templates/ModernTemplatePreview";
import { ClassicTemplatePreview } from "./templates/ClassicTemplatePreview";
import { CreativeTemplatePreview } from "./templates/CreativeTemplatePreview";
import { ExecutiveTemplatePreview } from "./templates/ExecutiveTemplatePreview";
import { MinimalistTemplatePreview } from "./templates/MinimalistTemplatePreview";
import type { ResumeTemplate } from "@/lib/resumeTemplates";

interface PaginatedPreviewProps {
  enhancedContent: any;
  selectedTemplate: ResumeTemplate;
  selectedColorTheme: any;
  resumeContentRef: React.RefObject<HTMLDivElement>;
}

// A4 dimensions in pixels (assuming 96 DPI)
const A4_WIDTH = 794; // 210mm at 96 DPI
const A4_HEIGHT = 1123; // 297mm at 96 DPI

export function PaginatedPreview({ 
  enhancedContent, 
  selectedTemplate, 
  selectedColorTheme, 
  resumeContentRef 
}: PaginatedPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pageContent, setPageContent] = useState<HTMLElement[]>([]);

  // Template renderer
  const renderTemplate = () => {
    switch (selectedTemplate.id) {
      case 'modern':
        return <ModernTemplatePreview enhancedContent={enhancedContent} selectedColorTheme={selectedColorTheme} />;
      case 'classic':
        return <ClassicTemplatePreview enhancedContent={enhancedContent} selectedColorTheme={selectedColorTheme} />;
      case 'creative':
        return <CreativeTemplatePreview enhancedContent={enhancedContent} selectedColorTheme={selectedColorTheme} />;
      case 'executive':
        return <ExecutiveTemplatePreview enhancedContent={enhancedContent} selectedColorTheme={selectedColorTheme} />;
      case 'minimalist':
        return <MinimalistTemplatePreview enhancedContent={enhancedContent} selectedColorTheme={selectedColorTheme} />;
      default:
        return <ModernTemplatePreview enhancedContent={enhancedContent} selectedColorTheme={selectedColorTheme} />;
    }
  };

  // Split content into pages based on A4 height
  useEffect(() => {
    if (!contentRef.current || !enhancedContent) return;

    const timer = setTimeout(() => {
      const element = contentRef.current;
      if (!element) return;

      const totalHeight = element.scrollHeight;
      const pages = Math.max(1, Math.ceil(totalHeight / A4_HEIGHT));
      setTotalPages(pages);

      // Create virtual pages by cloning content and adjusting positioning
      const pages_elements: HTMLElement[] = [];
      for (let i = 0; i < pages; i++) {
        const clonedElement = element.cloneNode(true) as HTMLElement;
        clonedElement.style.position = 'absolute';
        clonedElement.style.top = `-${i * A4_HEIGHT}px`;
        clonedElement.style.left = '0';
        clonedElement.style.width = `${A4_WIDTH}px`;
        pages_elements.push(clonedElement);
      }
      setPageContent(pages_elements);
    }, 500); // Allow content to render first

    return () => clearTimeout(timer);
  }, [enhancedContent, selectedTemplate.id, selectedColorTheme]);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Pagination Controls */}
      <Card className="p-4 bg-background/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">A4 Pages</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => goToPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="text-sm text-muted-foreground min-w-[80px] text-center">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Page Preview */}
      <Card className="relative overflow-hidden bg-muted/30 border-border/50">
        <div className="p-8 flex justify-center">
          <div className="relative">
            {/* A4 Page Container */}
            <div 
              className="bg-white shadow-lg border border-border/20 relative overflow-hidden"
              style={{
                width: `${A4_WIDTH}px`,
                height: `${A4_HEIGHT}px`,
                transform: 'scale(0.7)',
                transformOrigin: 'top center',
              }}
            >
              {/* Hidden full content for measuring */}
              <div 
                ref={contentRef}
                className="absolute inset-0 opacity-0 pointer-events-none"
                style={{ width: `${A4_WIDTH}px` }}
              >
                <div ref={resumeContentRef} className="w-full">
                  {renderTemplate()}
                </div>
              </div>

              {/* Visible paginated content */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{
                  transform: `translateY(-${(currentPage - 1) * A4_HEIGHT}px)`,
                }}
              >
                <div style={{ width: `${A4_WIDTH}px` }}>
                  {renderTemplate()}
                </div>
              </div>
            </div>
            
            {/* Page number indicator */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
              {currentPage} / {totalPages}
            </div>
          </div>
        </div>
      </Card>

      {/* Page Navigation Info */}
      <div className="text-center text-sm text-muted-foreground">
        Each page represents standard A4 size (210mm × 297mm) for printing
      </div>
    </div>
  );
}