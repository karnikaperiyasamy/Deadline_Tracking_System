import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { NLTaskModal } from '../tasks/NLTaskModal';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNLModalOpen, setIsNLModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenNLModal={() => setIsNLModalOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      <NLTaskModal
        isOpen={isNLModalOpen}
        onClose={() => setIsNLModalOpen(false)}
        onSuccess={() => {
          // Trigger global refresh if needed
          window.location.reload();
        }}
      />
    </div>
  );
};
