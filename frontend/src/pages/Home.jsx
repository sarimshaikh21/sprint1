import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatSection from './ChatSection'
import { 
  Archive,PlusCircle, Ticket, CheckCircle, Clock, LogOut, Menu, Star,
  Search, Bell, Filter, AlertCircle, ChevronRight, User, TrendingUp,
  HeartMinus,
  XIcon
} from 'lucide-react';
import io from "socket.io-client";
import API from '../api';

const socket = io(API.defaults.baseURL, { transports: ["websocket"] });

const Home = () => {
  // 1. States
  const [selectedTicket, setSelectedTicket] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
   const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [statuses, setStatuses] = useState(null);

  
  const navigate = useNavigate();
  const location = useLocation();
  const userid = location.state?.uname || "User";

  // 2. Authentication & Data Fetching
  useEffect(() => {
    const token = localStorage.getItem('admintoken');
    if (!token) {
      navigate('/login');
    } else {
      fetchTickets();
    }
  }, [navigate]);

  const fetchTickets = async () => {
    try {
      const res = await API.get(`/api/tickets`);
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Handlers
  const handleLogout = () => {
    localStorage.removeItem('admintoken');
    navigate('/login');
  };

  const handleViewDetails = async (tId) => {
    try {
      const res = await API.get(`/api/tickets/details/${tId}`);
      // Backend aggregate returns array, extract first item
      const ticketData = Array.isArray(res.data) ? res.data[0] : res.data;
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
      await API.patch(`/api/tickets/status/${tId}`, { status: newStatus });
      setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      fetchTickets(); // Refresh list in background
    } catch (err) {
      console.error("Status update error", err);
      alert("Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

 useEffect(() => {
    // 1. Identify as Admin so the server doesn't put you in your own chat list
    socket.emit("register_user", "Admin");

    // 2. Listen for the real-time user list from the server
    socket.on("get_online_users", (allUsers) => {
      // Filter out 'Admin' so you only see Employees
      const employeesOnly = allUsers.filter(id => id !== "Admin");
      setOnlineUsers(employeesOnly);
    });

    // Cleanup: Remove listener when closing the Admin page
    return () => socket.off("get_online_users");
  }, []);





const fetchStatuses = async () => {
  try {
    const res = await API.get(`/api/tickets/stats`);
    setStatuses(res.data);
  } catch (err) {
    console.error("Failed to fetch ticket stats", err);
  }
};

useEffect(() => {
  if (activeTab === 'performance') {
    fetchStatuses();
  }
}, [activeTab]);


  // 4. Stats Calculation
const stats = [
  { 
    title: 'Active Issues', 
    value: tickets.filter(t => ['Open', 'Reopened'].includes(t.status)).length, 
    icon: <Ticket />, 
    color: 'from-blue-500 to-indigo-600' 
  },
  { 
    title: 'High Priority', 
    value: tickets.filter(t => t.priority === 'High').length, 
    icon: <AlertCircle />, 
    color: 'from-orange-500 to-red-600' 
  },
  { 
    title: 'Finalised', 
    value: tickets.filter(t => t.status === 'Closed').length, 
    icon: <CheckCircle />, 
    color: 'from-emerald-500 to-teal-600' 
  },
];


  const statusStyles = {
  Open: "bg-blue-50 text-blue-600",
  Resolved: "bg-green-50 text-green-600",
  Reopened: "bg-red-50 text-red-600"
};
const handleNavClick = (tab) => {
  setActiveTab(tab);
  if (window.innerWidth < 1024) {
    setIsSidebarOpen(false);
  }
};

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      
      {/* Mobile Header Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsSidebarOpen(false)} />
      )}
      
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-full lg:w-72' : 'w-20 lg:w-24'} bg-slate-900 transition-all duration-500 ease-in-out flex flex-col z-50 lg:z-30 shadow-2xl lg:shadow-2xl h-screen lg:h-auto fixed lg:static top-0 left-0 lg:translate-x-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-20 flex items-center px-4 lg:px-6 border-b border-slate-800/50">
          <div className="bg-blue-500 p-2 rounded-xl shadow-lg shadow-blue-500/30 flex-shrink-0">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && <span className="ml-3 font-black text-xl tracking-tight text-white hidden sm:block">{/* Hide logo text on very small screens */}HELP<span className="text-blue-400">DESK</span></span>}
      {isSidebarOpen && (
         <button className=' lg:hidden absolute right-2.5 bg-blue-500 text-white rounded-full p-1' onClick={() => setIsSidebarOpen(false)}>
           <XIcon size={32}/>
         </button>
      )}
        </div>

        <nav className="flex-1 px-2 lg:px-4 py-6 lg:py-8 space-y-2 lg:space-y-3 overflow-y-auto">
          <NavItem icon={<Ticket />} label="Overview" active={activeTab === 'dashboard'} onClick={() => { handleNavClick('dashboard')}} isOpen={isSidebarOpen} />
          <NavItem icon={<Clock />} label="History" active={activeTab === 'tickets'} onClick={() => { handleNavClick('tickets')}} isOpen={isSidebarOpen} />
          <NavItem icon={<Clock />} label="Chats" active={activeTab === 'chats'} onClick={() => { handleNavClick('chats')}} isOpen={isSidebarOpen} />
      
<NavItem 
  icon={<Archive />} 
  label="Closed" 
  active={activeTab === 'closed'} 
  onClick={() => {
    setSelectedTicket(null); // Clear detail view
   handleNavClick('closed');
  }} 
  isOpen={isSidebarOpen} 
/>
<NavItem 
  icon={<TrendingUp />} 
  label="Performance" 
  active={activeTab === 'performance'} 
  onClick={() => { handleNavClick('performance'); }} 
  isOpen={isSidebarOpen} 
/>

        </nav>

        <div className="p-4 lg:p-6 mt-auto">
          <button onClick={handleLogout} className="cursor-pointer flex items-center w-full p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all duration-300 group">
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1 flex-shrink-0" />
            {isSidebarOpen && <span className="ml-3 font-semibold hidden sm:block">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0 ml-0 lg:pb-0 pb-20">
        
        {/* Header */}
        <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-2 lg:gap-4 flex-1">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 lg:p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-all flex-shrink-0">
              <Menu size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">{/* Hide on very small screens */}Portal</p>
              <h1 className="text-lg lg:text-xl font-bold text-slate-800 capitalize truncate">{activeTab.replace('-', ' ')}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-6">
   
            <div className="lg:hidden">
              <button className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
                <Search size={18} />
              </button>
            </div>
            
            {/* Desktop search */}
            <div className="relative group hidden xl:block">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by ID, Status or Description..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-2.5 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm w-80 transition-all outline-none" 
              />
            </div>

            <div className="flex items-center gap-2 lg:gap-3 pl-0 lg:pl-6 border-l-0 lg:border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800 leading-none truncate max-w-[120px]">{userid}</p>
                <p className="text-[10px] font-medium text-emerald-500 uppercase tracking-widest">Employee</p>
              </div>
              <div className="w-10 h-10 lg:w-11 lg:h-11 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg font-bold text-sm lg:text-base">
                {userid.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Body */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          
          {/* VIEW: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mb-6 lg:mb-10">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between h-20 lg:h-auto">
                    <div className="min-w-0"><p className="text-slate-500 font-semibold text-xs lg:text-sm mb-1 truncate">{stat.title}</p><h3 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">{stat.value}</h3></div>
                    <div className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg flex-shrink-0`}>{stat.icon}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 lg:mb-6 gap-2">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Recent Updates</h2>
                <button onClick={() => setActiveTab('tickets')} className="text-blue-600 font-bold text-sm hover:gap-2 flex items-center gap-1 transition-all">
                  See full history <ChevronRight size={16} />
                </button>
              </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
  {tickets
    .filter(t => t.status === "Open") // 1. First, only keep Open tickets
    .filter(t =>                      // 2. Then, apply your search filter
      t.status.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((ticket) => (
      <TicketCard 
        key={ticket._id} 
        ticket={ticket} 
        onClick={() => handleViewDetails(ticket.ticketId)} 
      />
    ))
  }
  
  {tickets.filter(t => 
    t.status === "Open" && (
      t.status.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).length === 0 && (
    <p className="text-slate-400 italic col-span-1 lg:col-span-2 text-center py-10">No open tickets match your search.</p>
  )}
</div>
            </div>
          )}

          {/* VIEW: TICKETS LIST */}
{activeTab === 'tickets' && (
  <div className="animate-in fade-in duration-500">
    <div className="flex flex-col items-start lg:items-center lg:flex-row justify-between mb-6 lg:mb-8 gap-4 px-0 lg:px-2">
      <div className="w-full lg:w-auto">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-800">Ticket History</h2>
        <p className="text-slate-500 font-medium tracking-wide text-sm">
          {filterStatus === 'All Status' 
            ? 'Viewing all submitted requests' 
            : `Showing only ${filterStatus} requests`}
        </p>
      </div>

      <div className="bg-white p-3 w-full lg:w-auto rounded-2xl shadow-sm border border-slate-200 flex items-center px-4 hover:border-blue-300 transition-colors">
        <Filter size={18} className="text-blue-500 mr-3 flex-shrink-0" />
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-transparent outline-none text-sm font-bold text-slate-600 cursor-pointer pr-4 flex-1 min-w-0"
        >
          <option value="All Status">All Status</option>
          <option value="Open">Open</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>
    </div>

    <div className="space-y-3 lg:space-y-4">
      {tickets
        .filter(t => filterStatus === 'All Status' ? true : t.status === filterStatus)
        .length > 0 ? (
          tickets
            .filter(t => filterStatus === 'All Status' ? true : t.status === filterStatus)
            .map((t) => (
              <div key={t._id} className="relative group overflow-hidden">
                {/* Visual Status Indicator Stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-3 ${t.status === 'Open' ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>
                
                <div className="bg-white p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between hover:shadow-md transition-all ml-1 gap-4 lg:gap-0">
                  <div className="flex items-start lg:items-center gap-4 lg:gap-6 w-full">
                    <div className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl flex-shrink-0 ${t.status === 'Open' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      <Ticket size={20} className="lg:size-24" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-2 lg:mb-1">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest flex-shrink-0">
                          {t.ticketId}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${t.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}>
                          {t.priority}
                        </span>
                      </div>
                      <h3 className="text-base lg:text-lg font-bold text-slate-800 line-clamp-2 lg:line-clamp-1 mb-1">{t.description}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider hidden sm:block">
                        {t.category} • {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider block sm:hidden">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleViewDetails(t.ticketId)} 
                    className="cursor-pointer w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white hover:rotate-90 transition-all duration-500 shadow-sm flex-shrink-0 ml-auto lg:ml-0"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))
        ) : (
          <div className="p-12 lg:p-24 text-center bg-white rounded-[2rem] lg:rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="bg-slate-50 w-16 h-16 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter size={24} className="lg:size-32 text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No {filterStatus} Tickets Found</h3>
            <p className="text-slate-400 text-sm mt-1">Try changing your filter settings to see more results.</p>
          </div>
        )
      }
    </div>
  </div>
)}

{activeTab === 'performance' && statuses && (
  <div className="space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-right duration-500">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h2 className="text-xl lg:text-2xl font-black text-gray-800 uppercase tracking-tight">Performance Analytics</h2>
      <button onClick={fetchStatuses} className="text-xs font-bold text-blue-600 hover:underline px-4 py-2 bg-blue-50 rounded-xl">Refresh Data</button>
    </div>
    
    {/* KPI Cards */}
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {/* Success Rate: (Resolved + Closed) / Total */}
      <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Success Rate</p>
        <h3 className="text-2xl lg:text-3xl font-black text-emerald-500">
          {statuses.total > 0 
            ? ((( (statuses.resolved || 0) + (statuses.closed || 0) ) / statuses.total) * 100).toFixed(1) 
            : 0}%
        </h3>
      </div>

      {/* Reopen Rate */}
      <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Reopen Rate</p>
        <h3 className="text-2xl lg:text-3xl font-black text-red-500">
          {statuses.total > 0 ? (((statuses.reopened || 0) / statuses.total) * 100).toFixed(1) : 0}%
        </h3>
      </div>

      <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Tickets</p>
        <h3 className="text-2xl lg:text-3xl font-black text-blue-600">{statuses.total || 0}</h3>
      </div>
      
      <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">High Priority</p>
        <h3 className="text-2xl lg:text-3xl font-black text-orange-500">{statuses.highPriority || 0}</h3>
      </div>
    </div>

    {/* Database Distribution Visual */}
    <div className="bg-white p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <h4 className="font-black text-gray-800 text-lg">Status Breakdown</h4>
        <div className="text-right">
          <span className="text-2xl font-black text-gray-800">{statuses.total || 0}</span>
          <p className="text-gray-400 text-[10px] font-black uppercase">Total Records</p>
        </div>
      </div>

      {/* Multi-color Progress Bar */}
      {(() => {
        const total = statuses.total || 0;
        const clP = total > 0 ? ((statuses.closed || 0) / total) * 100 : 0;
        const rsP = total > 0 ? ((statuses.resolved || 0) / total) * 100 : 0;
        const opP = total > 0 ? ((statuses.open || 0) / total) * 100 : 0;
        const reP = total > 0 ? ((statuses.reopened || 0) / total) * 100 : 0;

        return (
          <>
            <div className="w-full bg-gray-100 h-6 rounded-2xl overflow-hidden flex shadow-inner">
              <div style={{ width: `${clP}%` }} className="bg-emerald-600 h-full transition-all duration-1000" />
              <div style={{ width: `${rsP}%` }} className="bg-emerald-400 h-full transition-all duration-1000" />
              <div style={{ width: `${opP}%` }} className="bg-blue-500 h-full transition-all duration-1000" />
              <div style={{ width: `${reP}%` }} className="bg-red-500 h-full transition-all duration-1000" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 mt-6 pt-6 border-t border-gray-50 text-center gap-2">
              <div>
                <p className="text-emerald-600 font-black text-base lg:text-lg">{clP.toFixed(1)}%</p>
                <p className="text-gray-400 text-[9px] font-bold uppercase">Closed ({statuses.closed || 0})</p>
              </div>
              <div className="sm:border-x border-gray-100">
                <p className="text-emerald-400 font-black text-base lg:text-lg">{rsP.toFixed(1)}%</p>
                <p className="text-gray-400 text-[9px] font-bold uppercase">Resolved ({statuses.resolved || 0})</p>
              </div>
              <div className="sm:border-r border-gray-100">
                <p className="text-blue-600 font-black text-base lg:text-lg">{opP.toFixed(1)}%</p>
                <p className="text-gray-400 text-[9px] font-bold uppercase">Open ({statuses.open || 0})</p>
              </div>
              <div>
                <p className="text-red-600 font-black text-base lg:text-lg">{reP.toFixed(1)}%</p>
                <p className="text-gray-400 text-[9px] font-bold uppercase">Reopened ({statuses.reopened || 0})</p>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  </div>
)}




{activeTab === 'closed' && (
  <div className="space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-right duration-500">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h2 className="text-xl lg:text-2xl font-black text-gray-800 uppercase tracking-tight">Closed Ticket Records</h2>
      <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-black flex-shrink-0">
        TOTAL ARCHIVED: {tickets?.filter(t => t.status?.toLowerCase() === 'closed').length}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4">
      {tickets?.filter(t => t.status?.toLowerCase() === 'closed').length > 0 ? (
        tickets
          .filter(t => t.status?.toLowerCase() === 'closed')
          .map(t => (
            <div key={t.ticketId} className="bg-white p-4 lg:p-6 rounded-[2rem] lg:rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6 hover:shadow-md transition-shadow">
              {/* Ticket Info */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-wrap items-center gap-3 w-full">
                  <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-3 py-1 rounded-full uppercase tracking-tighter flex-shrink-0">ID: {t.ticketId}</span>
                  <div className="flex text-yellow-400 flex-shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        // className="lg:size-14"
                        fill={i < (t.feedback?.rating || 0) ? "currentColor" : "none"} 
                        className={`lg:size-14 ${i < (t.feedback?.rating || 0) ? "text-yellow-400" : "text-gray-200"}`}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="font-black text-gray-800 text-base lg:text-lg line-clamp-2">{t.category}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 lg:line-clamp-1">{t.description}</p>
              </div>

              {/* Feedback Highlight */}
              <div className="bg-gray-50 p-4 lg:p-5 rounded-2xl lg:rounded-3xl border border-gray-100 flex-1 w-full lg:flex-1 lg:max-w-md relative">
                <div className="absolute -top-3 left-4 bg-white border border-gray-100 px-3 py-1 rounded-full shadow-sm text-[9px] font-black text-emerald-600 uppercase tracking-widest hidden lg:block">
                  User Rating & Review
                </div>
                <p className="text-sm text-gray-700 italic font-medium pt-2 lg:pt-8 line-clamp-3">
                  "{t.feedback?.comment || "No written review provided."}"
                </p>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-2">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block sm:inline">Resolved: {new Date(t.updatedAt).toLocaleDateString()}</span>
                  <span className="text-[9px] font-black text-emerald-500 uppercase">Satisfied User</span>
                </div>
              </div>
            </div>
          ))
      ) : (
        <div className="bg-white p-16 lg:p-24 rounded-[3rem] lg:rounded-[3.5rem] text-center border-4 border-dashed border-gray-50">
          <div className="bg-gray-50 w-20 h-20 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Archive size={32} className="lg:size-40 text-gray-200" />
          </div>
          <h3 className="text-xl font-black text-gray-400">Archive is Empty</h3>
          <p className="text-gray-300 text-sm mt-2">Closed tickets with user feedback will appear here.</p>
        </div>
      )}
    </div>
  </div>
)}


          {/* VIEW: DETAIL VIEW */}
          {activeTab === 'detail-view' && selectedTicket && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-10 w-full">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
                <button onClick={() => setActiveTab('tickets')} className="cursor-pointer flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors text-sm lg:text-base"><Menu size={18} /> Back to History</button>
                {selectedTicket.status === 'Open' ? (
  <button 
    onClick={() => handleUpdateStatus(selectedTicket.ticketId, 'Resolved')} 
    disabled={isUpdating} 
    className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white px-4 lg:px-6 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2 transition-all active:scale-95 w-full lg:w-auto text-sm lg:text-base"
  >
    {isUpdating ? '...' : <><CheckCircle size={20} /> Mark as Resolved</>}
  </button>
) : selectedTicket.status === 'Reopened' ? (
  <button 
    onClick={() => handleUpdateStatus(selectedTicket.ticketId, 'Resolved')} 
    disabled={isUpdating} 
    className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white px-4 lg:px-6 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2 transition-all active:scale-95 w-full lg:w-auto text-sm lg:text-base"
  >
    {isUpdating ? '...' : <><CheckCircle size={20} /> Resolve Again</>}
  </button>
) : (
  <div className="bg-emerald-100 text-emerald-700 px-6 py-3 rounded-2xl font-black flex items-center gap-2 w-full lg:w-auto justify-center">
    <CheckCircle size={20} /> Issue Resolved
  </div>
)}
        
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
                <div className="lg:col-span-2 space-y-6 w-full">
                  <div className="bg-white p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-slate-100 shadow-sm w-full">
                    <div className="flex flex-wrap gap-2 lg:gap-3 mb-6">
                      <span className="bg-blue-50 text-blue-600 px-3 lg:px-4 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase flex-shrink-0">ID: {selectedTicket.ticketId}</span>
                      <span className={`px-3 lg:px-4 py-1.5 rounded-xl text-xs font-black uppercase ${selectedTicket.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{selectedTicket.priority} Priority</span>
                    <span className={`${statusStyles[selectedTicket.status] || 'bg-gray-50 text-gray-600'} px-3 lg:px-4 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase flex-shrink-0`}>
  STATUS: {selectedTicket.status}
</span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-800 mb-6 leading-tight line-clamp-3 lg:line-clamp-none">{selectedTicket.description}</h2>
                    <div className="border-t border-slate-50 pt-6 lg:pt-8">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Evidence</h4>
                      {selectedTicket.imagePath ? (
                        <div className="rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden border-8 border-slate-50 shadow-inner w-full">
                          <img src={selectedTicket.imagePath} alt="Evidence" className="w-full max-h-[250px] lg:max-h-[300px] object-contain bg-slate-50" />
                        </div>
                      ) : (
                        <div className="p-12 lg:p-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] lg:rounded-[2rem] text-center text-slate-400 font-bold italic underline">
                          No Image Provided
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-6 w-full lg:w-auto">
                  <div className="bg-slate-900 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 text-white shadow-2xl relative overflow-hidden h-fit">
                    <div className="absolute top-0 right-0 p-4 lg:p-8 opacity-10"><User size={64} className="lg:size-[100px]" /></div>
                    <h3 className="text-lg lg:text-xl font-bold mb-6 lg:mb-8 relative z-10 flex items-center gap-3"><User className="text-blue-400 w-5 h-5 lg:w-6 lg:h-6" /> Requester Info</h3>
                    <div className="space-y-4 lg:space-y-6 relative z-10">
                      <InfoBox label="Full Name" value={selectedTicket?.userDetails?.fullname} />
                      <InfoBox label="Employee ID" value={selectedTicket?.userDetails?.empid || selectedTicket?.userid} />
                      <InfoBox label="Email" value={selectedTicket?.userDetails?.email} />
                      <InfoBox label="Phone Number" value={selectedTicket?.userDetails?.phone} />
                      <InfoBox label="Location" value={selectedTicket?.userDetails?.location} />
                      <InfoBox label="Reported On" value={selectedTicket?.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : '...'} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Create View */}
          {activeTab === 'create' && <div className="p-12 lg:p-20 text-center bg-white rounded-2xl lg:rounded-3xl border border-dashed">Form Implementation Needed Here</div>}
          
{activeTab === 'chats' && (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] lg:h-[90vh] bg-gray-50 border rounded-2xl overflow-hidden shadow-2xl">
      {/* Sidebar */}
      <div className="w-full lg:w-80 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-700 flex flex-col h-80 lg:h-auto">
        <div className="p-4 lg:p-5 border-b border-slate-700">
          <h2 className="text-white font-bold text-base lg:text-lg">Active Support Chats</h2>
          <p className="text-slate-400 text-xs mt-1">{onlineUsers.length} users currently online</p>
        </div>
        
        <div className="flex-1 overflow-y-auto max-h-96 lg:max-h-none">
          {onlineUsers.length > 0 ? (
            onlineUsers.map((id) => (
              <button
                key={id}
                onClick={() => setSelectedUser(id)}
                className={`w-full p-3 lg:p-4 flex items-center gap-3 transition-all border-b border-slate-800 ${
                  selectedUser === id ? "bg-blue-600/20 border-l-4 border-l-blue-500" : "hover:bg-slate-800"
                }`}
              >
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-slate-700 flex items-center justify-center text-blue-400 font-bold flex-shrink-0">
                  {id.charAt(0)}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{id}</p>
                  <span className="text-[10px] text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm">No users online</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white min-h-0">
        {selectedUser ? (
          <ChatSection key={selectedUser} ticketId={selectedUser} currentUser="Admin" />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 p-8">
            <svg className="w-16 h-16 opacity-20 lg:w-20 lg:h-20" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /></svg>
            <p className="text-center text-sm lg:text-base">Select an active employee to begin support</p>
          </div>
        )}
      </div>
    </div>
)}
        </main>
      </div>
    </div>
  );
};

// HELPER COMPONENTS
const NavItem = ({ icon, label, active, onClick, isOpen }) => (
  <button onClick={onClick} className={`flex items-center w-full p-3 lg:p-3.5 rounded-2xl transition-all duration-300 group cursor-pointer ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon}{isOpen && <span className="ml-3 lg:ml-4 font-bold tracking-wide text-sm lg:text-base truncate">{label}</span>}
  </button>
);

const TicketCard = ({ ticket, onClick }) => (
  <div onClick={onClick} className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-lg transition-all flex flex-col lg:flex-row gap-4 lg:gap-5 group cursor-pointer">
    <div className={`w-1.5 h-6 lg:h-auto rounded-full flex-shrink-0 ${ticket.priority === 'High' ? 'bg-red-500' : 'bg-blue-400'}`} />
    <div className="flex-1 w-full lg:w-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-3 lg:mb-2 gap-2 lg:gap-0">
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 lg:px-2.5 py-1 rounded-lg uppercase tracking-wider flex-shrink-0">{ticket.ticketId}</span>
        <span className="text-xs font-medium text-slate-400 order-first lg:order-last">{new Date(ticket.createdAt).toLocaleDateString()}</span>
      </div>
      <h4 className="font-bold text-slate-800 mb-2 lg:mb-1 line-clamp-2 lg:line-clamp-1 group-hover:text-blue-600 transition-colors text-base lg:text-lg">{ticket.description}</h4>
      <div className="flex flex-wrap items-center gap-3 lg:gap-4 mt-2 lg:mt-4 w-full">
         <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${ticket.status === 'Open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{ticket.status}</span>
         <span className="text-xs text-slate-400 font-medium italic line-clamp-1 flex-1 min-w-0">{ticket.category}</span>
      </div>
    </div>
  </div>
);

const InfoBox = ({ label, value }) => (
  <div className="w-full">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold text-slate-200 truncate">{value || 'N/A'}</p>
  </div>
);

const EmptyState = () => (
  <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] lg:rounded-[3rem] p-12 lg:p-20 text-center">
    <Ticket size={40} className="lg:size-48 mx-auto text-slate-300 mb-4" />
    <h3 className="text-xl font-bold text-slate-800">No Tickets Found</h3>
  </div>
);

export default Home;