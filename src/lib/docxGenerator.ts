import { Document, Paragraph, TextRun, HeadingLevel, Packer, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';

export interface DocxResumeData {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    location: string;
    responsibilities: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    duration: string;
    location: string;
  }>;
  skills: string[];
  certifications: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

export const generateEnhancedDocx = async (resumeData: DocxResumeData): Promise<Blob> => {
  console.log('Generating enhanced DOCX document...');
  
  const children = [];
  
  // Header Section
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: resumeData.name,
          bold: true,
          size: 32,
          color: "2563eb"
        })
      ],
      heading: HeadingLevel.TITLE,
      alignment: 'center'
    })
  );
  
  // Contact Information
  const contactInfo = [];
  if (resumeData.email) contactInfo.push(resumeData.email);
  if (resumeData.phone) contactInfo.push(resumeData.phone);
  if (resumeData.location) contactInfo.push(resumeData.location);
  
  if (contactInfo.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactInfo.join(' | '),
            size: 20,
            color: "6b7280"
          })
        ],
        alignment: 'center'
      })
    );
    
    children.push(new Paragraph({ text: "" })); // Empty line
  }
  
  // Professional Summary
  if (resumeData.summary) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "PROFESSIONAL SUMMARY",
            bold: true,
            size: 24,
            color: "1f2937"
          })
        ],
        heading: HeadingLevel.HEADING_1
      })
    );
    
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.summary,
            size: 20
          })
        ]
      })
    );
    
    children.push(new Paragraph({ text: "" })); // Empty line
  }
  
  // Experience Section
  if (resumeData.experience && resumeData.experience.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "PROFESSIONAL EXPERIENCE",
            bold: true,
            size: 24,
            color: "1f2937"
          })
        ],
        heading: HeadingLevel.HEADING_1
      })
    );
    
    resumeData.experience.forEach(exp => {
      // Job Title and Company
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.position,
              bold: true,
              size: 22,
              color: "2563eb"
            }),
            new TextRun({
              text: ` at ${exp.company}`,
              size: 22
            })
          ]
        })
      );
      
      // Duration and Location
      const jobDetails = [];
      if (exp.duration) jobDetails.push(exp.duration);
      if (exp.location) jobDetails.push(exp.location);
      
      if (jobDetails.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: jobDetails.join(' | '),
                size: 18,
                color: "6b7280",
                italics: true
              })
            ]
          })
        );
      }
      
      // Responsibilities
      exp.responsibilities.forEach(responsibility => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${responsibility}`,
                size: 20
              })
            ]
          })
        );
      });
      
      children.push(new Paragraph({ text: "" })); // Empty line
    });
  }
  
  // Skills Section
  if (resumeData.skills && resumeData.skills.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "CORE COMPETENCIES",
            bold: true,
            size: 24,
            color: "1f2937"
          })
        ],
        heading: HeadingLevel.HEADING_1
      })
    );
    
    // Group skills in rows of 3 for better presentation
    const skillChunks = [];
    for (let i = 0; i < resumeData.skills.length; i += 3) {
      skillChunks.push(resumeData.skills.slice(i, i + 3));
    }
    
    const skillTable = new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      },
      rows: skillChunks.map(chunk => 
        new TableRow({
          children: [
            ...chunk.map(skill => 
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `• ${skill}`,
                        size: 20
                      })
                    ]
                  })
                ],
                width: { size: 33, type: WidthType.PERCENTAGE }
              })
            ),
            // Fill remaining cells if chunk has fewer than 3 items
            ...Array(3 - chunk.length).fill(null).map(() =>
              new TableCell({
                children: [new Paragraph({ text: "" })],
                width: { size: 33, type: WidthType.PERCENTAGE }
              })
            )
          ]
        })
      )
    });
    
    children.push(skillTable);
    children.push(new Paragraph({ text: "" })); // Empty line
  }
  
  // Education Section
  if (resumeData.education && resumeData.education.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "EDUCATION",
            bold: true,
            size: 24,
            color: "1f2937"
          })
        ],
        heading: HeadingLevel.HEADING_1
      })
    );
    
    resumeData.education.forEach(edu => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 22
            }),
            new TextRun({
              text: ` - ${edu.institution}`,
              size: 22
            })
          ]
        })
      );
      
      const eduDetails = [];
      if (edu.duration) eduDetails.push(edu.duration);
      if (edu.location) eduDetails.push(edu.location);
      
      if (eduDetails.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: eduDetails.join(' | '),
                size: 18,
                color: "6b7280",
                italics: true
              })
            ]
          })
        );
      }
      
      children.push(new Paragraph({ text: "" })); // Empty line
    });
  }
  
  // Certifications Section
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "CERTIFICATIONS",
            bold: true,
            size: 24,
            color: "1f2937"
          })
        ],
        heading: HeadingLevel.HEADING_1
      })
    );
    
    resumeData.certifications.forEach(cert => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${cert}`,
              size: 20
            })
          ]
        })
      );
    });
    
    children.push(new Paragraph({ text: "" })); // Empty line
  }
  
  // Projects Section
  if (resumeData.projects && resumeData.projects.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "NOTABLE PROJECTS",
            bold: true,
            size: 24,
            color: "1f2937"
          })
        ],
        heading: HeadingLevel.HEADING_1
      })
    );
    
    resumeData.projects.forEach(project => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: project.name,
              bold: true,
              size: 22,
              color: "2563eb"
            })
          ]
        })
      );
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: project.description,
              size: 20
            })
          ]
        })
      );
      
      if (project.technologies && project.technologies.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Technologies: ${project.technologies.join(', ')}`,
                size: 18,
                color: "6b7280",
                italics: true
              })
            ]
          })
        );
      }
      
      children.push(new Paragraph({ text: "" })); // Empty line
    });
  }
  
  // Create the document
  const doc = new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });
  
  // Generate and return the blob
  const buffer = await Packer.toBuffer(doc);
  return new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  });
};