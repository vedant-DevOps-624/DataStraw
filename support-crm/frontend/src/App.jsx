import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { ToastProvider } from './components/Toast';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="flex h-screen bg-gray-50">
          <aside className="fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-200 transition-transform duration-200 lg:translate-x-0 lg:static lg:block hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>

          {sidebarOpen && (
            <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          <div className="flex flex-1 flex-col min-w-0">
            <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tickets/new" element={<CreateTicket />} />
                <Route path="/tickets/:ticket_id" element={<TicketDetail />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App
