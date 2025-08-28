import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Download, Edit3, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { generateVisualPdf, extractResumeDataFromEnhanced } from '@/lib/visualPdfGenerator';
import type { ResumeTemplate } from '@/lib/resumeTemplates';

interface EditablePreviewProps {
  enhancedContent: any;
  selectedTemplate: ResumeTemplate;
  selectedColorTheme: any;
  onContentUpdate: (updatedContent: any) => void;
  className?: string;
}

export const EditablePreview = ({ 
  enhancedContent, 
  selectedTemplate, 
  selectedColorTheme,
  onContentUpdate,
  className 
}: EditablePreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState(enhancedContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFieldChange = useCallback((field: string, value: any, nestedField?: string) => {
    setEditableData((prev: any) => {
      const updated = { ...prev };
      if (nestedField) {
        if (!updated[field]) updated[field] = {};
        updated[field][nestedField] = value;
      } else {
        updated[field] = value;
      }
      return updated;
    });
  }, []);

  const handleArrayFieldChange = useCallback((field: string, index: number, key: string, value: any) => {
    setEditableData((prev: any) => {
      const updated = { ...prev };
      if (!updated[field] || !Array.isArray(updated[field])) {
        updated[field] = [];
      }
      if (!updated[field][index]) {
        updated[field][index] = {};
      }
      updated[field][index][key] = value;
      return updated;
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update the parent component with new content
      onContentUpdate(editableData);
      
      // Store in session storage for persistence
      sessionStorage.setItem('enhancedContentForPayment', JSON.stringify(editableData));
      
      toast.success('Changes saved successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const resumeData = extractResumeDataFromEnhanced(editableData);
      const pdfBlob = await generateVisualPdf(resumeData, {
        templateType: selectedTemplate.layout,
        colorTheme: {
          primary: selectedColorTheme.primary,
          secondary: selectedColorTheme.secondary,
          accent: selectedColorTheme.accent
        },
        filename: `Edited_Resume_${editableData.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Resume'}_${new Date().getTime()}.pdf`
      });
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Edited_Resume_${editableData.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Resume'}_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Resume downloaded successfully!');
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderEditableField = (label: string, value: string, field: string, nestedField?: string, isTextarea: boolean = false) => {
    const actualValue = nestedField ? editableData[field]?.[nestedField] || '' : editableData[field] || '';
    
    if (!isEditing) {
      return actualValue ? (
        <div className="mb-2">
          <span className="text-sm font-medium text-muted-foreground">{label}:</span>
          <div className="text-sm">{actualValue}</div>
        </div>
      ) : null;
    }

    const InputComponent = isTextarea ? Textarea : Input;
    
    return (
      <div className="mb-3">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <InputComponent
          value={actualValue}
          onChange={(e) => handleFieldChange(field, e.target.value, nestedField)}
          className="mt-1"
          placeholder={`Enter ${label.toLowerCase()}`}
          rows={isTextarea ? 3 : undefined}
        />
      </div>
    );
  };

  const renderEditableArraySection = (title: string, field: string, items: any[]) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: selectedColorTheme.primary }}>
          {title}
        </h3>
        {items.map((item, index) => (
          <Card key={index} className="mb-4">
            <CardContent className="pt-4">
              {field === 'experience' && (
                <>
                  {renderEditableField2('Job Title', item.title, field, 'title', false, index)}
                  {renderEditableField2('Company', item.company, field, 'company', false, index)}
                  {renderEditableField2('Location', item.location, field, 'location', false, index)}
                  {renderEditableField2('Duration', item.duration, field, 'duration', false, index)}
                  {renderEditableField2('Description', item.description, field, 'description', true, index)}
                  {item.achievements && (
                    <div className="mb-3">
                      <label className="text-sm font-medium text-muted-foreground">Achievements</label>
                      <Textarea
                        value={item.achievements.join('\n')}
                        onChange={(e) => {
                          const achievements = e.target.value.split('\n').filter(a => a.trim());
                          handleArrayFieldChange(field, index, 'achievements', achievements);
                        }}
                        className="mt-1"
                        rows={4}
                        placeholder="Enter achievements (one per line)"
                        disabled={!isEditing}
                      />
                    </div>
                  )}
                </>
              )}
              
              {field === 'education' && (
                <>
                  {renderEditableField2('Degree', item.degree, field, 'degree', false, index)}
                  {renderEditableField2('Institution', item.institution, field, 'institution', false, index)}
                  {renderEditableField2('Year', item.year, field, 'year', false, index)}
                  {renderEditableField2('GPA', item.gpa, field, 'gpa', false, index)}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderEditableField2 = (label: string, value: string, field: string, nestedField: string | undefined, isTextarea: boolean, index?: number) => {
    if (index !== undefined) {
      const actualValue = editableData[field]?.[index]?.[nestedField!] || '';
      
      if (!isEditing) {
        return actualValue ? (
          <div className="mb-2">
            <span className="text-sm font-medium text-muted-foreground">{label}:</span>
            <div className="text-sm">{actualValue}</div>
          </div>
        ) : null;
      }

      const InputComponent = isTextarea ? Textarea : Input;
      
      return (
        <div className="mb-3">
          <label className="text-sm font-medium text-muted-foreground">{label}</label>
          <InputComponent
            value={actualValue}
            onChange={(e) => handleArrayFieldChange(field, index, nestedField!, e.target.value)}
            className="mt-1"
            placeholder={`Enter ${label.toLowerCase()}`}
            rows={isTextarea ? 3 : undefined}
          />
        </div>
      );
    }
    
    return renderEditableField(label, value, field, nestedField, isTextarea);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {isEditing ? "✏️ Edit Mode" : "👁️ Preview Mode"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button 
                onClick={() => setIsEditing(false)} 
                variant="outline" 
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                onClick={handleSave} 
                variant="default" 
                size="sm"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)} 
              variant="outline" 
              size="sm"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Editable Content */}
      <div ref={previewRef} className="border rounded-lg bg-background p-6 min-h-[600px]">
        {/* Personal Information */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            {editableData.profilePhotoUrl && (
              <img 
                src={editableData.profilePhotoUrl} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              {renderEditableField('Full Name', editableData.name, 'name')}
              {renderEditableField('Professional Title', editableData.title, 'title')}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {renderEditableField('Email', editableData.contact?.email, 'contact', 'email')}
            {renderEditableField('Phone', editableData.contact?.phone, 'contact', 'phone')}
            {renderEditableField('Location', editableData.contact?.location, 'contact', 'location')}
            {renderEditableField('LinkedIn', editableData.contact?.linkedin, 'contact', 'linkedin')}
          </div>
        </div>

        {/* Professional Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: selectedColorTheme.primary }}>
            Professional Summary
          </h3>
          {renderEditableField('Summary', editableData.summary, 'summary', undefined, true)}
        </div>

        {/* Experience */}
        {renderEditableArraySection('Professional Experience', 'experience', editableData.experience || [])}

        {/* Education */}
        {renderEditableArraySection('Education', 'education', editableData.education || [])}

        {/* Skills */}
        {editableData.skills && editableData.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: selectedColorTheme.primary }}>
              Skills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editableData.skills.map((skillCategory: any, categoryIndex: number) => (
                <Card key={categoryIndex} className="p-4">
                  <h4 className="font-medium mb-2">{skillCategory.category || 'Skills'}</h4>
                  {isEditing ? (
                    <Textarea
                      value={skillCategory.items?.join(', ') || ''}
                      onChange={(e) => {
                        const items = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                        handleArrayFieldChange('skills', categoryIndex, 'items', items);
                      }}
                      className="w-full"
                      placeholder="Enter skills separated by commas"
                      rows={2}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {skillCategory.items?.map((skill: string, skillIndex: number) => (
                        <Badge key={skillIndex} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {editableData.languages && editableData.languages.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: selectedColorTheme.primary }}>
              Languages
            </h3>
            {isEditing ? (
              <Textarea
                value={editableData.languages.map((lang: any) => typeof lang === 'string' ? lang : `${lang.language}: ${lang.proficiency}`).join(', ')}
                onChange={(e) => {
                  const languages = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                  setEditableData(prev => ({ ...prev, languages }));
                }}
                className="w-full"
                placeholder="Enter languages separated by commas"
                rows={2}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {editableData.languages.map((lang: any, index: number) => (
                  <Badge key={index} variant="outline">
                    {typeof lang === 'string' ? lang : `${lang.language}: ${lang.proficiency}`}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};