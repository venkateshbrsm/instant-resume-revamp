// Core responsibilities extraction utility to avoid code duplication across templates

export interface ResponsibilityVariant {
  management: string[];
  technical: string[];
  operations: string[];
  creative: string[];
}

// Different variants of responsibilities for variety across templates
const responsibilityVariants: { [templateType: string]: ResponsibilityVariant } = {
  classic: {
    management: [
      'Conducting regular team meetings and one-on-ones',
      'Reviewing and approving daily operational decisions',
      'Monitoring team performance and workload distribution',
      'Coordinating cross-departmental communications'
    ],
    technical: [
      'Writing and reviewing code according to standards',
      'Participating in code reviews and technical discussions',
      'Troubleshooting and debugging production issues',
      'Maintaining technical documentation and specifications'
    ],
    operations: [
      'Scheduling meetings and coordinating team calendars',
      'Tracking project milestones and deadline adherence',
      'Maintaining process documentation and workflows',
      'Communicating updates across different departments'
    ],
    creative: [
      'Developing creative concepts and design solutions',
      'Collaborating with stakeholders on visual requirements',
      'Managing creative assets and brand consistency',
      'Reviewing and refining creative deliverables'
    ]
  },
  modern: {
    management: [
      'Facilitating strategic planning sessions and team alignment',
      'Overseeing resource allocation and budget management',
      'Conducting performance reviews and development planning',
      'Leading stakeholder communications and project updates'
    ],
    technical: [
      'Architecting system solutions and technical specifications',
      'Implementing best practices and development standards',
      'Analyzing system performance and optimization opportunities',
      'Mentoring team members on technical methodologies'
    ],
    operations: [
      'Streamlining operational processes and workflow efficiency',
      'Coordinating between departments and managing dependencies',
      'Monitoring key performance indicators and metrics',
      'Ensuring compliance with organizational policies and standards'
    ],
    creative: [
      'Conceptualizing innovative design approaches and strategies',
      'Leading creative brainstorming sessions and ideation',
      'Ensuring brand alignment across all creative outputs',
      'Managing creative project timelines and deliverable quality'
    ]
  },
  minimalist: {
    management: [
      'Leading team meetings and performance discussions',
      'Making operational decisions and resource planning',
      'Tracking team productivity and project progress'
    ],
    technical: [
      'Developing and maintaining technical solutions',
      'Reviewing code quality and system architecture',
      'Resolving technical issues and system optimization'
    ],
    operations: [
      'Coordinating project activities and timeline management',
      'Maintaining documentation and process standards',
      'Facilitating communication across team functions'
    ],
    creative: [
      'Creating design concepts and visual solutions',
      'Managing creative workflows and asset organization',
      'Ensuring quality and consistency in creative work'
    ]
  },
  creative: {
    management: [
      'Inspiring team collaboration and creative excellence',
      'Balancing creative vision with business objectives',
      'Nurturing talent development and innovative thinking',
      'Orchestrating multi-disciplinary project execution'
    ],
    technical: [
      'Pioneering technical innovations and cutting-edge solutions',
      'Exploring emerging technologies and implementation strategies',
      'Crafting robust systems with creative problem-solving approaches',
      'Bridging technical complexity with user experience design'
    ],
    operations: [
      'Designing efficient workflows that enhance creative processes',
      'Harmonizing operational excellence with innovative approaches',
      'Cultivating collaborative environments for optimal productivity',
      'Integrating systematic approaches with flexible methodologies'
    ],
    creative: [
      'Envisioning groundbreaking creative campaigns and concepts',
      'Transforming abstract ideas into compelling visual narratives',
      'Curating aesthetic experiences that resonate with target audiences',
      'Pioneering creative methodologies and innovative design approaches'
    ]
  }
};

// Role type mapping for different job titles
const roleTypeMapping = {
  // Management roles
  manager: 'management',
  director: 'management', 
  lead: 'management',
  supervisor: 'management',
  head: 'management',
  
  // Technical roles
  developer: 'technical',
  engineer: 'technical',
  architect: 'technical',
  programmer: 'technical',
  analyst: 'technical',
  
  // Operations roles
  coordinator: 'operations',
  specialist: 'operations',
  administrator: 'operations',
  officer: 'operations',
  
  // Creative roles
  designer: 'creative',
  artist: 'creative',
  creative: 'creative',
  brand: 'creative'
};

export function extractCoreResponsibilities(
  achievements: string[] | undefined, 
  title: string, 
  templateType: 'classic' | 'modern' | 'minimalist' | 'creative',
  maxResponsibilities: number = 4
): string[] {
  const variant = responsibilityVariants[templateType];
  if (!variant) return [];
  
  // Determine role type based on job title
  const titleLower = (title || '').toLowerCase();
  let roleType: keyof ResponsibilityVariant = 'operations'; // Default
  
  for (const [keyword, type] of Object.entries(roleTypeMapping)) {
    if (titleLower.includes(keyword)) {
      roleType = type as keyof ResponsibilityVariant;
      break;
    }
  }
  
  // Get base responsibilities for the role type
  let baseResponsibilities = [...variant[roleType]];
  
  // Customize based on achievements context if available
  if (achievements && achievements.length > 0) {
    const achievementsText = achievements.join(' ').toLowerCase();
    
    // Add context-specific customizations
    if (achievementsText.includes('budget') || achievementsText.includes('cost')) {
      baseResponsibilities[0] = baseResponsibilities[0].replace(/regular|team|strategic/, 'budget-focused');
    }
    if (achievementsText.includes('client') || achievementsText.includes('customer')) {
      baseResponsibilities[1] = baseResponsibilities[1].replace(/operational|resource|work/, 'client-focused');
    }
    if (achievementsText.includes('team') || achievementsText.includes('staff')) {
      baseResponsibilities[2] = baseResponsibilities[2].replace(/performance|milestones|system/, 'team-oriented');
    }
  }
  
  return baseResponsibilities.slice(0, maxResponsibilities);
}