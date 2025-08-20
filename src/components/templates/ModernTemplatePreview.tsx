import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Mail, Phone, Award, TrendingUp, Users, Zap } from "lucide-react";

interface TemplatePreviewProps {
  enhancedContent: any;
  selectedColorTheme: {
    id: string;
    name: string;
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function ModernTemplatePreview({ enhancedContent, selectedColorTheme }: TemplatePreviewProps) {
  return (
    <div className="bg-white flex min-h-screen print:shadow-none max-w-none">
      {/* Left Sidebar */}
      <div className="w-80 p-8 space-y-8" style={{ backgroundColor: `${selectedColorTheme.primary}08` }}>
        
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden mb-4">
            {enhancedContent.photo ? (
              <img 
                src={enhancedContent.photo} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl ${enhancedContent.photo ? 'hidden' : ''}`}>
              👤
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {enhancedContent.name || 'John Smith'}
          </h1>
          <p className="text-sm font-medium text-gray-600">
            {enhancedContent.title || 'Software Engineer'}
          </p>
        </div>

        {/* Navigation/Menu Sections */}
        <div className="space-y-6">
          
          {/* Contact Details */}
          <div>
            <div className="flex items-center gap-3 mb-4 cursor-pointer">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: selectedColorTheme.primary }}>
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Contact</h3>
            </div>
            <div className="space-y-3 pl-11">
              <div className="text-sm text-gray-700">{enhancedContent.email || 'john.smith@email.com'}</div>
              <div className="text-sm text-gray-700">{enhancedContent.phone || '+1 (555) 123-4567'}</div>
              <div className="text-sm text-gray-700">{enhancedContent.location || 'New York, NY'}</div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center gap-3 mb-4 cursor-pointer">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: selectedColorTheme.primary }}>
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Skills</h3>
            </div>
            <div className="space-y-2 pl-11">
              {enhancedContent.skills && enhancedContent.skills.length > 0 ? (
                enhancedContent.skills.slice(0, 6).map((skill: string, index: number) => (
                  <div key={index} className="text-sm text-gray-700">{skill}</div>
                ))
              ) : (
                <>
                  <div className="text-sm text-gray-700">JavaScript</div>
                  <div className="text-sm text-gray-700">React</div>
                  <div className="text-sm text-gray-700">Node.js</div>
                  <div className="text-sm text-gray-700">Python</div>
                </>
              )}
            </div>
          </div>

          {/* Education */}
          <div>
            <div className="flex items-center gap-3 mb-4 cursor-pointer">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: selectedColorTheme.primary }}>
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Education</h3>
            </div>
            <div className="pl-11">
              {enhancedContent.education && enhancedContent.education.length > 0 ? (
                enhancedContent.education.map((edu: any, index: number) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <h4 className="font-semibold text-sm text-gray-900">{edu.degree || "Bachelor's Degree"}</h4>
                    <p className="text-sm text-gray-700">{edu.institution || "University Name"}</p>
                    {edu.year && edu.year !== "N/A" && edu.year !== "Year not specified" && (
                      <p className="text-xs text-gray-600">{edu.year}</p>
                    )}
                  </div>
                ))
              ) : (
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Bachelor's in Computer Science</h4>
                  <p className="text-sm text-gray-700">University of Technology</p>
                  <p className="text-xs text-gray-600">2020</p>
                </div>
              )}
            </div>
          </div>

          {/* Languages */}
          <div>
            <div className="flex items-center gap-3 mb-4 cursor-pointer">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: selectedColorTheme.primary }}>
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Languages</h3>
            </div>
            <div className="space-y-2 pl-11">
              <div className="text-sm text-gray-700">English (Native)</div>
              <div className="text-sm text-gray-700">Spanish (Fluent)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 bg-white">
        
        {/* Professional Summary */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold" style={{ color: selectedColorTheme.primary }}>About & Things I Enjoy</h2>
            <div className="flex-1 h-px" style={{ backgroundColor: `${selectedColorTheme.primary}20` }}></div>
          </div>
          <p className="text-gray-700 leading-relaxed text-sm">
            {enhancedContent.summary || 'A passionate software engineer with expertise in modern web technologies and a strong track record of delivering high-quality applications. Experienced in full-stack development with a focus on user experience and performance optimization. I enjoy solving complex problems and creating innovative solutions that make a real impact.'}
          </p>
        </div>

        {/* Work Experience */}
        {enhancedContent.experience && enhancedContent.experience.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: selectedColorTheme.primary }}>Work & Related Experience</h2>
              <div className="flex-1 h-px" style={{ backgroundColor: `${selectedColorTheme.primary}20` }}></div>
            </div>
            
            <div className="space-y-8">
              {enhancedContent.experience.map((exp: any, index: number) => (
                <div key={index} className="relative">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{exp.title || 'Position Title'}</h3>
                      <p className="font-semibold" style={{ color: selectedColorTheme.primary }}>{exp.company || 'Company Name'}</p>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {exp.duration || 'Date Range'}
                    </div>
                  </div>
                  
                  {exp.achievements && exp.achievements.length > 0 ? (
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {exp.achievements.slice(0, 4).map((achievement: string, achIndex: number) => (
                        <div key={achIndex} className="mb-2 flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: selectedColorTheme.accent }}></div>
                          <span>{achievement}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <div className="mb-2 flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: selectedColorTheme.accent }}></div>
                        <span>Delivered exceptional results and exceeded performance expectations</span>
                      </div>
                      <div className="mb-2 flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: selectedColorTheme.accent }}></div>
                        <span>Collaborated effectively with cross-functional teams to achieve project goals</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}