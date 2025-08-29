import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Edit3, Eye, Loader2, Sparkles, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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

  const addNewItem = useCallback((field: string, template: any) => {
    setEditableData((prev: any) => {
      const updated = { ...prev };
      if (!updated[field] || !Array.isArray(updated[field])) {
        updated[field] = [];
      }
      updated[field].push(template);
      return updated;
    });
  }, []);

  const removeItem = useCallback((field: string, index: number) => {
    setEditableData((prev: any) => {
      const updated = { ...prev };
      if (updated[field] && Array.isArray(updated[field])) {
        updated[field].splice(index, 1);
      }
      return updated;
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('🔍 Saving editable data:', editableData);
      
      // Update the parent component with new content
      onContentUpdate(editableData);
      
      // Store in local storage for persistence across redirects
      localStorage.setItem('enhancedContentForPayment', JSON.stringify(editableData));
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

  const renderPersonalDetails = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle style={{ color: selectedColorTheme.primary }}>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderEditableField('Full Name', editableData.name, 'name')}
        {renderEditableField('Professional Title', editableData.title, 'title')}
        {renderEditableField('Email', editableData.email, 'email')}
        {renderEditableField('Phone', editableData.phone, 'phone')}
        {renderEditableField('Location', editableData.location, 'location')}
        {renderEditableField('LinkedIn', editableData.linkedin, 'linkedin')}
        {renderEditableField('Website', editableData.website, 'website')}
      </CardContent>
    </Card>
  );

  const renderSummary = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle style={{ color: selectedColorTheme.primary }}>Professional Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {renderEditableField('Summary', editableData.summary, 'summary', undefined, true)}
      </CardContent>
    </Card>
  );

  const renderExperience = () => (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle style={{ color: selectedColorTheme.primary }}>Work Experience</CardTitle>
        {isEditing && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => addNewItem('experience', {
              title: '',
              company: '',
              location: '',
              startDate: '',
              endDate: '',
              description: '',
              responsibilities: [],
              achievements: []
            })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Experience
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editableData.experience?.map((exp: any, index: number) => (
          <Card key={index} className="mb-4 border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Experience {index + 1}</CardTitle>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeItem('experience', index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Job Title</label>
                  {isEditing ? (
                    <Input
                      value={exp.title || ''}
                      onChange={(e) => handleArrayFieldChange('experience', index, 'title', e.target.value)}
                      placeholder="Enter job title"
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm p-2 bg-muted rounded mt-1">{exp.title || 'No title'}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company</label>
                  {isEditing ? (
                    <Input
                      value={exp.company || ''}
                      onChange={(e) => handleArrayFieldChange('experience', index, 'company', e.target.value)}
                      placeholder="Enter company name"
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm p-2 bg-muted rounded mt-1">{exp.company || 'No company'}</div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  {isEditing ? (
                    <Input
                      value={exp.startDate || ''}
                      onChange={(e) => handleArrayFieldChange('experience', index, 'startDate', e.target.value)}
                      placeholder="e.g., January 2020"
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm p-2 bg-muted rounded mt-1">{exp.startDate || 'Not specified'}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">End Date</label>
                  {isEditing ? (
                    <Input
                      value={exp.endDate || ''}
                      onChange={(e) => handleArrayFieldChange('experience', index, 'endDate', e.target.value)}
                      placeholder="e.g., Present"
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm p-2 bg-muted rounded mt-1">{exp.endDate || 'Present'}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  {isEditing ? (
                    <Input
                      value={exp.location || ''}
                      onChange={(e) => handleArrayFieldChange('experience', index, 'location', e.target.value)}
                      placeholder="e.g., New York, NY"
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm p-2 bg-muted rounded mt-1">{exp.location || 'Not specified'}</div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Job Description & Achievements</label>
                {isEditing ? (
                  <Textarea
                    value={(() => {
                      const items = [];
                      if (exp.description) items.push(exp.description);
                      if (exp.responsibilities?.length > 0) {
                        items.push(...exp.responsibilities.map((r: string) => `• ${r}`));
                      }
                      if (exp.achievements?.length > 0) {
                        items.push(...exp.achievements.map((a: string) => `• ${a}`));
                      }
                      return items.join('\n');
                    })()}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n');
                      const description = lines.find(line => !line.startsWith('•')) || '';
                      const bulletPoints = lines
                        .filter(line => line.startsWith('•'))
                        .map(line => line.replace(/^[•\-]\s*/, '').trim())
                        .filter(line => line);
                      
                      handleArrayFieldChange('experience', index, 'description', description);
                      handleArrayFieldChange('experience', index, 'achievements', bulletPoints);
                    }}
                    className="mt-1"
                    rows={6}
                    placeholder="Enter job description and achievements (use • for bullet points)"
                  />
                ) : (
                  <div className="text-sm p-3 bg-muted rounded mt-1 space-y-1">
                    {exp.description && <p className="mb-2">{exp.description}</p>}
                    {exp.responsibilities?.map((resp: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{resp}</span>
                      </div>
                    ))}
                    {exp.achievements?.map((ach: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );

  const renderEducation = () => (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle style={{ color: selectedColorTheme.primary }}>Education</CardTitle>
        {isEditing && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => addNewItem('education', {
              degree: '',
              institution: '',
              location: '',
              year: '',
              gpa: '',
              honors: ''
            })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Education
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editableData.education?.map((edu: any, index: number) => (
          <Card key={index} className="mb-4 border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Education {index + 1}</CardTitle>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeItem('education', index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Degree</label>
                  {isEditing ? (
                    <Input
                      value={edu.degree || ''}
                      onChange={(e) => handleArrayFieldChange('education', index, 'degree', e.target.value)}
                      placeholder="e.g., Bachelor of Science"
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm p-2 bg-muted rounded mt-1">{edu.degree || 'No degree'}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Institution</label>
                  {isEditing ? (
                    <Input
                      value={edu.institution || ''}
                      onChange={(e) => handleArrayFieldChange('education', index, 'institution', e.target.value)}
                      placeholder="e.g., University of California"
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm p-2 bg-muted rounded mt-1">{edu.institution || 'No institution'}</div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Year</label>
                  {isEditing ? (
                    <Input
                      value={edu.year || ''}
                      onChange={(e) => handleArrayFieldChange('education', index, 'year', e.target.value)}
                      placeholder="e.g., 2020"
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm p-2 bg-muted rounded mt-1">{edu.year || 'Not specified'}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  {isEditing ? (
                    <Input
                      value={edu.location || ''}
                      onChange={(e) => handleArrayFieldChange('education', index, 'location', e.target.value)}
                      placeholder="e.g., Berkeley, CA"
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm p-2 bg-muted rounded mt-1">{edu.location || 'Not specified'}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">GPA</label>
                  {isEditing ? (
                    <Input
                      value={edu.gpa || ''}
                      onChange={(e) => handleArrayFieldChange('education', index, 'gpa', e.target.value)}
                      placeholder="e.g., 3.8/4.0"
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm p-2 bg-muted rounded mt-1">{edu.gpa || 'Not specified'}</div>
                  )}
                </div>
              </div>
              {(edu.honors || isEditing) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Honors & Distinctions</label>
                  {isEditing ? (
                    <Input
                      value={edu.honors || ''}
                      onChange={(e) => handleArrayFieldChange('education', index, 'honors', e.target.value)}
                      placeholder="e.g., Magna Cum Laude"
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm p-2 bg-muted rounded mt-1">{edu.honors}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );

  const renderSkills = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle style={{ color: selectedColorTheme.primary }}>Skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderSkillsSection('Technical Skills', 'technical')}
        {renderSkillsSection('Soft Skills', 'soft')}
        {renderSkillsSection('Languages', 'languages')}
        {renderSkillsSection('Tools & Software', 'tools')}
      </CardContent>
    </Card>
  );

  const renderSkillsSection = (title: string, key: string) => {
    const skills = editableData.skills?.[key] || [];
    
    return (
      <div>
        <label className="text-sm font-medium text-muted-foreground">{title}</label>
        {isEditing ? (
          <Textarea
            value={skills.join(', ')}
            onChange={(e) => {
              const skillsList = e.target.value.split(',').map(s => s.trim()).filter(s => s);
              handleFieldChange('skills', skillsList, key);
            }}
            className="mt-1"
            rows={2}
            placeholder={`Enter ${title.toLowerCase()} separated by commas`}
          />
        ) : (
          <div className="flex flex-wrap gap-2 mt-1">
            {skills.map((skill: string, index: number) => (
              <Badge key={index} variant="secondary">{skill}</Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCertifications = () => (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle style={{ color: selectedColorTheme.primary }}>Certifications</CardTitle>
        {isEditing && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => addNewItem('certifications', {
              name: '',
              issuer: '',
              date: '',
              url: ''
            })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Certification
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editableData.certifications?.map((cert: any, index: number) => (
          <Card key={index} className="mb-4 border-2">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Certification {index + 1}</h4>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeItem('certifications', index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Certification Name</label>
                  {isEditing ? (
                    <Input
                      value={cert.name || ''}
                      onChange={(e) => handleArrayFieldChange('certifications', index, 'name', e.target.value)}
                      placeholder="e.g., AWS Solutions Architect"
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm p-2 bg-muted rounded mt-1">{cert.name}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Issuing Organization</label>
                  {isEditing ? (
                    <Input
                      value={cert.issuer || ''}
                      onChange={(e) => handleArrayFieldChange('certifications', index, 'issuer', e.target.value)}
                      placeholder="e.g., Amazon Web Services"
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm p-2 bg-muted rounded mt-1">{cert.issuer}</div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date Obtained</label>
                  {isEditing ? (
                    <Input
                      value={cert.date || ''}
                      onChange={(e) => handleArrayFieldChange('certifications', index, 'date', e.target.value)}
                      placeholder="e.g., March 2023"
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm p-2 bg-muted rounded mt-1">{cert.date}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Certificate URL</label>
                  {isEditing ? (
                    <Input
                      value={cert.url || ''}
                      onChange={(e) => handleArrayFieldChange('certifications', index, 'url', e.target.value)}
                      placeholder="https://..."
                      className="mt-1"
                    />
                  ) : (
                    cert.url ? (
                      <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        View Certificate
                      </a>
                    ) : (
                      <div className="text-sm text-muted-foreground">No URL provided</div>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );

  const renderProjects = () => (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle style={{ color: selectedColorTheme.primary }}>Projects</CardTitle>
        {isEditing && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => addNewItem('projects', {
              name: '',
              description: '',
              technologies: [],
              url: '',
              date: ''
            })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Project
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editableData.projects?.map((project: any, index: number) => (
          <Card key={index} className="mb-4 border-2">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Project {index + 1}</h4>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeItem('projects', index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Project Name</label>
                {isEditing ? (
                  <Input
                    value={project.name || ''}
                    onChange={(e) => handleArrayFieldChange('projects', index, 'name', e.target.value)}
                    placeholder="e.g., E-commerce Website"
                    className="mt-1"
                  />
                ) : (
                  <div className="text-sm p-2 bg-muted rounded mt-1 font-medium">{project.name}</div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                {isEditing ? (
                  <Textarea
                    value={project.description || ''}
                    onChange={(e) => handleArrayFieldChange('projects', index, 'description', e.target.value)}
                    placeholder="Describe the project..."
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <div className="text-sm p-2 bg-muted rounded mt-1">{project.description}</div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Technologies Used</label>
                  {isEditing ? (
                    <Textarea
                      value={(project.technologies || []).join(', ')}
                      onChange={(e) => {
                        const techs = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                        handleArrayFieldChange('projects', index, 'technologies', techs);
                      }}
                      placeholder="e.g., React, Node.js, MongoDB"
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(project.technologies || []).map((tech: string, techIndex: number) => (
                        <Badge key={techIndex} variant="outline" className="text-xs">{tech}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project Date</label>
                  {isEditing ? (
                    <Input
                      value={project.date || ''}
                      onChange={(e) => handleArrayFieldChange('projects', index, 'date', e.target.value)}
                      placeholder="e.g., June 2023"
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm p-2 bg-muted rounded mt-1">{project.date}</div>
                  )}
                </div>
              </div>
              {(project.url || isEditing) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project URL</label>
                  {isEditing ? (
                    <Input
                      value={project.url || ''}
                      onChange={(e) => handleArrayFieldChange('projects', index, 'url', e.target.value)}
                      placeholder="https://..."
                      className="mt-1"
                    />
                  ) : (
                    project.url ? (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        View Project
                      </a>
                    ) : null
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );

  const renderAchievements = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle style={{ color: selectedColorTheme.primary }}>Achievements & Awards</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Achievements</label>
          {isEditing ? (
            <Textarea
              value={(editableData.achievements || []).join('\n')}
              onChange={(e) => {
                const achievements = e.target.value.split('\n').map(a => a.trim()).filter(a => a);
                handleFieldChange('achievements', achievements);
              }}
              className="mt-1"
              rows={4}
              placeholder="Enter achievements (one per line)"
            />
          ) : (
            <div className="mt-1 space-y-1">
              {(editableData.achievements || []).map((achievement: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-sm">{achievement}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("w-full", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {isEditing ? "✏️ Edit Mode" : "👁️ Preview Mode"}
          </span>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditableData(enhancedContent); // Reset to original
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary text-primary-foreground"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Resume
            </Button>
          )}
        </div>
      </div>

      {/* Resume Content */}
      <div ref={previewRef} className="space-y-6">
        {renderPersonalDetails()}
        {renderSummary()}
        {renderExperience()}
        {renderEducation()}
        {renderSkills()}
        {(editableData.certifications?.length > 0 || isEditing) && renderCertifications()}
        {(editableData.projects?.length > 0 || isEditing) && renderProjects()}
        {(editableData.achievements?.length > 0 || isEditing) && renderAchievements()}
      </div>
    </div>
  );
};