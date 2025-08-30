import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Save, Loader2, AlertCircle, Sparkles } from 'lucide-react';
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
  onAutoEnhancementStateChange?: (isAutoEnhancing: boolean) => void;
  onSaveRequired?: (saveFunction: (isAutoSave?: boolean) => Promise<void>) => void;
  className?: string;
}

export const EditablePreview = ({ 
  enhancedContent, 
  selectedTemplate, 
  selectedColorTheme,
  onContentUpdate,
  onAutoEnhancementStateChange,
  onSaveRequired,
  className 
}: EditablePreviewProps) => {
  const [editableData, setEditableData] = useState(enhancedContent);
  const [enhancingFields, setEnhancingFields] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(0);
  const [isAutoEnhancing, setIsAutoEnhancing] = useState(false);
  const [autoEnhanceProgress, setAutoEnhanceProgress] = useState(0);
  const [autoEnhanceTotal, setAutoEnhanceTotal] = useState(0);
  const [currentEnhancingField, setCurrentEnhancingField] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  // Create a stable session-based resume ID that persists across tab switches
  const resumeId = useMemo(() => {
    const baseContent = enhancedContent || editableData;
    
    // Create a content-based hash for uniqueness
    const contentKey = JSON.stringify({
      name: baseContent?.name,
      email: baseContent?.email,
      phone: baseContent?.phone,
      extractedAt: baseContent?.extractedAt
    });
    
    // Check if we have a session ID for this content
    const sessionStorageKey = 'currentResumeSessionId';
    const currentSessionId = sessionStorage.getItem(sessionStorageKey);
    const currentContentKey = sessionStorage.getItem('currentResumeContentKey');
    
    // If content is the same as current session, reuse the session ID
    if (currentSessionId && currentContentKey === contentKey) {
      console.log('🔄 Reusing existing session ID for resume:', currentSessionId);
      return currentSessionId;
    }
    
    // Generate new session ID for new content
    const newSessionId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(sessionStorageKey, newSessionId);
    sessionStorage.setItem('currentResumeContentKey', contentKey);
    
    console.log('🆕 Created new session ID for resume:', newSessionId);
    return newSessionId;
  }, [enhancedContent]);

  // Check if resume has been auto-enhanced using localStorage
  const hasBeenAutoEnhanced = useMemo(() => {
    try {
      const enhancedResumes = JSON.parse(localStorage.getItem('autoEnhancedResumes') || '[]');
      return enhancedResumes.includes(resumeId);
    } catch {
      return false;
    }
  }, [resumeId]);

  // Mark resume as auto-enhanced in localStorage
  const markAsAutoEnhanced = useCallback((id: string) => {
    try {
      const enhancedResumes = JSON.parse(localStorage.getItem('autoEnhancedResumes') || '[]');
      if (!enhancedResumes.includes(id)) {
        enhancedResumes.push(id);
        localStorage.setItem('autoEnhancedResumes', JSON.stringify(enhancedResumes));
        console.log('✅ Marked resume as auto-enhanced:', id);
      }
    } catch (error) {
      console.error('Failed to save auto-enhanced resume ID:', error);
    }
  }, []);

  // Clear session when new content is uploaded
  const clearSession = useCallback(() => {
    try {
      sessionStorage.removeItem('currentResumeSessionId');
      sessionStorage.removeItem('currentResumeContentKey');
      console.log('🧹 Cleared session storage for new upload');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }, []);

  // Cleanup session if content changes significantly (new upload detected)
  useEffect(() => {
    if (enhancedContent?.extractedAt) {
      const currentContentKey = sessionStorage.getItem('currentResumeContentKey');
      const newContentKey = JSON.stringify({
        name: enhancedContent.name,
        email: enhancedContent.email,
        phone: enhancedContent.phone,
        extractedAt: enhancedContent.extractedAt
      });
      
      // If we have a session but content is completely different, clear it
      if (currentContentKey && currentContentKey !== newContentKey) {
        console.log('🔄 New upload detected, clearing previous session');
        clearSession();
      }
    }
  }, [enhancedContent?.extractedAt, clearSession]);

  // Auto-enhance all fields once when component mounts
  useEffect(() => {
    console.log('🔍 Auto-enhancement check:', {
      hasBeenAutoEnhanced,
      hasEnhancedContent: !!enhancedContent,
      resumeId: resumeId.substring(0, 50) + '...',
      enhancedResumes: JSON.parse(localStorage.getItem('autoEnhancedResumes') || '[]')
    });
    
    if (!hasBeenAutoEnhanced && enhancedContent) {
      const autoEnhanceAllFields = async () => {
        console.log('🤖 Starting auto-enhancement for session ID:', resumeId);
        
        // Mark this resume as auto-enhanced FIRST to prevent re-runs
        markAsAutoEnhanced(resumeId);
        
        // Define fields to auto-enhance (excluding basic info fields and skills)
        const fieldsToEnhance = [
          { key: 'summary', label: 'Professional Summary' }
        ];
        
        // Add experience descriptions
        if (enhancedContent?.experience) {
          enhancedContent.experience.forEach((_, index) => {
            fieldsToEnhance.push({
              key: `experience.${index}.description`,
              label: 'Job Description'
            });
          });
        }
        
        console.log('🔍 Fields to enhance:', fieldsToEnhance.map(f => f.key));
        
        // Start auto-enhancement
        setIsAutoEnhancing(true);
        setAutoEnhanceTotal(fieldsToEnhance.length);
        setAutoEnhanceProgress(0);
        
        // Auto-enhance fields with a delay between each
        for (let i = 0; i < fieldsToEnhance.length; i++) {
          const field = fieldsToEnhance[i];
          setCurrentEnhancingField(field.label);
          
          try {
            console.log(`🤖 Enhancing field ${i + 1}/${fieldsToEnhance.length}: ${field.key}`);
            await handleEnhanceField(field.key, field.label);
            setAutoEnhanceProgress(i + 1);
            // Small delay between enhancements to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`❌ Failed to auto-enhance ${field.key}:`, error);
          }
        }
        
        // Complete auto-enhancement
        setIsAutoEnhancing(false);
        setCurrentEnhancingField('');
        console.log('✅ Auto-enhancement completed for session:', resumeId);
        toast.success('All fields enhanced successfully!');
      };
      
      // Start auto-enhancement after a short delay
      setTimeout(autoEnhanceAllFields, 500);
    } else {
      console.log('🚫 Skipping auto-enhancement:', {
        reason: !hasBeenAutoEnhanced ? 'no content' : 'already enhanced',
        hasBeenAutoEnhanced,
        hasContent: !!enhancedContent
      });
    }
  }, [hasBeenAutoEnhanced, enhancedContent, resumeId, markAsAutoEnhanced]);

  // Notify parent about auto-enhancement state changes
  useEffect(() => {
    if (onAutoEnhancementStateChange) {
      onAutoEnhancementStateChange(isAutoEnhancing);
    }
  }, [isAutoEnhancing, onAutoEnhancementStateChange]);

  const handleSave = useCallback(async (isAutoSave = false) => {
    // Only throttle manual saves, allow auto-saves to proceed
    const now = Date.now();
    if (!isAutoSave && now - lastSaveTime < 1000) {
      console.log('⏱️ Skipping manual save - too recent');
      return;
    }
    
    console.log(`💾 ${isAutoSave ? 'Auto-saving' : 'Manual saving'} content...`);
    setIsSaving(true);
    setLastSaveTime(now);
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
      
      // Only show toast for manual saves, not auto-saves
      if (!isAutoSave) {
        toast.success('Changes saved successfully!');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [editableData, onContentUpdate, lastSaveTime]);

  // Expose save function to parent - include handleSave to ensure fresh reference
  useEffect(() => {
    if (onSaveRequired) {
      onSaveRequired(handleSave);
    }
  }, [onSaveRequired, handleSave]);

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

  const handleEnhanceField = async (fieldKey: string, fieldLabel: string) => {
    const enhancementKey = fieldKey;
    
    if (enhancingFields.has(enhancementKey)) {
      return; // Already enhancing
    }

    // Dynamically get the current field value
    const getCurrentValue = (key: string): string => {
      const parts = key.split('.');
      let current: any = editableData;
      
      for (const part of parts) {
        if (current && typeof current === 'object') {
          if (!isNaN(Number(part))) {
            // It's an array index
            current = current[Number(part)];
          } else {
            current = current[part];
          }
        } else {
          return '';
        }
      }
      
      // Handle different data types
      if (Array.isArray(current)) {
        return current.join('\n');
      } else if (typeof current === 'string') {
        return current;
      } else if (current && typeof current === 'object') {
        return JSON.stringify(current);
      }
      
      return current ? String(current) : '';
    };

    const currentValue = getCurrentValue(fieldKey);

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
    
    // Fields that should NOT have the enhance button
    const excludedFields = ['name', 'email', 'phone', 'title', 'location', 'linkedin'];
    const shouldShowEnhanceButton = !excludedFields.includes(field);

    const InputComponent = isTextarea ? Textarea : Input;
    
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-muted-foreground">{label}</label>
          {shouldShowEnhanceButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleEnhanceField(fieldKey, label)}
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
          )}
        </div>
        <InputComponent
          value={actualValue}
          onChange={(e) => handleFieldChange(field, e.target.value, nestedField)}
          className="mt-1"
          placeholder={`Enter ${label.toLowerCase()}`}
          rows={isTextarea ? 3 : undefined}
          disabled={isAutoEnhancing}
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEnhanceField(`${field}.${index}.achievements`, 'Achievements')}
                          disabled={enhancingFields.has(`${field}.${index}.achievements`) || !Array.isArray(item.achievements) || !item.achievements.some((a: string) => a.trim())}
                          className="h-7 px-2 text-xs"
                        >
                          {enhancingFields.has(`${field}.${index}.achievements`) ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3 mr-1" />
                          )}
                          {enhancingFields.has(`${field}.${index}.achievements`) ? 'Enhancing...' : 'Enhance with AI'}
                        </Button>
                      </div>
                      <Textarea
                        value={Array.isArray(item.achievements) ? item.achievements.join('\n') : (item.achievements || '')}
                        onChange={(e) => {
                          const achievements = e.target.value.split('\n').filter(a => a.trim());
                          handleArrayFieldChange(field, index, 'achievements', achievements);
                        }}
                        className="mt-1"
                        rows={4}
                        placeholder="Enter achievements (one per line)"
                        disabled={isAutoEnhancing}
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
      
      // Fields that should NOT have the enhance button for experience and education
      const excludedExperienceFields = ['title', 'company', 'duration'];
      const excludedEducationFields = ['degree', 'institution', 'year', 'gpa'];
      const shouldShowEnhanceButton = !(
        (field === 'experience' && excludedExperienceFields.includes(nestedField!)) ||
        (field === 'education' && excludedEducationFields.includes(nestedField!))
      );

      const InputComponent = isTextarea ? Textarea : Input;
      
      return (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-muted-foreground">{label}</label>
            {shouldShowEnhanceButton && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleEnhanceField(fieldKey, label)}
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
            )}
          </div>
          <InputComponent
            value={actualValue}
            onChange={(e) => handleArrayFieldChange(field, index, nestedField!, e.target.value)}
            className="mt-1"
            placeholder={`Enter ${label.toLowerCase()}`}
            rows={isTextarea ? 3 : undefined}
            disabled={isAutoEnhancing}
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
            ✏️ Edit Mode - Changes auto-save when switching tabs
          </span>
        </div>
      </div>

      {/* Auto Enhancement Progress */}
      {isAutoEnhancing && (
        <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="flex-1">
              <h4 className="font-medium text-primary">Enhancing Resume with AI</h4>
              <p className="text-sm text-muted-foreground">
                Currently enhancing: {currentEnhancingField}
              </p>
            </div>
            <div className="text-sm font-medium text-primary">
              {autoEnhanceProgress}/{autoEnhanceTotal}
            </div>
          </div>
          <Progress 
            value={(autoEnhanceProgress / autoEnhanceTotal) * 100} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Please wait while we optimize your resume content for ATS compatibility...
          </p>
        </div>
      )}

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
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-muted-foreground">Skills</label>
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
                disabled={isAutoEnhancing}
              />
            </div>
          </div>
        )}

        {/* Languages */}
        {editableData.languages && editableData.languages.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: selectedColorTheme.primary }}>
              Languages
            </h3>
            <Textarea
              value={editableData.languages.map((lang: any) => typeof lang === 'string' ? lang : `${lang.language}: ${lang.proficiency}`).join(', ')}
              onChange={(e) => {
                const languages = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                setEditableData(prev => ({ ...prev, languages }));
              }}
              className="w-full"
              placeholder="Enter languages separated by commas"
              rows={2}
              disabled={isAutoEnhancing}
            />
          </div>
        )}
      </div>
    </div>
  );
};