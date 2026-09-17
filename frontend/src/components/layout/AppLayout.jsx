import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const AppLayout = () => {
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';
  const isBusinessPage = location.pathname.startsWith('/business');
  const isPublicPage =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname.startsWith('/verify/') ||
    isBusinessPage;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF9F6] text-[#003943] font-sans">
      {!isLoginPage && <Navbar />}
      <div className="flex-1 flex w-full">
        {!isPublicPage && <Sidebar />}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 w-full ${isBusinessPage && (location.pathname === '/business/register' || location.pathname === '/business/submit-application') ? 'max-w-3xl mx-auto' : 'max-w-7xl mx-auto'}`}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};




