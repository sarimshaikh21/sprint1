import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Components
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import TicketsList from '../components/TicketsList';
import Performance from '../components/Performance';
import ClosedTickets from '../components/ClosedTickets';
import TicketDetail from '../components/TicketDetail';
import ChatView from '../components/ChatView';

// Hooks
import { useTickets } from '../hooks/useTickets';
import { useSocket } from '../hooks/useSocket';

const HomeNew = () => {
  // State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');

  // Hooks
  const { tickets, loading, statuses, fetchTickets, fetchStatuses, updateTicketStatus, fetchTicketDetails } = useTickets();
  const { onlineUsers, selectedUser, setSelectedUser } = useSocket();

  // Navigation
  const navigate = useNavigate();
  const location = useLocation();
  const userid = location.state?.uname || "User";

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('admintoken');
    if (!token) {
      navigate('/login');
    } else {
      fetchTickets();
    }
  }, [navigate, fetchTickets]);

  // Fetch statuses when performance tab is active
  useEffect(() => {
    if (activeTab === 'performance') {
      fetchStatuses();
    }
  }, [activeTab, fetchStatuses]);

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem('admintoken');
    navigate('/login');
  };

  const handleViewDetails = async (tId) => {
    try {
      const ticketData = await fetchTicketDetails(tId);
      setSelectedTicket(ticketData);
      setActiveTab('detail-view');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Error fetching details", err);
    }
  };

  const handleUpdateStatus = async (tId, newStatus) => {
    if (!window.confirm("Mark this ticket as Resolved?")) return;
    setIsUpdating(true);
    try {
      await updateTicketStatus(tId, newStatus);
      setSelectedTicket(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Status update error", err);
      alert("Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDashboardTicketClick = (ticketId) => {
    handleViewDetails(ticketId);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* Mobile Header Overlay when sidebar is open */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsSidebarOpen(false)} />
      )}

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0 ml-0 lg:pb-0 pb-20">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeTab={activeTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          userid={userid}
        />

        {/* Dynamic Body */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          {activeTab === 'dashboard' && (
            <Dashboard
              tickets={tickets}
              searchTerm={searchTerm}
              setActiveTab={setActiveTab}
              onTicketClick={handleDashboardTicketClick}
            />
          )}

          {activeTab === 'tickets' && (
            <TicketsList
              tickets={tickets}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              handleViewDetails={handleViewDetails}
            />
          )}

          {activeTab === 'performance' && (
            <Performance
              statuses={statuses}
              fetchStatuses={fetchStatuses}
            />
          )}

          {activeTab === 'closed' && (
            <ClosedTickets tickets={tickets} />
          )}

          {activeTab === 'detail-view' && (
            <TicketDetail
              selectedTicket={selectedTicket}
              setActiveTab={setActiveTab}
              handleUpdateStatus={handleUpdateStatus}
              isUpdating={isUpdating}
            />
          )}

          {activeTab === 'chats' && (
            <ChatView
              onlineUsers={onlineUsers}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
            />
          )}

          {/* Create View */}
          {activeTab === 'create' && (
            <div className="p-12 lg:p-20 text-center bg-white rounded-2xl lg:rounded-3xl border border-dashed">
              Form Implementation Needed Here
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomeNew;