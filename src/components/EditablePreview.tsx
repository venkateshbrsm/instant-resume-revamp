import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Edit3, Eye, Loader2, Sparkles } from 'lucide-react';
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
  const previewRef = useRef<HTMLDivElement>(null);

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

  const enhanceWorkExperience = useCallback(async (index: number) => {
    try {
      toast.success('AI Enhancement feature coming soon!');
      // TODO: Implement AI enhancement for individual work experience entries
    } catch (error) {
      toast.error('Enhancement failed. Please try again.');
    }
  }, []);


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
        <h3 className="text-lg font-semibold mb-4" style={{ color: selectedColorTheme.primary }}>
          {title}
        </h3>
        {items.map((item, index) => (
          <Card key={index} className="mb-6 border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  {field === 'experience' ? `Experience ${index + 1}` : `Education ${index + 1}`}
                </CardTitle>
                {field === 'experience' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => enhanceWorkExperience(index)}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Enhance
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {field === 'experience' && (
                <>
                  {/* Position Field */}
                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Position</label>
                    {isEditing ? (
                      <Input
                        value={item.title || ''}
                        onChange={(e) => handleArrayFieldChange(field, index, 'title', e.target.value)}
                        placeholder="Enter job title"
                        className="bg-blue-50 border-blue-200"
                      />
                    ) : (
                      <div className="text-sm p-2 bg-gray-50 rounded border">
                        {item.title || 'No title specified'}
                      </div>
                    )}
                  </div>

                  {/* Employer and City */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Employer</label>
                      {isEditing ? (
                        <Input
                          value={item.company || ''}
                          onChange={(e) => handleArrayFieldChange(field, index, 'company', e.target.value)}
                          placeholder="Enter company name"
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-sm p-2 bg-gray-50 rounded border mt-1">
                          {item.company || 'No company specified'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">City</label>
                      {isEditing ? (
                        <Input
                          value={item.location || item.city || ''}
                          onChange={(e) => handleArrayFieldChange(field, index, 'location', e.target.value)}
                          placeholder="Enter city"
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-sm p-2 bg-gray-50 rounded border mt-1">
                          {item.location || item.city || 'No location specified'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                      {isEditing ? (
                        <Input
                          value={item.startDate || item.duration?.split(' to ')[0] || ''}
                          onChange={(e) => handleArrayFieldChange(field, index, 'startDate', e.target.value)}
                          placeholder="e.g., August 2021"
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-sm p-2 bg-gray-50 rounded border mt-1">
                          {item.startDate || item.duration?.split(' to ')[0] || 'No start date'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">End Date</label>
                      {isEditing ? (
                        <Input
                          value={item.endDate || item.duration?.split(' to ')[1] || 'Present'}
                          onChange={(e) => handleArrayFieldChange(field, index, 'endDate', e.target.value)}
                          placeholder="e.g., Present"
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-sm p-2 bg-gray-50 rounded border mt-1">
                          {item.endDate || item.duration?.split(' to ')[1] || 'Present'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description/Responsibilities */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    {isEditing ? (
                      <Textarea
                        value={(() => {
                          if (item.achievements && Array.isArray(item.achievements)) {
                            return item.achievements.map(achievement => `• ${achievement}`).join('\n');
                          } else if (item.core_responsibilities && Array.isArray(item.core_responsibilities)) {
                            return item.core_responsibilities.map(resp => `• ${resp}`).join('\n');
                          } else if (item.description) {
                            return item.description;
                          }
                          return '';
                        })()}
                        onChange={(e) => {
                          const lines = e.target.value.split('\n').map(line => line.replace(/^[•\-]\s*/, '').trim()).filter(line => line);
                          handleArrayFieldChange(field, index, 'achievements', lines);
                        }}
                        className="mt-1"
                        rows={8}
                        placeholder="Enter job responsibilities and achievements (one per line)"
                      />
                    ) : (
                      <div className="text-sm p-3 bg-gray-50 rounded border mt-1 space-y-1">
                        {(() => {
                          let items_to_show = [];
                          if (item.achievements && Array.isArray(item.achievements)) {
                            items_to_show = item.achievements;
                          } else if (item.core_responsibilities && Array.isArray(item.core_responsibilities)) {
                            items_to_show = item.core_responsibilities;
                          } else if (item.description) {
                            items_to_show = [item.description];
                          }
                          
                          return items_to_show.map((achievement, achIndex) => (
                            <div key={achIndex} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{achievement}</span>
                            </div>
                          ));
                        })()}
                        {(!item.achievements?.length && !item.core_responsibilities?.length && !item.description) && (
                          <span className="text-muted-foreground">No description provided</span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {field === 'education' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Degree</label>
                      {isEditing ? (
                        <Input
                          value={item.degree || ''}
                          onChange={(e) => handleArrayFieldChange(field, index, 'degree', e.target.value)}
                          placeholder="Enter degree"
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-sm p-2 bg-gray-50 rounded border mt-1">
                          {item.degree || 'No degree specified'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Institution</label>
                      {isEditing ? (
                        <Input
                          value={item.institution || ''}
                          onChange={(e) => handleArrayFieldChange(field, index, 'institution', e.target.value)}
                          placeholder="Enter institution"
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-sm p-2 bg-gray-50 rounded border mt-1">
                          {item.institution || 'No institution specified'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Year</label>
                      {isEditing ? (
                        <Input
                          value={item.year || ''}
                          onChange={(e) => handleArrayFieldChange(field, index, 'year', e.target.value)}
                          placeholder="Enter year"
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-sm p-2 bg-gray-50 rounded border mt-1">
                          {item.year || 'No year specified'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">GPA</label>
                      {isEditing ? (
                        <Input
                          value={item.gpa || ''}
                          onChange={(e) => handleArrayFieldChange(field, index, 'gpa', e.target.value)}
                          placeholder="Enter GPA (optional)"
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-sm p-2 bg-gray-50 rounded border mt-1">
                          {item.gpa || 'No GPA specified'}
                        </div>
                      )}
                    </div>
                  </div>
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