import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout: React.FC = () => {
  return (
    <div>
      <main>
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
};

export default MainLayout;
