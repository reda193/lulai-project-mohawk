import { LucideIcon } from 'lucide-react';

export interface ChatbotAgent {
  name: string;
  status: 'Active' | 'Inactive';
}

export interface Customer {
  name: string;
  total: string;
  country: string;
  date: string;
  status: 'Active' | 'Pending' | 'Resolved';
}

export interface VisitorData {
  location: string;
  count: number;
}

export interface ReplyData {
  category: string;
  value: number;
}

export interface SidebarItem {
  icon: LucideIcon;
  label: string;
  active: boolean;
  href: string; 
}

