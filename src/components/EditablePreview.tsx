import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Edit3, Eye, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { generateVisualPdf, extractResumeDataFromEnhanced } from '@/lib/visualPdfGenerator';
import type { ResumeTemplate } from '@/lib/resumeTemplates';
import { supabase } from '@/integrations/supabase/client';

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
  const [enhancingFields, setEnhancingFields] = useState<Set<string>>(new Set());
  const previewRef = useRef<HTMLDivElement>(null);

  // Update editableData when enhancedContent changes
  React.useEffect(() => {
    if (enhancedContent) {
      console.log('🔍 EditablePreview - Updating with new enhanced content:', enhancedContent);
      setEditableData(enhancedContent);
    }
  }, [enhancedContent]);

  // Debug log when component renders
  console.log('🔍 EditablePreview render - editableData:', editableData);
  console.log('🔍 EditablePreview render - enhancedContent:', enhancedContent);

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
      console.log('🔍 Saving editable data:', editableData);
      console.log('🔍 Data being saved to localStorage:');
      console.log('  - Name:', editableData.name);
      console.log('  - Skills:', editableData.skills);
      console.log('  - Contact:', editableData.contact);
      
      // Update the parent component with new content
      onContentUpdate(editableData);
      
      // Store in local storage for persistence across redirects - this is used by PaymentSuccess
      localStorage.setItem('enhancedContentForPayment', JSON.stringify(editableData));
      
      // Also store in a backup key to ensure data persistence
      localStorage.setItem('latestEditedContent', JSON.stringify(editableData));
      
      console.log('✅ Data saved to localStorage successfully');
      
      toast.success('Changes saved successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnhanceField = async (fieldKey: string, currentValue: string, fieldLabel: string) => {
    const enhancementKey = fieldKey;
    
    if (enhancingFields.has(enhancementKey)) {
      return; // Already enhancing
    }

    if (!currentValue || currentValue.trim().length === 0) {
      toast.error('Field is empty. Nothing to enhance.');
      return;
    }

    setEnhancingFields(prev => new Set(prev).add(enhancementKey));

    try {
      console.log('🤖 Enhancing field:', fieldKey, 'with value:', currentValue);
      
      // Map field keys to types for better AI enhancement
      let fieldType = fieldKey;
      if (fieldKey.includes('description') || fieldKey.includes('responsibilities')) {
        fieldType = 'description';
      } else if (fieldKey.includes('title') && !fieldKey.includes('job')) {
        fieldType = 'title';
      } else if (fieldKey.includes('summary')) {
        fieldType = 'summary';
      } else if (fieldKey.includes('skills')) {
        fieldType = 'skills';
      } else if (fieldKey.includes('achievements') || fieldKey.includes('accomplishments')) {
        fieldType = 'achievements';
      }

      // Call the new enhance-field function for ATS optimization
      const { data, error } = await supabase.functions.invoke('enhance-field', {
        body: {
          fieldType: fieldType,
          content: currentValue,
          context: {
            industry: editableData.title || 'Professional',
            targetRole: editableData.title || 'Similar role',
            fieldLabel: fieldLabel
          }
        }
      });

      if (error) {
        console.error('Enhancement error:', error);
        toast.error(`Failed to enhance ${fieldLabel}. Please try again.`);
        return;
      }

      if (data?.enhancedContent) {
        console.log('✅ Field enhanced successfully:', data.enhancedContent);
        
        // Update the specific field with enhanced content
        const fieldPath = fieldKey.split('.');
        if (fieldPath.length === 1) {
          handleFieldChange(fieldPath[0], data.enhancedContent);
        } else if (fieldPath.length === 3) {
          // Handle array field enhancement like experience.0.description
          const [field, index, nestedField] = fieldPath;
          handleArrayFieldChange(field, parseInt(index), nestedField, data.enhancedContent);
        }
        
        toast.success(`${fieldLabel} enhanced with ATS optimization!`);
      } else {
        toast.error('Enhancement returned empty content. Please try again.');
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error(`Failed to enhance ${fieldLabel}. Please check your connection and try again.`);
    } finally {
      setEnhancingFields(prev => {
        const next = new Set(prev);
        next.delete(enhancementKey);
        return next;
      });
    }
  };


  const renderEditableField = (label: string, value: string, field: string, nestedField?: string, isTextarea: boolean = false) => {
    const actualValue = nestedField ? editableData[field]?.[nestedField] || '' : editableData[field] || '';
    const fieldKey = nestedField ? `${field}.${nestedField}` : field;
    const isEnhancing = enhancingFields.has(fieldKey);
    
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
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-muted-foreground">{label}</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleEnhanceField(fieldKey, actualValue, label)}
            disabled={isEnhancing || !actualValue.trim()}
            className="h-7 px-2 text-xs"
          >
            {isEnhancing ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
          </Button>
        </div>
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
                  {renderEditableField2('Duration', item.duration, field, 'duration', false, index)}
                  {item.description && renderEditableField2('Description', item.description, field, 'description', true, index)}
                  {item.achievements && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-muted-foreground">Achievements</label>
                        {isEditing && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEnhanceField(`${field}.${index}.achievements`, item.achievements.join('\n'), 'Achievements')}
                            disabled={enhancingFields.has(`${field}.${index}.achievements`) || !item.achievements.some((a: string) => a.trim())}
                            className="h-7 px-2 text-xs"
                          >
                            {enhancingFields.has(`${field}.${index}.achievements`) ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3 mr-1" />
                            )}
                            {enhancingFields.has(`${field}.${index}.achievements`) ? 'Enhancing...' : 'Enhance with AI'}
                          </Button>
                        )}
                      </div>
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
      const fieldKey = `${field}.${index}.${nestedField}`;
      const isEnhancing = enhancingFields.has(fieldKey);
      
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
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-muted-foreground">{label}</label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleEnhanceField(fieldKey, actualValue, label)}
              disabled={isEnhancing || !actualValue.trim()}
              className="h-7 px-2 text-xs"
            >
              {isEnhancing ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3 mr-1" />
              )}
              {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
            </Button>
          </div>
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

  // Show error if no enhanced content
  if (!editableData) {
    return (
      <div className={cn("w-full flex items-center justify-center min-h-[400px]", className)}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Enhanced Content Available</h3>
          <p className="text-muted-foreground">
            Resume enhancement failed or is still in progress. Please wait for the enhancement to complete or try uploading your file again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg gap-3 sm:gap-0">
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
                className="flex-1 sm:flex-none"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                onClick={handleSave} 
                variant="default" 
                size="sm"
                disabled={isSaving}
                className="flex-1 sm:flex-none"
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
              variant="hero" 
              size="lg"
              className="font-semibold shadow-glow hover:shadow-xl transition-all duration-300 animate-edit-pulse hover:animate-none w-full sm:w-auto"
            >
              <Edit3 className="h-5 w-5 mr-2 animate-pulse" />
              Edit Resume
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
          
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {renderEditableField('Email', editableData.email, 'email')}
            {renderEditableField('Phone', editableData.phone, 'phone')}
            {renderEditableField('Location', editableData.location, 'location')}
            {editableData.linkedin && renderEditableField('LinkedIn', editableData.linkedin, 'linkedin')}
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
        {editableData.skills && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: selectedColorTheme.primary }}>
              Skills
            </h3>
            {isEditing ? (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-muted-foreground">Skills</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const skillsString = (() => {
                        if (Array.isArray(editableData.skills)) {
                          return editableData.skills.map((skill: any) => {
                            if (typeof skill === 'string') return skill;
                            if (skill.items && Array.isArray(skill.items)) return skill.items.join(', ');
                            return '';
                          }).filter(s => s).join(', ');
                        }
                        return '';
                      })();
                      handleEnhanceField('skills', skillsString, 'Skills');
                    }}
                    disabled={enhancingFields.has('skills') || !editableData.skills?.length}
                    className="h-7 px-2 text-xs"
                  >
                    {enhancingFields.has('skills') ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 mr-1" />
                    )}
                    {enhancingFields.has('skills') ? 'Enhancing...' : 'Enhance with AI'}
                  </Button>
                </div>
                <Textarea
                  value={(() => {
                    // Handle different skill formats - convert to comma-separated string
                    if (Array.isArray(editableData.skills)) {
                      return editableData.skills.map((skill: any) => {
                        if (typeof skill === 'string') return skill;
                        if (skill.items && Array.isArray(skill.items)) return skill.items.join(', ');
                        return '';
                      }).filter(s => s).join(', ');
                    }
                    return '';
                  })()}
                  onChange={(e) => {
                    console.log('🔍 Skills onChange - Input value:', e.target.value);
                    setEditableData((prev: any) => {
                      const updated = { ...prev };
                      // Store as simple array of skill strings
                      const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
                      updated.skills = skillsArray;
                      console.log('🔍 Updated skills:', updated.skills);
                      return updated;
                    });
                  }}
                  className="w-full"
                  placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js, Python)"
                  rows={3}
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(() => {
                  // Handle different skill formats for display
                  let skillsToDisplay: string[] = [];
                  if (Array.isArray(editableData.skills)) {
                    editableData.skills.forEach((skill: any) => {
                      if (typeof skill === 'string') {
                        skillsToDisplay.push(skill);
                      } else if (skill.items && Array.isArray(skill.items)) {
                        skillsToDisplay.push(...skill.items);
                      }
                    });
                  }
                  return skillsToDisplay.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ));
                })()}
              </div>
            )}
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