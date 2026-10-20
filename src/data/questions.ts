export type Domain =
  | 'Cloud Concepts'
  | 'Architecture & Services'
  | 'Management & Governance';

export interface Question {
  id: number;
  domain: Domain;
  question: string;
  options: string[];
  correct: number;
  standardExplanation: string;
  wrongExplanation: string;
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    domain: 'Cloud Concepts',
    question: 'A company wants to reduce upfront hardware costs and scale resources on demand. Which cloud benefit best addresses this need?',
    options: ['High availability', 'Elasticity', 'Fault tolerance', 'Disaster recovery'],
    correct: 1,
    standardExplanation: 'Elasticity allows resources to scale up or down automatically based on demand, reducing the need for upfront hardware investment.',
    wrongExplanation: 'High availability and fault tolerance ensure reliability, but they do not address scaling costs. Disaster recovery focuses on restoring services after failure, not scaling.',
  },
  {
    id: 2,
    domain: 'Cloud Concepts',
    question: 'An organization wants to avoid managing physical servers and instead pay only for what they use. Which cloud model fits this scenario?',
    options: ['Infrastructure as a Service (IaaS)', 'Platform as a Service (PaaS)', 'Software as a Service (SaaS)', 'Colocation hosting'],
    correct: 0,
    standardExplanation: 'IaaS provides virtualized computing resources over the internet, letting customers avoid physical server management and pay per use.',
    wrongExplanation: 'PaaS focuses on app development platforms, SaaS delivers complete applications, and colocation still requires managing hardware.',
  },
  {
    id: 3,
    domain: 'Cloud Concepts',
    question: 'A retail company experiences a predictable traffic surge every holiday season. Which cloud advantage lets them handle this without buying permanent hardware?',
    options: ['Scalability', 'Elasticity', 'High availability', 'Disaster recovery'],
    correct: 1,
    standardExplanation: 'Elasticity allows resources to automatically grow or shrink based on demand, making it ideal for predictable seasonal traffic spikes without permanent hardware investment.',
    wrongExplanation: 'Scalability refers to the ability to increase capacity, but it does not imply automatic adjustment. High availability ensures uptime, and disaster recovery focuses on restoring services after a failure.',
  },
  {
    id: 4,
    domain: 'Cloud Concepts',
    question: 'An organization wants to shift from a capital expenditure (CapEx) model to an operational expenditure (OpEx) model for IT infrastructure. Which cloud benefit enables this?',
    options: ['High availability', 'Pay-as-you-go pricing', 'Fault tolerance', 'Load balancing'],
    correct: 1,
    standardExplanation: 'Pay-as-you-go pricing converts upfront hardware costs (CapEx) into ongoing operational costs (OpEx), paying only for resources consumed.',
    wrongExplanation: 'High availability and fault tolerance improve reliability but do not change the cost model. Load balancing distributes traffic but is unrelated to CapEx vs OpEx.',
  },
  {
    id: 5,
    domain: 'Cloud Concepts',
    question: 'A company wants a cloud deployment model where they run a cloud environment inside their own datacenter using their own hardware. Which model is this?',
    options: ['Public cloud', 'Private cloud', 'Hybrid cloud', 'Multi-cloud'],
    correct: 1,
    standardExplanation: 'A private cloud is cloud infrastructure operated solely for one organization, often hosted in their own datacenter, providing greater control and privacy.',
    wrongExplanation: 'Public cloud is shared infrastructure owned by a provider, hybrid combines public and private, and multi-cloud means using multiple public cloud providers.',
  },
  {
    id: 6,
    domain: 'Cloud Concepts',
    question: 'A software company delivers an email service (like Microsoft 365) that customers access over the internet without installing anything locally. Which cloud model is this?',
    options: ['IaaS', 'PaaS', 'SaaS', 'FaaS'],
    correct: 2,
    standardExplanation: 'SaaS delivers fully managed applications over the internet. The provider manages everything, and users simply consume the software.',
    wrongExplanation: 'IaaS provides virtual infrastructure, PaaS provides a development platform, and FaaS provides event-driven compute. None of these deliver complete end-user applications like email.',
  },
  {
    id: 7,
    domain: 'Architecture & Services',
    question: 'A startup needs a fully managed platform to host a web app with built-in scaling and deployment slots, without managing servers. Which Azure service should they choose?',
    options: ['Azure Virtual Machines', 'Azure App Service', 'Azure Blob Storage', 'Azure Functions'],
    correct: 1,
    standardExplanation: 'Azure App Service provides a fully managed web hosting platform with features like scaling and deployment slots, removing the need to manage servers.',
    wrongExplanation: 'Virtual Machines require server management, Blob Storage is for data, and Functions are for event-driven code snippets, not full web hosting.',
  },
  {
    id: 8,
    domain: 'Architecture & Services',
    question: 'A company needs a globally distributed database with automatic multi-region replication. Which Azure service should they use?',
    options: ['Azure SQL Database', 'Azure Cosmos DB', 'Azure Database for PostgreSQL', 'Azure Data Lake Storage'],
    correct: 1,
    standardExplanation: 'Cosmos DB is designed for global distribution with automatic replication across regions.',
    wrongExplanation: 'SQL Database and PostgreSQL are single-region unless manually configured, and Data Lake Storage is for analytics, not transactional replication.',
  },
  {
    id: 9,
    domain: 'Architecture & Services',
    question: 'A company needs long-term, low-cost storage for archived documents that are rarely accessed. Which Azure storage tier should they use?',
    options: ['Hot storage tier', 'Cool storage tier', 'Archive storage tier', 'Premium storage tier'],
    correct: 2,
    standardExplanation: 'The Archive storage tier offers the lowest cost for data that is rarely accessed, with retrieval times in hours rather than seconds.',
    wrongExplanation: 'Hot is for frequent access, Cool is for infrequent access (within 30 days), and Premium is optimized for performance, not cost savings on archival data.',
  },
  {
    id: 10,
    domain: 'Architecture & Services',
    question: 'A development team wants to run event-driven code without provisioning or managing any infrastructure. Which Azure service should they use?',
    options: ['Azure Virtual Machines', 'Azure App Service', 'Azure Functions', 'Azure Kubernetes Service'],
    correct: 2,
    standardExplanation: 'Azure Functions is a serverless compute service that runs event-driven code without managing infrastructure, charging only for execution time.',
    wrongExplanation: 'Virtual Machines require full OS management, App Service is for full web apps (not event-driven snippets), and Kubernetes Service is for container orchestration, not serverless functions.',
  },
  {
    id: 11,
    domain: 'Architecture & Services',
    question: 'A company wants a centralized, highly available repository for storing and managing container images across multiple regions. Which Azure service fits this need?',
    options: ['Azure Blob Storage', 'Azure Container Registry', 'Azure Disk Storage', 'Azure File Shares'],
    correct: 1,
    standardExplanation: 'Azure Container Registry is a managed Docker registry service that stores and manages container images with geo-replication support.',
    wrongExplanation: 'Blob Storage is for unstructured data, Disk Storage is for VM disks, and File Shares are for shared file access. None are designed for container image management.',
  },
  {
    id: 12,
    domain: 'Management & Governance',
    question: 'An IT team wants to enforce policies like requiring encryption on all storage accounts. Which Azure tool should they use?',
    options: ['Azure Monitor', 'Azure Policy', 'Azure Advisor', 'Azure Resource Manager'],
    correct: 1,
    standardExplanation: 'Azure Policy enforces compliance by applying rules such as requiring encryption on resources.',
    wrongExplanation: 'Azure Monitor tracks performance, Advisor gives recommendations, and Resource Manager organizes resources but does not enforce compliance.',
  },
  {
    id: 13,
    domain: 'Management & Governance',
    question: 'A company wants a hierarchical governance structure that lets them apply policies and view billing across multiple Azure subscriptions in one place. Which service provides this?',
    options: ['Azure Service Health', 'Azure Cost Management', 'Azure Portal Dashboard', 'Azure Management Groups'],
    correct: 3,
    standardExplanation: 'Management Groups provide a hierarchical governance structure, enabling organizations to apply policies and view billing across multiple subscriptions.',
    wrongExplanation: 'Service Health shows outages, Cost Management focuses only on expenses, and Portal Dashboard is customizable but not governance-focused.',
  },
  {
    id: 14,
    domain: 'Management & Governance',
    question: 'A cloud administrator wants to view a consolidated cost analysis across all Azure subscriptions and set spending budgets with alerts. Which tool should they use?',
    options: ['Azure Advisor', 'Azure Cost Management', 'Azure Monitor', 'Azure Blueprints'],
    correct: 1,
    standardExplanation: 'Azure Cost Management provides cost analysis, budgeting, and alerting across subscriptions to help track and control cloud spending.',
    wrongExplanation: 'Advisor gives best-practice recommendations but not budgeting, Monitor tracks performance metrics, and Blueprints automates environment setup, not cost tracking.',
  },
  {
    id: 15,
    domain: 'Management & Governance',
    question: 'A company wants to receive notifications when an Azure service outage affects their resources in a specific region. Which service provides these targeted alerts?',
    options: ['Azure Advisor', 'Azure Service Health', 'Azure Monitor', 'Azure Policy'],
    correct: 1,
    standardExplanation: 'Azure Service Health provides personalized alerts about Azure outages and planned maintenance that affect your specific resources and regions.',
    wrongExplanation: 'Advisor gives optimization recommendations, Monitor tracks resource metrics, and Policy enforces compliance rules. None of these provide outage alerts for your specific resources.',
  },
  {
    id: 16,
    domain: 'Management & Governance',
    question: 'A team wants to ensure that resources deployed to Azure automatically follow a standard naming convention and tag structure. Which Azure service enforces this at deployment time?',
    options: ['Azure Monitor', 'Azure Policy', 'Azure Advisor', 'Azure Resource Manager templates only'],
    correct: 1,
    standardExplanation: 'Azure Policy can enforce naming conventions and required tags at deployment time, blocking non-compliant resources before they are created.',
    wrongExplanation: 'Monitor tracks performance, not compliance. Advisor gives recommendations but cannot enforce rules. ARM templates can include tags but cannot enforce them across all deployments.',
  },
];

export const DOMAINS: Domain[] = [
  'Cloud Concepts',
  'Architecture & Services',
  'Management & Governance',
];

export function questionsForDomain(domain: Domain): Question[] {
  return QUESTIONS.filter((q) => q.domain === domain);
}