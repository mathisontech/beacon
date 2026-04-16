import { HardDrive, Github, MessageSquare, Database } from 'lucide-react';

export interface Integration {
  key: string;
  label: string;
  description: string;
  icon: typeof HardDrive;
  href: string;
  status: 'available' | 'coming-soon';
}

export const integrations: Integration[] = [
  {
    key: 'google-drive',
    label: '1. Google Drive',
    description: 'Browse, upload, and reference files',
    icon: HardDrive,
    href: '/admin/dashboard/integrations/google-drive',
    status: 'available',
  },
  {
    key: 'github',
    label: '2. GitHub',
    description: 'Repos, PRs, issues, and code review',
    icon: Github,
    href: '/admin/dashboard/integrations/github',
    status: 'coming-soon',
  },
  {
    key: 'slack',
    label: '3. Slack',
    description: 'Channels, messages, and notifications',
    icon: MessageSquare,
    href: '/admin/dashboard/integrations/slack',
    status: 'coming-soon',
  },
  {
    key: 'databases',
    label: '4. Beacon Databases',
    description: 'Query and manage training data',
    icon: Database,
    href: '/admin/dashboard/integrations/databases',
    status: 'coming-soon',
  },
];
