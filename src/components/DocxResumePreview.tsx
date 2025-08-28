import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Edit3, Eye, Loader2, Briefcase, GraduationCap, Award, User, MapPin, Phone, Mail, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ResumeTemplate } from '@/lib/resumeTemplates';
import type { BasicResumeData } from '@/lib/docxResumeParser';

interface DocxResumePreviewProps {
  parsedData: BasicResumeData;
  selectedTemplate: ResumeTemplate;
  selectedColorTheme: any;
  onContentUpdate: (updatedContent: BasicResumeData) => void;
  className?: string;
}

export const DocxResumePreview = ({ 
  parsedData, 
  selectedTemplate, 
  selectedColorTheme,
  onContentUpdate,
  className 
}: DocxResumePreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState(parsedData);
  const [isSaving, setIsSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFieldChange = useCallback((field: keyof BasicResumeData, value: any) => {
    setEditableData((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleArrayFieldChange = useCallback((field: keyof BasicResumeData, index: number, key: string, value: any) => {
    setEditableData((prev) => {
      const updated = { ...prev };
      const arrayField = updated[field] as any[];
      if (!arrayField || !Array.isArray(arrayField)) return prev;
      
      if (!arrayField[index]) {
        arrayField[index] = {};
      }
      arrayField[index][key] = value;
      return updated;
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onContentUpdate(editableData);
      toast.success('Changes saved successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditableField = (label: string, value: string, field: keyof BasicResumeData, isTextarea: boolean = false) => {
    if (!isEditing) {
      return value ? (
        <div className="mb-2">
          <span className="text-sm font-medium text-muted-foreground">{label}:</span>
          <div className="text-sm">{value}</div>
        </div>
      ) : null;
    }

    const InputComponent = isTextarea ? Textarea : Input;
    
    return (
      <div className="mb-3">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <InputComponent
          value={value}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          className="mt-1"
          placeholder={`Enter ${label.toLowerCase()}`}
          rows={isTextarea ? 3 : undefined}
        />
      </div>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-lg border-2" 
           style={{ 
             background: `linear-gradient(135deg, ${selectedColorTheme.primary}10, ${selectedColorTheme.secondary}10)`,
             borderColor: `${selectedColorTheme.primary}30`
           }}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: selectedColorTheme.primary }}>
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
                size="sm"
                disabled={isSaving}
                style={{ 
                  background: `linear-gradient(135deg, ${selectedColorTheme.primary}, ${selectedColorTheme.secondary})`,
                  color: 'white'
                }}
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
              style={{ borderColor: selectedColorTheme.primary, color: selectedColorTheme.primary }}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Resume Content - Modern Template Style */}
      <div ref={previewRef} className="bg-white rounded-xl shadow-lg overflow-hidden border border-border/50 print:shadow-none print:border-0 flex min-h-[600px]">
        {/* Left Sidebar */}
        <div 
          className="w-64 p-6 text-white"
          style={{
            background: `linear-gradient(180deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
          }}
        >
          {/* Sidebar Sections */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm tracking-wide uppercase">Contact</h3>
              </div>
              <div className="space-y-3 text-sm opacity-90">
                {editableData.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {isEditing ? (
                      <Input
                        value={editableData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className="border-none bg-transparent text-xs text-white placeholder-white/70"
                        placeholder="Email"
                      />
                    ) : (
                      <span className="break-all text-xs no-underline">{editableData.email}</span>
                    )}
                  </div>
                )}
                {editableData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {isEditing ? (
                      <Input
                        value={editableData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        className="border-none bg-transparent text-xs text-white placeholder-white/70"
                        placeholder="Phone"
                      />
                    ) : (
                      <span className="text-xs no-underline">{editableData.phone}</span>
                    )}
                  </div>
                )}
                {editableData.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {isEditing ? (
                      <Input
                        value={editableData.location}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
                        className="border-none bg-transparent text-xs text-white placeholder-white/70"
                        placeholder="Location"
                      />
                    ) : (
                      <span className="text-xs">{editableData.location}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {editableData.skills && editableData.skills.length > 0 && (
              <div className="page-break-avoid section">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm tracking-wide uppercase">Skills</h3>
                </div>
                {isEditing ? (
                  <Textarea
                    value={editableData.skills.join(', ')}
                    onChange={(e) => {
                      const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                      handleFieldChange('skills', skills);
                    }}
                    className="w-full bg-white/10 text-white placeholder-white/70 border-white/20 text-xs"
                    rows={4}
                    placeholder="Enter skills separated by commas"
                  />
                ) : (
                  <div className="space-y-2">
                    {editableData.skills.map((skill: string, index: number) => (
                      <div key={index} className="text-xs opacity-90 flex items-center gap-2 page-break-avoid skill-item">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                        <span className="font-medium">{skill}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Certifications */}
            {editableData.certifications && editableData.certifications.length > 0 && (
              <div className="page-break-avoid section">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm tracking-wide uppercase">Certifications</h3>
                </div>
                {isEditing ? (
                  <Textarea
                    value={editableData.certifications.join('\n')}
                    onChange={(e) => {
                      const certs = e.target.value.split('\n').map(c => c.trim()).filter(c => c);
                      handleFieldChange('certifications', certs);
                    }}
                    className="w-full bg-white/10 text-white placeholder-white/70 border-white/20 text-xs"
                    rows={3}
                    placeholder="Enter certifications (one per line)"
                  />
                ) : (
                  <div className="space-y-2 text-xs opacity-90">
                    {editableData.certifications.map((certification: string, index: number) => (
                      <div key={index} className="font-medium page-break-avoid">• {certification}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Education */}
            {editableData.education && editableData.education.length > 0 && (
              <div className="page-break-avoid section">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm tracking-wide uppercase">Education</h3>
                </div>
                <div className="space-y-3">
                  {editableData.education.slice(0, 2).map((edu: any, index: number) => (
                    <div key={index} className="text-xs opacity-90 page-break-avoid education-item">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={edu.degree}
                            onChange={(e) => handleArrayFieldChange('education', index, 'degree', e.target.value)}
                            className="bg-white/10 text-white placeholder-white/70 border-white/20 text-xs"
                            placeholder="Degree"
                          />
                          <Input
                            value={edu.institution}
                            onChange={(e) => handleArrayFieldChange('education', index, 'institution', e.target.value)}
                            className="bg-white/10 text-white placeholder-white/70 border-white/20 text-xs"
                            placeholder="Institution"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="font-medium">{edu.degree}</div>
                          <div className="text-xs opacity-75">{edu.institution}</div>
                          {edu.duration && edu.duration !== "N/A" && (
                            <div className="text-xs opacity-75">{edu.duration}</div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isEditing ? (
                <Input
                  value={editableData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="text-3xl font-bold border-none bg-transparent px-0"
                  placeholder="Your Name"
                />
              ) : (
                editableData.name || "Your Name"
              )}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Professional Resume
            </p>
          </div>

        {/* Professional Summary */}
        {editableData.summary && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5" style={{ color: selectedColorTheme.primary }} />
              <h2 className="text-xl font-semibold" style={{ color: selectedColorTheme.primary }}>
                Professional Summary
              </h2>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${selectedColorTheme.primary}, transparent)` }}></div>
            </div>
            {isEditing ? (
              <Textarea
                value={editableData.summary}
                onChange={(e) => handleFieldChange('summary', e.target.value)}
                className="w-full"
                rows={3}
                placeholder="Professional summary..."
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{editableData.summary}</p>
            )}
          </div>
        )}

        {/* Professional Experience */}
        {editableData.experience && editableData.experience.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5" style={{ color: selectedColorTheme.primary }} />
              <h2 className="text-xl font-semibold" style={{ color: selectedColorTheme.primary }}>
                Professional Experience
              </h2>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${selectedColorTheme.primary}, transparent)` }}></div>
            </div>
            
            {editableData.experience.map((exp, index) => (
              <div key={index} className="mb-6 p-4 rounded-lg" 
                   style={{ background: `${selectedColorTheme.accent}08` }}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg" style={{ color: selectedColorTheme.secondary }}>
                      {isEditing ? (
                        <Input
                          value={exp.position}
                          onChange={(e) => handleArrayFieldChange('experience', index, 'position', e.target.value)}
                          className="font-semibold"
                          placeholder="Job Title"
                        />
                      ) : (
                        exp.position
                      )}
                    </h3>
                    <p className="font-medium text-gray-800">
                      {isEditing ? (
                        <Input
                          value={exp.company}
                          onChange={(e) => handleArrayFieldChange('experience', index, 'company', e.target.value)}
                          placeholder="Company Name"
                        />
                      ) : (
                        exp.company
                      )}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {isEditing ? (
                      <>
                        <Input
                          value={exp.duration}
                          onChange={(e) => handleArrayFieldChange('experience', index, 'duration', e.target.value)}
                          className="text-sm mb-1"
                          placeholder="Duration"
                        />
                        <Input
                          value={exp.location}
                          onChange={(e) => handleArrayFieldChange('experience', index, 'location', e.target.value)}
                          className="text-sm"
                          placeholder="Location"
                        />
                      </>
                    ) : (
                      <>
                        <div>{exp.duration}</div>
                        <div>{exp.location}</div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Key Achievements/Responsibilities */}
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2" style={{ color: selectedColorTheme.secondary }}>
                      Key Achievements & Responsibilities
                    </h4>
                    {isEditing ? (
                      <Textarea
                        value={exp.responsibilities.join('\n')}
                        onChange={(e) => {
                          const responsibilities = e.target.value.split('\n').filter(r => r.trim());
                          handleArrayFieldChange('experience', index, 'responsibilities', responsibilities);
                        }}
                        className="w-full"
                        rows={4}
                        placeholder="Enter achievements and responsibilities (one per line)"
                      />
                    ) : (
                      <ul className="space-y-2">
                        {exp.responsibilities.map((responsibility, respIndex) => (
                          <li key={respIndex} className="flex items-start gap-2">
                            <div 
                              className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                              style={{ background: selectedColorTheme.primary }}
                            ></div>
                            <span className="text-gray-700 leading-relaxed">{responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {editableData.education && editableData.education.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5" style={{ color: selectedColorTheme.primary }} />
              <h2 className="text-xl font-semibold" style={{ color: selectedColorTheme.primary }}>
                Education
              </h2>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${selectedColorTheme.primary}, transparent)` }}></div>
            </div>
            
            {editableData.education.map((edu, index) => (
              <div key={index} className="mb-4 p-4 rounded-lg" 
                   style={{ background: `${selectedColorTheme.accent}05` }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold" style={{ color: selectedColorTheme.secondary }}>
                      {isEditing ? (
                        <Input
                          value={edu.degree}
                          onChange={(e) => handleArrayFieldChange('education', index, 'degree', e.target.value)}
                          placeholder="Degree"
                        />
                      ) : (
                        edu.degree
                      )}
                    </h3>
                    <p className="text-gray-800">
                      {isEditing ? (
                        <Input
                          value={edu.institution}
                          onChange={(e) => handleArrayFieldChange('education', index, 'institution', e.target.value)}
                          placeholder="Institution"
                        />
                      ) : (
                        edu.institution
                      )}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {isEditing ? (
                      <>
                        <Input
                          value={edu.duration}
                          onChange={(e) => handleArrayFieldChange('education', index, 'duration', e.target.value)}
                          className="text-sm mb-1"
                          placeholder="Duration"
                        />
                        <Input
                          value={edu.location}
                          onChange={(e) => handleArrayFieldChange('education', index, 'location', e.target.value)}
                          className="text-sm"
                          placeholder="Location"
                        />
                      </>
                    ) : (
                      <>
                        <div>{edu.duration}</div>
                        <div>{edu.location}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {editableData.skills && editableData.skills.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5" style={{ color: selectedColorTheme.primary }} />
              <h2 className="text-xl font-semibold" style={{ color: selectedColorTheme.primary }}>
                Technical Skills
              </h2>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${selectedColorTheme.primary}, transparent)` }}></div>
            </div>
            
            {isEditing ? (
              <Textarea
                value={editableData.skills.join(', ')}
                onChange={(e) => {
                  const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                  handleFieldChange('skills', skills);
                }}
                className="w-full"
                rows={2}
                placeholder="Enter skills separated by commas"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {editableData.skills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    className="px-3 py-1 text-sm font-medium"
                    style={{ 
                      background: `linear-gradient(135deg, ${selectedColorTheme.primary}15, ${selectedColorTheme.secondary}15)`,
                      color: selectedColorTheme.secondary,
                      border: `1px solid ${selectedColorTheme.primary}30`
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Certifications */}
        {editableData.certifications && editableData.certifications.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5" style={{ color: selectedColorTheme.primary }} />
              <h2 className="text-xl font-semibold" style={{ color: selectedColorTheme.primary }}>
                Certifications
              </h2>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${selectedColorTheme.primary}, transparent)` }}></div>
            </div>
            
            {isEditing ? (
              <Textarea
                value={editableData.certifications.join('\n')}
                onChange={(e) => {
                  const certs = e.target.value.split('\n').map(c => c.trim()).filter(c => c);
                  handleFieldChange('certifications', certs);
                }}
                className="w-full"
                rows={3}
                placeholder="Enter certifications (one per line)"
              />
            ) : (
              <ul className="space-y-2">
                {editableData.certifications.map((cert, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: selectedColorTheme.accent }}
                    ></div>
                    <span className="text-gray-700">{cert}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};