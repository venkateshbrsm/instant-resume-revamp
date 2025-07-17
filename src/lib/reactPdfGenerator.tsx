import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 11,
  },
  section: {
    marginBottom: 8,
    break: false,
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  text: {
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 1.4,
    color: '#374151',
  },
  contactInfo: {
    fontSize: 9,
    marginBottom: 2,
    color: '#6b7280',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    color: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 2,
  },
  bulletPoint: {
    fontSize: 9,
    marginLeft: 12,
    marginBottom: 2,
    color: '#374151',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 3,
  },
  skill: {
    fontSize: 8,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    padding: 2,
    margin: 1,
    borderRadius: 2,
  },
});

// Enhanced content interface
interface EnhancedContent {
  personal_info?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    portfolio?: string;
  };
  professional_summary?: string;
  work_experience?: Array<{
    company?: string;
    position?: string;
    duration?: string;
    location?: string;
    responsibilities?: string[];
  }>;
  education?: Array<{
    institution?: string;
    degree?: string;
    duration?: string;
    location?: string;
  }>;
  skills?: {
    technical?: string[];
    soft?: string[];
    tools?: string[];
  };
  projects?: Array<{
    name?: string;
    description?: string;
    technologies?: string[];
    duration?: string;
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
  }>;
}

interface ResumePDFProps {
  content: EnhancedContent;
  fileName?: string;
}

// Resume PDF Component with automatic page breaks
const ResumePDF: React.FC<{ content: EnhancedContent }> = ({ content }) => (
  <Document>
    <Page size="A4" style={styles.page} wrap={true}>
      {/* Header with personal info */}
      {content.personal_info && (
        <View style={styles.section}>
          <Text style={styles.title}>{content.personal_info.name || 'Your Name'}</Text>
          {content.personal_info.email && (
            <Text style={styles.contactInfo}>Email: {content.personal_info.email}</Text>
          )}
          {content.personal_info.phone && (
            <Text style={styles.contactInfo}>Phone: {content.personal_info.phone}</Text>
          )}
          {content.personal_info.location && (
            <Text style={styles.contactInfo}>Location: {content.personal_info.location}</Text>
          )}
          {content.personal_info.linkedin && (
            <Text style={styles.contactInfo}>LinkedIn: {content.personal_info.linkedin}</Text>
          )}
          {content.personal_info.portfolio && (
            <Text style={styles.contactInfo}>Portfolio: {content.personal_info.portfolio}</Text>
          )}
        </View>
      )}

      {/* Professional Summary */}
      {content.professional_summary && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Professional Summary</Text>
          <Text style={styles.text}>{content.professional_summary}</Text>
        </View>
      )}

      {/* Work Experience */}
      {content.work_experience && content.work_experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Work Experience</Text>
          {content.work_experience.map((job, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text style={styles.subtitle}>{job.position || 'Position'}</Text>
              <Text style={styles.text}>
                {job.company || 'Company'} | {job.duration || 'Duration'}
              </Text>
              {job.location && (
                <Text style={styles.contactInfo}>{job.location}</Text>
              )}
              {job.responsibilities && job.responsibilities.map((resp, idx) => (
                <Text key={idx} style={styles.bulletPoint}>• {resp}</Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {content.education && content.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Education</Text>
          {content.education.map((edu, index) => (
            <View key={index} style={{ marginBottom: 6 }}>
              <Text style={styles.subtitle}>{edu.degree || 'Degree'}</Text>
              <Text style={styles.text}>
                {edu.institution || 'Institution'} | {edu.duration || 'Duration'}
              </Text>
              {edu.location && (
                <Text style={styles.contactInfo}>{edu.location}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {content.skills && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Skills</Text>
          {content.skills.technical && content.skills.technical.length > 0 && (
            <View>
              <Text style={styles.text}>Technical Skills:</Text>
              <View style={styles.skillsContainer}>
                {content.skills.technical.map((skill, index) => (
                  <Text key={index} style={styles.skill}>{skill}</Text>
                ))}
              </View>
            </View>
          )}
          {content.skills.soft && content.skills.soft.length > 0 && (
            <View style={{ marginTop: 6 }}>
              <Text style={styles.text}>Soft Skills:</Text>
              <View style={styles.skillsContainer}>
                {content.skills.soft.map((skill, index) => (
                  <Text key={index} style={styles.skill}>{skill}</Text>
                ))}
              </View>
            </View>
          )}
          {content.skills.tools && content.skills.tools.length > 0 && (
            <View style={{ marginTop: 6 }}>
              <Text style={styles.text}>Tools & Technologies:</Text>
              <View style={styles.skillsContainer}>
                {content.skills.tools.map((skill, index) => (
                  <Text key={index} style={styles.skill}>{skill}</Text>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Projects */}
      {content.projects && content.projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Projects</Text>
          {content.projects.map((project, index) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <Text style={styles.subtitle}>{project.name || 'Project Name'}</Text>
              {project.duration && (
                <Text style={styles.contactInfo}>{project.duration}</Text>
              )}
              {project.description && (
                <Text style={styles.text}>{project.description}</Text>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <View style={styles.skillsContainer}>
                  {project.technologies.map((tech, idx) => (
                    <Text key={idx} style={styles.skill}>{tech}</Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Certifications */}
      {content.certifications && content.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Certifications</Text>
          {content.certifications.map((cert, index) => (
            <View key={index} style={{ marginBottom: 6 }}>
              <Text style={styles.subtitle}>{cert.name || 'Certification Name'}</Text>
              <Text style={styles.text}>
                {cert.issuer || 'Issuer'} | {cert.date || 'Date'}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

// Function to generate and download PDF
export const generateResumePDF = async (
  content: EnhancedContent,
  fileName: string = 'enhanced-resume.pdf'
): Promise<void> => {
  try {
    const blob = await pdf(<ResumePDF content={content} />).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

// React component for download link
export const ResumeDownloadLink: React.FC<ResumePDFProps> = ({ content, fileName = 'enhanced-resume.pdf' }) => (
  <PDFDownloadLink 
    document={<ResumePDF content={content} />} 
    fileName={fileName}
    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
  >
    {({ blob, url, loading, error }) =>
      loading ? 'Generating PDF...' : 'Download PDF'
    }
  </PDFDownloadLink>
);