import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Document, Paragraph, TextRun, AlignmentType, Packer, Table, TableRow, TableCell, WidthType, HeadingLevel } from "https://esm.sh/docx@8.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Theme color mapping
const themeColors = {
  navy: { primary: '#1e3a8a', secondary: '#1e40af', accent: '#3b82f6' },
  charcoal: { primary: '#374151', secondary: '#1f2937', accent: '#6b7280' },
  burgundy: { primary: '#7c2d12', secondary: '#991b1b', accent: '#dc2626' },
  forest: { primary: '#166534', secondary: '#15803d', accent: '#22c55e' },
  bronze: { primary: '#a16207', secondary: '#ca8a04', accent: '#eab308' },
  slate: { primary: '#475569', secondary: '#334155', accent: '#64748b' }
};

function getThemeColors(themeId: string) {
  const theme = themeColors[themeId as keyof typeof themeColors] || themeColors.navy;
  return {
    primary: theme.primary.replace('#', ''),
    secondary: theme.secondary.replace('#', ''),
    accent: theme.accent.replace('#', '')
  };
}

// Clean text function to remove special characters
const cleanText = (text: string) => {
  if (!text) return '';
  return text
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[—–]/g, '-')
    .replace(/[…]/g, '...')
    .replace(/[•]/g, '*')
    .replace(/[\u00A0]/g, ' ')
    .replace(/[\u2000-\u206F]/g, ' ')
    .replace(/[\u2070-\u209F]/g, '')
    .replace(/[\uFEFF]/g, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s.,;:()?!@#$%&*+=\-'"/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

async function generateResumeDocx(resumeData: any, themeId: string = 'navy'): Promise<Uint8Array> {
  const colors = getThemeColors(themeId);

  const doc = new Document({
    sections: [{
      children: [
        // Header with name and title
        new Paragraph({
          children: [
            new TextRun({
              text: cleanText(resumeData.name || "Professional Resume"),
              bold: true,
              size: 36,
              color: colors.primary,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cleanText(resumeData.title || "Professional"),
              size: 26,
              color: colors.secondary,
              bold: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        }),
        
        // Contact Information Table
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `Email: ${resumeData.email || ""}`,
                          size: 18,
                          color: colors.accent,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  width: { size: 33, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `Phone: ${resumeData.phone || ""}`,
                          size: 18,
                          color: colors.accent,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  width: { size: 33, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `Location: ${resumeData.location || ""}`,
                          size: 18,
                          color: colors.accent,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  width: { size: 34, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
        
        // Separator line
        new Paragraph({
          children: [
            new TextRun({
              text: "─".repeat(60),
              size: 16,
              color: colors.primary,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 300 },
        }),
        
        // Professional Summary
        new Paragraph({
          children: [
            new TextRun({
              text: "PROFESSIONAL SUMMARY",
              bold: true,
              size: 24,
              color: colors.primary,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cleanText(resumeData.summary || "Professional with extensive experience in their field."),
              size: 20,
            }),
          ],
          spacing: { after: 400 },
        }),
        
        // Professional Experience
        new Paragraph({
          children: [
            new TextRun({
              text: "PROFESSIONAL EXPERIENCE",
              bold: true,
              size: 24,
              color: colors.primary,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
        
        // Experience entries
        ...(resumeData.experience || []).flatMap((exp: any, index: number) => [
          new Paragraph({
            children: [
              new TextRun({
                text: cleanText(exp.title || "Position"),
                bold: true,
                size: 22,
                color: colors.secondary,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: cleanText(`${exp.company || "Company"} | ${exp.duration || "Duration"}`),
                size: 18,
                italics: true,
                color: colors.accent,
              }),
            ],
            spacing: { after: 150 },
          }),
          ...(exp.achievements || []).map((achievement: string) => 
            new Paragraph({
              children: [
                new TextRun({
                  text: cleanText(`• ${achievement}`),
                  size: 18,
                }),
              ],
              spacing: { after: 100 },
            })
          ),
          ...(index < (resumeData.experience || []).length - 1 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "─".repeat(40),
                  size: 12,
                  color: colors.accent,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            }),
          ] : [
            new Paragraph({
              children: [new TextRun({ text: "", size: 12 })],
              spacing: { after: 300 },
            }),
          ]),
        ]),
        
        // Skills Section
        ...(resumeData.skills && resumeData.skills.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: "SKILLS",
                bold: true,
                size: 24,
                color: colors.primary,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: cleanText(resumeData.skills.join(" • ")),
                size: 20,
              }),
            ],
            spacing: { after: 400 },
          }),
        ] : []),
        
        // Education Section
        ...(resumeData.education && resumeData.education.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: "EDUCATION",
                bold: true,
                size: 24,
                color: colors.primary,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
          }),
          ...resumeData.education.flatMap((edu: any, index: number) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: cleanText(edu.degree || "Degree"),
                  bold: true,
                  size: 22,
                  color: colors.secondary,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: cleanText(`${edu.institution || "Institution"} | ${edu.year || "Year"}`),
                  size: 18,
                  color: colors.accent,
                }),
              ],
              spacing: { after: index < (resumeData.education || []).length - 1 ? 300 : 200 },
            }),
          ]),
        ] : []),
        
        // Footer
        new Paragraph({
          children: [
            new TextRun({
              text: "─".repeat(60),
              size: 16,
              color: colors.primary,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Enhanced by AI • Professional Resume",
              size: 14,
              color: colors.accent,
              italics: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ],
    }],
  });

  return await Packer.toBuffer(doc);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting free download...");

    const { fileName, resumeData, themeId } = await req.json();
    console.log("Generating DOCX for:", fileName);

    if (!resumeData) {
      throw new Error("Resume data is required");
    }

    // Generate DOCX content
    const docxBuffer = await generateResumeDocx(resumeData, themeId || 'navy');
    const cleanFileName = `enhanced_${fileName.replace(/\.[^/.]+$/, '.docx')}`;
    
    console.log(`Generated DOCX, size: ${docxBuffer.byteLength} bytes`);
    
    return new Response(docxBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${cleanFileName}"`,
        'Content-Length': docxBuffer.byteLength.toString(),
      },
      status: 200,
    });
  } catch (error) {
    console.error('Free download error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});