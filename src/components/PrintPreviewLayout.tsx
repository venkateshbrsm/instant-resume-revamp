import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Printer, Eye, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface PrintPreviewLayoutProps {
  resumeData: any;
  templateId: string;
  themeId: string;
}

const PrintPreviewLayout: React.FC<PrintPreviewLayoutProps> = ({
  resumeData,
  templateId,
  themeId
}) => {
  const [showPageBreaks, setShowPageBreaks] = useState(true);
  const [blackAndWhite, setBlackAndWhite] = useState(false);
  const [zoom, setZoom] = useState(100);

  const handlePrint = () => {
    window.print();
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  return (
    <div className="w-full h-full flex flex-col bg-muted/30">
      {/* Print Controls */}
      <div className="flex items-center justify-between p-4 bg-background border-b">
        <div className="flex items-center gap-4">
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          
          <div className="flex items-center gap-2">
            <Switch
              id="page-breaks"
              checked={showPageBreaks}
              onCheckedChange={setShowPageBreaks}
            />
            <Label htmlFor="page-breaks">Show Page Breaks</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="black-white"
              checked={blackAndWhite}
              onCheckedChange={setBlackAndWhite}
            />
            <Label htmlFor="black-white">Black & White Preview</Label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[50px] text-center">{zoom}%</span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Print Preview Area */}
      <div className="flex-1 overflow-auto p-8 bg-muted/30">
        <div className="flex justify-center">
          {/* A4 Paper Container */}
          <div 
            className={`bg-background shadow-lg transition-all duration-300 ${
              blackAndWhite ? 'grayscale' : ''
            }`}
            style={{
              width: `${210 * (zoom / 100)}mm`,
              minHeight: `${297 * (zoom / 100)}mm`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            {/* Page Break Indicator */}
            {showPageBreaks && (
              <div 
                className="absolute border-t-2 border-dashed border-red-400 z-10"
                style={{
                  top: `${297 * (zoom / 100)}mm`,
                  width: '100%'
                }}
              />
            )}

            {/* Print Content */}
            <div className="print-preview-content p-8 h-full">
              <PrintResumeContent 
                resumeData={resumeData} 
                templateId={templateId} 
                themeId={themeId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Print Settings Info */}
      <div className="p-4 bg-muted border-t">
        <p className="text-sm text-muted-foreground">
          <strong>Print Settings:</strong> Use A4 paper size, Portrait orientation, 
          and "More settings" → "Margins: Custom" → "20mm all sides" for best results.
        </p>
      </div>
    </div>
  );
};

// Print-optimized resume content component
const PrintResumeContent: React.FC<{
  resumeData: any;
  templateId: string;
  themeId: string;
}> = ({ resumeData, templateId, themeId }) => {
  if (!resumeData) return null;

  const personalInfo = resumeData.personalInfo || {};
  const experience = resumeData.experience || [];
  const education = resumeData.education || [];
  const skills = resumeData.skills || [];
  const summary = resumeData.summary || '';

  return (
    <div className="print:text-black print:bg-white space-y-6">
      {/* Header */}
      <header className="text-center border-b-2 border-foreground pb-4">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          {personalInfo.email && (
            <span>{personalInfo.email}</span>
          )}
          {personalInfo.phone && (
            <span>{personalInfo.phone}</span>
          )}
          {personalInfo.location && (
            <span>{personalInfo.location}</span>
          )}
          {personalInfo.linkedin && (
            <span>{personalInfo.linkedin}</span>
          )}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section>
          <h2 className="text-lg font-bold text-foreground border-b border-foreground mb-2">
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed text-foreground">{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-foreground border-b border-foreground mb-3">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {experience.map((job: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground">{job.position || job.title}</h3>
                    <p className="text-sm font-medium text-muted-foreground">
                      {job.company}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {job.startDate} - {job.endDate || 'Present'}
                  </span>
                </div>
                
                {job.description && (
                  <p className="text-sm text-foreground">{job.description}</p>
                )}

                {job.responsibilities && job.responsibilities.length > 0 && (
                  <ul className="text-sm space-y-1 ml-4">
                    {job.responsibilities.map((resp: string, respIndex: number) => (
                      <li key={respIndex} className="text-foreground list-disc">
                        {resp}
                      </li>
                    ))}
                  </ul>
                )}

                {job.achievements && job.achievements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Key Achievements:</h4>
                    <ul className="text-sm space-y-1 ml-4">
                      {job.achievements.map((achievement: string, achIndex: number) => (
                        <li key={achIndex} className="text-foreground list-disc">
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-foreground border-b border-foreground mb-3">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu: any, index: number) => (
              <div key={index} className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground">{edu.degree}</h3>
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  {edu.gpa && (
                    <p className="text-sm text-muted-foreground">GPA: {edu.gpa}</p>
                  )}
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {edu.graduationDate || `${edu.startDate} - ${edu.endDate}`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-foreground border-b border-foreground mb-3">
            Skills
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {skills.map((skillCategory: any, index: number) => (
              <div key={index}>
                <h3 className="font-medium text-foreground mb-1">
                  {skillCategory.category || 'Skills'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(skillCategory.skills || []).map((skill: string, skillIndex: number) => (
                    <span 
                      key={skillIndex} 
                      className="text-sm px-2 py-1 bg-muted text-foreground border border-border rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PrintPreviewLayout;