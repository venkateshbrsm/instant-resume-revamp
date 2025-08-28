import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
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

// Helper function to format phone number
const formatPhoneNumber = (phone: string) => {
  if (!phone) return phone;
  
  // Remove all non-digit characters first
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If it starts with 91 (India code) and has 12 digits total, format as +91-XXXXXXXXXX
  if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
    const countryCode = digitsOnly.slice(0, 2);
    const number = digitsOnly.slice(2);
    return `+${countryCode}-${number}`;
  }
  
  // If it's 10 digits, assume it's Indian number without country code
  if (digitsOnly.length === 10) {
    return `+91-${digitsOnly}`;
  }
  
  // Otherwise return as is
  return phone;
};

// Helper function to calculate total years of experience
const calculateTotalExperience = (experience: any[]): number => {
  if (!experience || experience.length === 0) return 0;
  
  let totalMonths = 0;
  
  experience.forEach((exp) => {
    if (!exp.duration) return;
    
    const duration = exp.duration.toLowerCase();
    
    // Parse different date formats
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                       'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    
    // Extract years and months from duration string
    const yearMatches = duration.match(/\b\d{4}\b/g);
    const monthMatches = duration.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/g);
    
    if (yearMatches && yearMatches.length >= 2) {
      // Format: "Jan 2020 - Dec 2022" or "2020 - 2022"
      const startYear = parseInt(yearMatches[0]);
      const endYear = parseInt(yearMatches[1]);
      
      let startMonth = 0;
      let endMonth = 11; // Default to December
      
      if (monthMatches && monthMatches.length >= 2) {
        startMonth = monthNames.indexOf(monthMatches[0].substring(0, 3));
        endMonth = monthNames.indexOf(monthMatches[1].substring(0, 3));
      } else if (monthMatches && monthMatches.length === 1) {
        startMonth = monthNames.indexOf(monthMatches[0].substring(0, 3));
      }
      
      const totalJobMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
      totalMonths += totalJobMonths;
      
    } else if (yearMatches && yearMatches.length === 1) {
      // Format: "2022 - Present" or similar
      const startYear = parseInt(yearMatches[0]);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      
      let startMonth = 0;
      if (monthMatches && monthMatches.length >= 1) {
        startMonth = monthNames.indexOf(monthMatches[0].substring(0, 3));
      }
      
      if (duration.includes('present') || duration.includes('current')) {
        const totalJobMonths = (currentYear - startYear) * 12 + (currentMonth - startMonth) + 1;
        totalMonths += totalJobMonths;
      }
    }
  });
  
  // Convert months to years (rounded to 1 decimal place)
  return Math.round((totalMonths / 12) * 10) / 10;
};

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
      <div ref={previewRef} className="bg-white rounded-xl shadow-lg overflow-hidden border border-border/50 print:shadow-none print:border-0">
        <div className="flex min-h-[600px]">
          {/* Left Sidebar */}
          <div 
            className="w-64 flex-shrink-0 p-6 text-white"
            style={{
              background: `linear-gradient(180deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
            }}
          >
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
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      {isEditing ? (
                        <Input
                          value={editableData.email}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          className="border-none bg-white/10 text-xs text-white placeholder-white/70 flex-1"
                          placeholder="Email"
                        />
                      ) : (
                        <span className="break-all text-xs no-underline">{editableData.email}</span>
                      )}
                    </div>
                  )}
                  {editableData.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      {isEditing ? (
                        <Input
                          value={editableData.phone}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          className="border-none bg-white/10 text-xs text-white placeholder-white/70 flex-1"
                          placeholder="Phone"
                        />
                      ) : (
                        <span className="text-xs no-underline">{formatPhoneNumber(editableData.phone)}</span>
                      )}
                    </div>
                  )}
                  {editableData.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {isEditing ? (
                        <Input
                          value={editableData.location}
                          onChange={(e) => handleFieldChange('location', e.target.value)}
                          className="border-none bg-white/10 text-xs text-white placeholder-white/70 flex-1"
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
                <div>
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
                        <div key={index} className="text-xs opacity-90 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0"></div>
                          <span className="font-medium">{skill}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Education */}
              {editableData.education && editableData.education.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-sm tracking-wide uppercase">Education</h3>
                  </div>
                  <div className="space-y-3">
                    {editableData.education.slice(0, 2).map((edu: any, index: number) => (
                      <div key={index} className="text-xs opacity-90">
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

              {/* Certifications */}
              {editableData.certifications && editableData.certifications.length > 0 && (
                <div>
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
                        <div key={index} className="font-medium">• {certification}</div>
                      ))}
                    </div>
                  )}
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
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase className="w-5 h-5" style={{ color: selectedColorTheme.primary }} />
                  <h2 className="text-xl font-semibold" style={{ color: selectedColorTheme.primary }}>
                    Professional Experience
                  </h2>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${selectedColorTheme.primary}, transparent)` }}></div>
                  <span className="text-sm font-medium px-3 py-1 rounded-full border-2" 
                        style={{ 
                          borderColor: selectedColorTheme.primary + '30',
                          background: selectedColorTheme.primary + '10',
                          color: selectedColorTheme.primary 
                        }}>
                    {calculateTotalExperience(editableData.experience)} Years Total
                  </span>
                </div>
                
                <div className="space-y-6">
                  {editableData.experience.map((exp, index) => (
                    <div key={index} className="mb-6">
                      {/* Company Name and Dates - Single Line Header */}
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/30">
                        <div className="flex items-center gap-4">
                          {exp.company && (
                            <>
                              {isEditing ? (
                                <Input
                                  value={exp.company}
                                  onChange={(e) => handleArrayFieldChange('experience', index, 'company', e.target.value)}
                                  className="text-lg font-bold"
                                  placeholder="Company Name"
                                  style={{ color: selectedColorTheme.primary }}
                                />
                              ) : (
                                <h3 className="text-lg font-bold" style={{ color: selectedColorTheme.primary }}>
                                  {exp.company}
                                </h3>
                              )}
                            </>
                          )}
                          
                          {exp.duration && (
                            <>
                              {isEditing ? (
                                <Input
                                  value={exp.duration}
                                  onChange={(e) => handleArrayFieldChange('experience', index, 'duration', e.target.value)}
                                  className="text-sm font-medium"
                                  placeholder="Duration"
                                />
                              ) : (
                                <span className="text-sm font-medium text-muted-foreground">
                                  {exp.duration}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        
                        {exp.location && (
                          <div className="text-sm text-muted-foreground italic">
                            {isEditing ? (
                              <Input
                                value={exp.location}
                                onChange={(e) => handleArrayFieldChange('experience', index, 'location', e.target.value)}
                                className="text-sm"
                                placeholder="Location"
                              />
                            ) : (
                              exp.location
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Job Position - Secondary - Only show if exists */}
                      {exp.position && exp.position !== 'Position' && (
                        <div className="mb-3">
                          {isEditing ? (
                            <Input
                              value={exp.position}
                              onChange={(e) => handleArrayFieldChange('experience', index, 'position', e.target.value)}
                              className="text-base font-medium"
                              placeholder="Job Title"
                            />
                          ) : (
                            <p className="text-base font-medium text-foreground/80">{exp.position}</p>
                          )}
                        </div>
                      )}
                      
                      {/* Work Experience as Bullet Points */}
                      {exp.responsibilities && exp.responsibilities.length > 0 && (
                        <div>
                          {isEditing ? (
                            <Textarea
                              value={exp.responsibilities.join('\n')}
                              onChange={(e) => {
                                const responsibilities = e.target.value.split('\n').filter(r => r.trim());
                                handleArrayFieldChange('experience', index, 'responsibilities', responsibilities);
                              }}
                              className="w-full"
                              rows={4}
                              placeholder="Enter work experience and achievements (one per line)"
                            />
                          ) : (
                            <ul className="space-y-2 ml-4">
                              {exp.responsibilities.map((responsibility, respIndex) => (
                                <li key={respIndex} className="flex items-start gap-2">
                                  <span className="text-muted-foreground mt-2 text-xs">•</span>
                                  <span className="text-sm text-foreground leading-relaxed">
                                    {responsibility}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Engagements */}
            {editableData.previousEngagements && editableData.previousEngagements.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase className="w-5 h-5" style={{ color: selectedColorTheme.primary }} />
                  <h2 className="text-xl font-semibold" style={{ color: selectedColorTheme.primary }}>
                    Previous Engagements
                  </h2>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${selectedColorTheme.primary}, transparent)` }}></div>
                </div>
                
                <div className="space-y-4">
                  {editableData.previousEngagements.map((engagement, index) => (
                    <div key={index} className="border-l-4 pl-4 py-2" style={{ borderColor: selectedColorTheme.primary + '30' }}>
                      {/* Position and Company */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <Input
                              value={engagement.position}
                              onChange={(e) => handleArrayFieldChange('previousEngagements', index, 'position', e.target.value)}
                              className="font-semibold text-base"
                              placeholder="Position"
                              style={{ color: selectedColorTheme.primary }}
                            />
                          ) : (
                            <h3 className="font-semibold text-base" style={{ color: selectedColorTheme.primary }}>
                              {engagement.position}
                            </h3>
                          )}
                          
                          {engagement.company && (
                            <>
                              <span className="text-muted-foreground">at</span>
                              {isEditing ? (
                                <Input
                                  value={engagement.company}
                                  onChange={(e) => handleArrayFieldChange('previousEngagements', index, 'company', e.target.value)}
                                  className="text-sm font-medium"
                                  placeholder="Company"
                                />
                              ) : (
                                <span className="text-sm font-medium text-foreground">{engagement.company}</span>
                              )}
                            </>
                          )}
                        </div>
                        
                        {engagement.duration && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {isEditing ? (
                              <Input
                                value={engagement.duration}
                                onChange={(e) => handleArrayFieldChange('previousEngagements', index, 'duration', e.target.value)}
                                className="text-xs"
                                placeholder="Duration"
                              />
                            ) : (
                              <span>{engagement.duration}</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Location */}
                      {engagement.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {isEditing ? (
                            <Input
                              value={engagement.location}
                              onChange={(e) => handleArrayFieldChange('previousEngagements', index, 'location', e.target.value)}
                              className="text-xs"
                              placeholder="Location"
                            />
                          ) : (
                            <span>{engagement.location}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};