import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import PageBackdrop from './PageBackdrop';

const MainLayout: React.FC = () => {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-on-surface">
      <PageBackdrop />
      <main className="relative z-10">
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
};

export default MainLayout;
