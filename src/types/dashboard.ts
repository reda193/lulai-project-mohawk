import { LucideIcon } from 'lucide-react';

export interface ChatbotAgent {
  id?: string;  
  name: string;
  appearance?: BotAppearance | null;

}
export interface BotAppearance {
  bot_avatar?: string | null;
  company_logo?: string | null;
  accent_color?: string | null;
  widget_icon?: string | null;
  widget_position?: string | null;
  input_placeholder?: string | null;
  branding_enabled?: boolean;
  widget_open_by_default?: boolean;
  starter_questions?: boolean | null;
}

export interface Customer {
  name: string;
  total: string;
  country: string;
  date: string;
  status: string;
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

