'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient"; // Adjust the path as needed
import {
  FaHome,
  FaUser,
  FaBox,
  FaRobot,
  FaDonate,
  FaUsers,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaHandshake,
  FaPlusCircle,
  FaSignOutAlt
} from "react-icons/fa"; 
import ProtectedRoute from "../components/protected";  // Adjust the path if needed

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen text-gray-800">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 shadow-md p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-purple-600 text-center mb-8">RentEase</h2>
            <nav className="space-y-2">
              <SidebarLink href="/dashboard/profile" icon={<FaUser size={18} />} text="Your Profile" />
              <SidebarLink href="/dashboard" icon={<FaHome size={18} />} text="Home" />
              <SidebarLink href="/dashboard/users" icon={<FaUsers size={18} />} text="Users" />
              <SidebarLink href="/dashboard/products" icon={<FaBox size={18} />} text="Products" />
              <SidebarLink href="/dashboard/donations" icon={<FaDonate size={18} />} text="Donations" />
              <SidebarLink href="/dashboard/sharedOwnership" icon={<FaHandshake size={18} />} text="Shared Owners" />
              <SidebarLink href="/dashboard/queries" icon={<FaQuestionCircle size={18} />} text="Help Center" />
              <SidebarLink href="/dashboard/damageReports" icon={<FaExclamationTriangle size={18} />} text="Damage Reports" />
              <SidebarLink href="/dashboard/assistantChatbot" icon={<FaRobot size={18} />} text="Assistant Chatbot" />
              <SidebarLink href="/dashboard/newAdmin" icon={<FaPlusCircle size={18} />} text="New Admin" />
                    <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 text-red-600 hover:text-red-700 text-sm font-medium transition"
                    >
                    <FaSignOutAlt size={18} />
                    <span>Logout</span>
                  </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

function SidebarLink({ href, icon, text }: { href: string; icon: React.ReactNode; text: string }) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-purple-100 text-gray-700 hover:text-purple-700 transition"
    >
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </Link>
  );
}
