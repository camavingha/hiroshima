'use client' // Required because we are using hooks like useRouter
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { name: 'Overview', href: '/' },
  { name: 'Workouts', href: '/workouts' },
  { name: 'Reading', href: '/reading' },
  { name: 'Body Stats', href: '/body' },
  { name: 'Mood', href: '/mood' },
];

export default function Sidebar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname(); // Helps highlight which page you are on
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email ?? null);
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh(); // Forces Next.js to clear the cache and update the UI
  };

  return (
    <nav className="w-64 h-screen bg-white border-r border-gray-100 p-6 flex flex-col fixed left-0 top-0 z-50">
      <div className="mb-10">
        <h2 className="text-2xl font-black text-black tracking-tighter italic">HIROSHIMA</h2>
      </div>

      <div className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`block px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive 
                  ? 'bg-black text-white' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-black'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="pt-6 border-t border-gray-100 space-y-4">
        {/* User Info Section */}
        {userEmail && (
          <div className="px-4">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Logged in as</p>
            <p className="text-xs text-gray-600 truncate font-medium">{userEmail}</p>
          </div>
        )}

        <button 
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm text-red-500 font-semibold hover:bg-red-50 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}