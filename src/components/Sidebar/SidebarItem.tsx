import { FC } from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  href: string;
}

const SidebarItem: FC<SidebarItemProps> = ({ icon: Icon, label, active, href }) => {
  return (
    <Link href={href}>
      <div className={`
          flex items-center mt-5 px-4 py-3 rounded-lg cursor-pointer mb-2
          ${active ? 'bg-black text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
        `}>
        <Icon className="w-5 h-5" />
        <span className="font-medium ml-2">{label}</span>
      </div>
    </Link>
  );
};

export default SidebarItem;

