// Core responsibilities extraction utility to avoid code duplication across templates

export interface ResponsibilityVariant {
  management: string[][];
  technical: string[][];
  operations: string[][];
  creative: string[][];
}

// Multiple variants of responsibilities for variety across work experiences
const responsibilityVariants: { [templateType: string]: ResponsibilityVariant } = {
  classic: {
    management: [
      [
        'Conducting regular team meetings and one-on-ones',
        'Reviewing and approving daily operational decisions',
        'Monitoring team performance and workload distribution',
        'Coordinating cross-departmental communications'
      ],
      [
        'Leading strategic planning sessions and goal setting',
        'Managing budget allocations and resource planning',
        'Facilitating stakeholder communications and reporting',
        'Overseeing policy implementation and compliance'
      ],
      [
        'Supervising daily operations and task prioritization',
        'Conducting performance evaluations and feedback sessions',
        'Managing interdepartmental collaboration and workflows',
        'Ensuring quality standards and process adherence'
      ]
    ],
    technical: [
      [
        'Writing and reviewing code according to standards',
        'Participating in code reviews and technical discussions',
        'Troubleshooting and debugging production issues',
        'Maintaining technical documentation and specifications'
      ],
      [
        'Designing system architecture and technical solutions',
        'Implementing automated testing and deployment processes',
        'Analyzing performance metrics and optimization opportunities',
        'Collaborating on technical requirements and specifications'
      ],
      [
        'Developing APIs and integration solutions',
        'Managing database design and data modeling',
        'Conducting security assessments and vulnerability testing',
        'Mentoring junior developers on coding best practices'
      ]
    ],
    operations: [
      [
        'Scheduling meetings and coordinating team calendars',
        'Tracking project milestones and deadline adherence',
        'Maintaining process documentation and workflows',
        'Communicating updates across different departments'
      ],
      [
        'Managing vendor relationships and contract negotiations',
        'Coordinating logistics and supply chain operations',
        'Monitoring service level agreements and performance metrics',
        'Facilitating training programs and knowledge transfer'
      ],
      [
        'Implementing quality control measures and standards',
        'Analyzing operational data and generating reports',
        'Managing customer service and support operations',
        'Optimizing processes for efficiency and cost reduction'
      ]
    ],
    creative: [
      [
        'Developing creative concepts and design solutions',
        'Collaborating with stakeholders on visual requirements',
        'Managing creative assets and brand consistency',
        'Reviewing and refining creative deliverables'
      ],
      [
        'Conceptualizing marketing campaigns and brand strategies',
        'Leading creative brainstorming and ideation sessions',
        'Managing creative project timelines and resource allocation',
        'Ensuring brand compliance across all creative materials'
      ],
      [
        'Creating visual content for digital and print media',
        'Collaborating with cross-functional teams on creative projects',
        'Maintaining creative style guides and design standards',
        'Researching industry trends and competitive analysis'
      ]
    ]
  },
  modern: {
    management: [
      [
        'Facilitating strategic planning sessions and team alignment',
        'Overseeing resource allocation and budget management',
        'Conducting performance reviews and development planning',
        'Leading stakeholder communications and project updates'
      ],
      [
        'Driving digital transformation and innovation initiatives',
        'Managing cross-functional teams and agile methodologies',
        'Establishing KPIs and performance measurement frameworks',
        'Leading change management and organizational development'
      ],
      [
        'Coordinating global teams and remote collaboration',
        'Managing client relationships and business development',
        'Implementing data-driven decision making processes',
        'Overseeing talent acquisition and retention strategies'
      ]
    ],
    technical: [
      [
        'Architecting system solutions and technical specifications',
        'Implementing best practices and development standards',
        'Analyzing system performance and optimization opportunities',
        'Mentoring team members on technical methodologies'
      ],
      [
        'Developing cloud infrastructure and DevOps pipelines',
        'Leading API design and microservices architecture',
        'Implementing machine learning and AI solutions',
        'Managing cybersecurity protocols and data protection'
      ],
      [
        'Designing scalable database solutions and data pipelines',
        'Implementing automated testing and continuous integration',
        'Leading mobile and web application development',
        'Managing technical debt and code refactoring initiatives'
      ]
    ],
    operations: [
      [
        'Streamlining operational processes and workflow efficiency',
        'Coordinating between departments and managing dependencies',
        'Monitoring key performance indicators and metrics',
        'Ensuring compliance with organizational policies and standards'
      ],
      [
        'Managing supply chain optimization and logistics',
        'Implementing business process automation and tools',
        'Coordinating customer success and support operations',
        'Overseeing quality assurance and continuous improvement'
      ],
      [
        'Managing project portfolios and resource optimization',
        'Coordinating market research and competitive analysis',
        'Implementing risk management and mitigation strategies',
        'Overseeing financial planning and budget execution'
      ]
    ],
    creative: [
      [
        'Conceptualizing innovative design approaches and strategies',
        'Leading creative brainstorming sessions and ideation',
        'Ensuring brand alignment across all creative outputs',
        'Managing creative project timelines and deliverable quality'
      ],
      [
        'Developing immersive user experiences and interface design',
        'Leading content strategy and storytelling initiatives',
        'Managing creative team collaboration and feedback processes',
        'Implementing creative technology and digital innovation'
      ],
      [
        'Curating brand experiences and creative campaigns',
        'Leading video production and multimedia content creation',
        'Managing creative partnerships and external collaborations',
        'Developing creative guidelines and brand standards'
      ]
    ]
  },
  minimalist: {
    management: [
      [
        'Leading team meetings and performance discussions',
        'Making operational decisions and resource planning',
        'Tracking team productivity and project progress'
      ],
      [
        'Coordinating strategic initiatives and goal alignment',
        'Managing stakeholder relationships and communications',
        'Overseeing budget planning and financial oversight'
      ],
      [
        'Facilitating team development and skill building',
        'Managing project priorities and resource allocation',
        'Ensuring compliance and quality standards'
      ]
    ],
    technical: [
      [
        'Developing and maintaining technical solutions',
        'Reviewing code quality and system architecture',
        'Resolving technical issues and system optimization'
      ],
      [
        'Implementing new technologies and frameworks',
        'Managing database operations and data integrity',
        'Coordinating deployment and release processes'
      ],
      [
        'Designing user interfaces and experience flows',
        'Managing API development and integration',
        'Conducting technical research and prototyping'
      ]
    ],
    operations: [
      [
        'Coordinating project activities and timeline management',
        'Maintaining documentation and process standards',
        'Facilitating communication across team functions'
      ],
      [
        'Managing client onboarding and support processes',
        'Coordinating vendor management and partnerships',
        'Overseeing quality control and testing procedures'
      ],
      [
        'Implementing workflow automation and efficiency',
        'Managing data analysis and reporting systems',
        'Coordinating training and development programs'
      ]
    ],
    creative: [
      [
        'Creating design concepts and visual solutions',
        'Managing creative workflows and asset organization',
        'Ensuring quality and consistency in creative work'
      ],
      [
        'Developing brand identity and visual guidelines',
        'Managing creative project coordination and deadlines',
        'Conducting creative research and trend analysis'
      ],
      [
        'Designing marketing materials and campaigns',
        'Managing creative collaboration and feedback',
        'Maintaining creative standards and best practices'
      ]
    ]
  },
  creative: {
    management: [
      [
        'Inspiring team collaboration and creative excellence',
        'Balancing creative vision with business objectives',
        'Nurturing talent development and innovative thinking',
        'Orchestrating multi-disciplinary project execution'
      ],
      [
        'Cultivating creative culture and artistic vision',
        'Managing creative partnerships and external collaborations',
        'Leading creative strategy and brand development',
        'Fostering innovation and experimental approaches'
      ],
      [
        'Directing creative team dynamics and workflow',
        'Managing creative budget and resource allocation',
        'Leading creative presentations and client relations',
        'Overseeing creative quality and artistic standards'
      ]
    ],
    technical: [
      [
        'Pioneering technical innovations and cutting-edge solutions',
        'Exploring emerging technologies and implementation strategies',
        'Crafting robust systems with creative problem-solving approaches',
        'Bridging technical complexity with user experience design'
      ],
      [
        'Developing interactive media and digital experiences',
        'Managing creative technology stack and tool integration',
        'Implementing creative automation and workflow tools',
        'Leading technical creative projects and prototyping'
      ],
      [
        'Designing immersive digital environments and platforms',
        'Managing creative software development and customization',
        'Implementing creative data visualization and analytics',
        'Leading creative technology research and development'
      ]
    ],
    operations: [
      [
        'Designing efficient workflows that enhance creative processes',
        'Harmonizing operational excellence with innovative approaches',
        'Cultivating collaborative environments for optimal productivity',
        'Integrating systematic approaches with flexible methodologies'
      ],
      [
        'Managing creative project logistics and timeline coordination',
        'Coordinating creative resource management and asset libraries',
        'Implementing creative quality assurance and review processes',
        'Managing creative vendor relationships and outsourcing'
      ],
      [
        'Optimizing creative production workflows and efficiency',
        'Managing creative team scheduling and capacity planning',
        'Coordinating creative marketing and promotional activities',
        'Implementing creative performance metrics and analytics'
      ]
    ],
    creative: [
      [
        'Envisioning groundbreaking creative campaigns and concepts',
        'Transforming abstract ideas into compelling visual narratives',
        'Curating aesthetic experiences that resonate with target audiences',
        'Pioneering creative methodologies and innovative design approaches'
      ],
      [
        'Creating immersive storytelling and brand experiences',
        'Developing artistic concepts and visual communication strategies',
        'Leading creative ideation and conceptual development',
        'Managing creative content creation and curation'
      ],
      [
        'Designing innovative creative solutions and artistic expressions',
        'Leading creative research and inspiration gathering',
        'Managing creative collaboration and cross-pollination',
        'Developing creative frameworks and design methodologies'
      ]
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

// Create a robust system to track and generate truly unique responsibilities
class ResponsibilityGenerator {
  private static instance: ResponsibilityGenerator;
  private usedResponsibilities: Set<string> = new Set();
  private experienceResponsibilities: Map<number, string[]> = new Map();

  static getInstance(): ResponsibilityGenerator {
    if (!ResponsibilityGenerator.instance) {
      ResponsibilityGenerator.instance = new ResponsibilityGenerator();
    }
    return ResponsibilityGenerator.instance;
  }

  reset(): void {
    this.usedResponsibilities.clear();
    this.experienceResponsibilities.clear();
  }

  generateUniqueResponsibilities(
    achievements: string[] | undefined,
    title: string,
    templateType: 'classic' | 'modern' | 'minimalist' | 'creative',
    experienceIndex: number,
    maxResponsibilities: number
  ): string[] {
    // Reset on first experience
    if (experienceIndex === 0) {
      this.reset();
    }

    // Check if we already generated for this experience
    if (this.experienceResponsibilities.has(experienceIndex)) {
      return this.experienceResponsibilities.get(experienceIndex)!;
    }

    const variant = responsibilityVariants[templateType];
    if (!variant) return [];

    // Determine role type
    const titleLower = (title || '').toLowerCase();
    let roleType: keyof ResponsibilityVariant = 'operations';
    
    for (const [keyword, type] of Object.entries(roleTypeMapping)) {
      if (titleLower.includes(keyword)) {
        roleType = type as keyof ResponsibilityVariant;
        break;
      }
    }

    // Generate completely unique responsibilities
    const uniqueResponsibilities = this.createUniqueResponsibilities(
      variant,
      roleType,
      title,
      experienceIndex,
      maxResponsibilities,
      achievements
    );

    // Store and mark as used
    this.experienceResponsibilities.set(experienceIndex, uniqueResponsibilities);
    uniqueResponsibilities.forEach(resp => this.usedResponsibilities.add(resp));

    return uniqueResponsibilities;
  }

  private createUniqueResponsibilities(
    variant: ResponsibilityVariant,
    roleType: keyof ResponsibilityVariant,
    title: string,
    experienceIndex: number,
    maxResponsibilities: number,
    achievements?: string[]
  ): string[] {
    const allCategories = Object.keys(variant) as Array<keyof ResponsibilityVariant>;
    const baseResponsibilities: string[] = [];

    // Strategy 1: Create base responsibilities with role-specific focus
    const primaryResponsibilities = this.generateRoleSpecificResponsibilities(
      variant,
      roleType,
      experienceIndex,
      Math.min(2, maxResponsibilities)
    );
    baseResponsibilities.push(...primaryResponsibilities);

    // Strategy 2: Mix in cross-functional responsibilities
    if (baseResponsibilities.length < maxResponsibilities) {
      const crossFunctionalResponsibilities = this.generateCrossFunctionalResponsibilities(
        variant,
        allCategories,
        roleType,
        experienceIndex,
        maxResponsibilities - baseResponsibilities.length
      );
      baseResponsibilities.push(...crossFunctionalResponsibilities);
    }

    // Strategy 3: Generate completely new responsibilities if still needed
    if (baseResponsibilities.length < maxResponsibilities) {
      const newResponsibilities = this.generateNewResponsibilities(
        title,
        experienceIndex,
        maxResponsibilities - baseResponsibilities.length,
        achievements
      );
      baseResponsibilities.push(...newResponsibilities);
    }

    return baseResponsibilities.slice(0, maxResponsibilities);
  }

  private generateRoleSpecificResponsibilities(
    variant: ResponsibilityVariant,
    roleType: keyof ResponsibilityVariant,
    experienceIndex: number,
    count: number
  ): string[] {
    const roleVariants = variant[roleType];
    const responsibilities: string[] = [];
    
    // Use different variant sets for each experience
    const variantIndex = experienceIndex % roleVariants.length;
    const selectedVariant = roleVariants[variantIndex];
    
    let attempts = 0;
    for (let i = 0; i < selectedVariant.length && responsibilities.length < count && attempts < 20; i++, attempts++) {
      const responsibility = selectedVariant[i];
      if (!this.usedResponsibilities.has(responsibility)) {
        responsibilities.push(responsibility);
      }
    }

    return responsibilities;
  }

  private generateCrossFunctionalResponsibilities(
    variant: ResponsibilityVariant,
    allCategories: Array<keyof ResponsibilityVariant>,
    primaryRoleType: keyof ResponsibilityVariant,
    experienceIndex: number,
    count: number
  ): string[] {
    const responsibilities: string[] = [];
    const otherCategories = allCategories.filter(cat => cat !== primaryRoleType);
    
    for (let i = 0; i < count && responsibilities.length < count; i++) {
      const categoryIndex = (experienceIndex + i) % otherCategories.length;
      const category = otherCategories[categoryIndex];
      const categoryVariants = variant[category];
      
      const variantIndex = (experienceIndex + i) % categoryVariants.length;
      const selectedVariant = categoryVariants[variantIndex];
      
      for (const responsibility of selectedVariant) {
        if (!this.usedResponsibilities.has(responsibility) && responsibilities.length < count) {
          responsibilities.push(responsibility);
          break;
        }
      }
    }

    return responsibilities;
  }

  private generateNewResponsibilities(
    title: string,
    experienceIndex: number,
    count: number,
    achievements?: string[]
  ): string[] {
    const actionWords = ['Developing', 'Implementing', 'Optimizing', 'Streamlining', 'Enhancing', 'Coordinating', 'Establishing', 'Maintaining'];
    const domains = ['operational processes', 'strategic initiatives', 'team collaboration', 'quality standards', 'performance metrics', 'stakeholder relations', 'project deliverables', 'workflow efficiency'];
    const contexts = ['across departments', 'within the organization', 'for optimal results', 'to meet objectives', 'ensuring compliance', 'driving innovation', 'maximizing efficiency', 'supporting growth'];

    const responsibilities: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const actionIndex = (experienceIndex * 3 + i) % actionWords.length;
      const domainIndex = (experienceIndex * 5 + i) % domains.length;
      const contextIndex = (experienceIndex * 7 + i) % contexts.length;
      
      const responsibility = `${actionWords[actionIndex]} ${domains[domainIndex]} ${contexts[contextIndex]}`;
      
      if (!this.usedResponsibilities.has(responsibility)) {
        responsibilities.push(responsibility);
      }
    }

    return responsibilities;
  }
}

export function extractCoreResponsibilities(
  achievements: string[] | undefined, 
  title: string, 
  templateType: 'classic' | 'modern' | 'minimalist' | 'creative',
  experienceIndex: number = 0,
  maxResponsibilities: number = 4
): string[] {
  const generator = ResponsibilityGenerator.getInstance();
  return generator.generateUniqueResponsibilities(
    achievements,
    title,
    templateType,
    experienceIndex,
    maxResponsibilities
  );
}