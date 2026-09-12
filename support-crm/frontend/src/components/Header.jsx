import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Header({ onToggleSidebar, sidebarOpen }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden lg:block">
          <Link to="/" className="text-lg font-semibold text-gray-900 hover:text-gray-700">
            Datastraw Support CRM
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/tickets/new"
          className="hidden sm:inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New Ticket
        </Link>
        <div className="h-6 w-px bg-gray-200 hidden sm:block" />
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium text-gray-900">Admin User</div>
            <div className="text-xs text-gray-500">Support Agent</div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
