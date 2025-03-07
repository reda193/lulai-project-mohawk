// components/Sidebar/Sidebar.tsx
import { FC } from 'react';
import {
  HomeIcon,
  UsersIcon,
  BarChartIcon,
  MessageSquareIcon,
  BrainIcon,
  UserIcon,
  MessageCircleIcon,
  BookmarkIcon,
  SettingsIcon,
  MoreVerticalIcon
} from 'lucide-react';
import { SidebarItem as SidebarItemType } from '@/types/dashboard';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const navigationItems: SidebarItemType[] = [
    { icon: HomeIcon, label: 'Home', active: true, href: '/' },
    { icon: UsersIcon, label: 'Agents', active: false, href: '/agents' },
    { icon: BarChartIcon, label: 'Analytics', active: false, href: '/analytics' },
    { icon: MessageSquareIcon, label: 'Conversations', active: false, href: '/conversations' },
    { icon: BrainIcon, label: 'Integrations', active: false, href: '/integrations' },
    { icon: BookmarkIcon, label: 'Client Management', active: false, href: '/client' },
    { icon: BookmarkIcon, label: 'Subscription Management', active: false, href: '/subscription' },
    { icon: BookmarkIcon, label: 'AI Management', active: false, href: '/ai' },
    { icon: BookmarkIcon, label: 'Support', active: false, href: '/support' },
    { icon: BookmarkIcon, label: 'Feature Management', active: false, href: '/feature' },
    { icon: BookmarkIcon, label: 'Api Management', active: false, href: '/apim' },
    { icon: BookmarkIcon, label: 'Security Management', active: false, href: '/security' },
    { icon: BookmarkIcon, label: 'System Management', active: false, href: '/system' }
  ];

  const personalItems: SidebarItemType[] = [
    { icon: UserIcon, label: 'Profile', active: false, href: '/profile' },
    { icon: MessageCircleIcon, label: 'Messages', active: false, href: '/messages' },
    { icon: SettingsIcon, label: 'Setting', active: false, href: '/settings' }
  ];

  return (
    <div className={`
      fixed top-0 left-0 h-full w-64 bg-white
      transition-transform duration-300 z-40 flex flex-col
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-4 mb-10 border-b border-gray-100">
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-8">
          <nav>
            {navigationItems.map((item, index) => (
              <SidebarItem key={index} {...item} />
            ))}
          </nav>

          <div>
            <div className="text-sm text-gray-500 mb-4">Personal</div>
            <nav>
              {personalItems.map((item, index) => (
                <SidebarItem key={index} {...item} />
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div>
            <div className="text-sm font-medium">Amanda Goldberg</div>
            <div className="text-xs text-gray-500">View profile</div>
          </div>
          <button className="ml-auto">
            <MoreVerticalIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;