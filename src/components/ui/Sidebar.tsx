import Link from "next/link";
import { Home, Users, BarChart, MessageCircle, Settings } from "lucide-react";
import { JSX } from "react";

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow-md p-5 flex flex-col">
      <h1 className="text-2xl font-bold mb-5">LulAI</h1>
      <nav className="flex flex-col space-y-2">
        <SidebarLink href="/admin" icon={<Home size={20} />} text="Home" />
        <SidebarLink href="/superadmin" icon={<Users size={20} />} text="Super Admin" />
        <SidebarLink href="/agents" icon={<Users size={20} />} text="Agents" />
        <SidebarLink href="/analytics" icon={<BarChart size={20} />} text="Analytics" />
        <SidebarLink href="/conversations" icon={<MessageCircle size={20} />} text="Conversations" />
        <SidebarLink href="/integrations" icon={<Settings size={20} />} text="Integrations" />
      </nav>
    </div>
  );
};

const SidebarLink = ({ href, icon, text }: { href: string; icon: JSX.Element; text: string }) => (
  <Link href={href} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200">
    {icon}
    <span>{text}</span>
  </Link>
);

export default Sidebar;
