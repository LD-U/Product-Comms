export type Sequencing = 1 | 2 | 3;

export type ReleaseType =
  | 'Strategic Initiative'
  | 'Customer Request'
  | 'Bug Fix'
  | 'Usability Enhancement'
  | 'Reliability Work';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type Release = {
  id: string;
  name: string;
  sequencing: Sequencing;
  productArea: string;
  product: string;
  type: ReleaseType;
  priority: Priority;
  confidence: 'Committed' | 'Likely' | 'Exploratory' | 'Delayed';
  targetWindow: string;
  targetDate?: string;
  customerImpact: string;
  whyItMatters: string;
  workflowChanging: string[];
  affectedScreens: string[];
  whoImpacted: string[];
  operationalBenefits: string[];
  talkingPoints: string[];
  demoUrl?: string;
  releaseNotesUrl?: string;
  requestedByCustomers?: string[];
  lastUpdated: string;
};
