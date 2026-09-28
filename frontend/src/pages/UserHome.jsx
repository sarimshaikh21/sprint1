import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
  Lock, Archive, PlusCircle, LayoutDashboard, Ticket, Clock, 
  CheckCircle, Image as ImageIcon, X, MessageCircle, Star, 
  ChevronRight, Menu, Info, AlertCircle, 
  Loader,
  LoaderIcon,
  LoaderCircle,
  Dot
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CiLogout } from 'react-icons/ci';
import ChatSection from './ChatSection';
import API from '../api';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;
  const userid = data?.id;

  // --- STATE MANAGEMENT ---
  const [view, setView] = useState('dashboard');
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ userid: userid, description: '', category: '', priority: 'Medium', image: null });
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  // --- LOGIC / FUNCTIONS ---
  const fetchTickets = useCallback(async () => {
    try {
      const res = await API.get(`/api/tickets?userid=${userid}`);
      setTickets(res.data);
    } catch (err) { console.log("Fetch error", err); }
  }, [userid]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/userlogin');
    }
  }, [navigate]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const tableFilteredTickets = useMemo(
    () => tickets?.filter(t => statusFilter === 'All' ? true : t.status === statusFilter) || [],
    [tickets, statusFilter]
  );

  const resolvedTickets = useMemo(
    () => tickets?.filter(t => t.status === 'Resolved') || [],
    [tickets]
  );

  const closedTickets = useMemo(
    () => tickets?.filter(t => t.status?.toLowerCase() === 'closed') || [],
    [tickets]
  );

  const stats = useMemo(() => ({
    total: tickets?.length || 0,
    open: tickets.filter(t => t.status === 'Open').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
  }), [tickets]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    submitData.append('description', formData.description);
    submitData.append('category', formData.category);
    submitData.append('priority', formData.priority);
    submitData.append('userid', userid);
    if (formData.image) {
      submitData.append('image', formData.image);
    }
    try {
      setTicketSubmitting(true);
      await API.post(`/api/tickets`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTicketSubmitting(false);
      setIsModalOpen(false);
      setFormData({ description: '', category: '', priority: 'Medium', image: null });
      alert("Ticket Created Successfully!");
      fetchTickets();
    } catch (err) {
      console.error("Upload Error:", err.response?.data || err.message);
      alert(`Error: ${err.response?.data?.error || "Check console"}`);
    }
  }, [formData, userid, fetchTickets]);

  const fetchTicketDetails = useCallback(async (tId) => {
    try {
      const res = await API.get(`/api/tickets/details/${tId}`);
      setSelectedTicket(res.data); 
    } catch (err) {
      console.log("Failed to fetch details", err);
    }
  }, []);

  const handleReopen = useCallback(async (tId) => {
    try {
      const res = await API.patch(`/api/tickets/reopen/${tId}`);
      if (res.ok) {
        setSelectedTicket(prev => ({ ...prev, status: 'Open' }));
        setTickets(prev => prev.map(t => t.ticketId === tId ? { ...t, status: 'Reopened' } : t));
      }
    } catch (err) {
      console.error("Reopen failed", err);
    }
  }, []);

  const handleSubmitFeedback = useCallback(async (ticketId) => {
    try {
      setIsSubmitting(true);
      await API.post(`/api/tickets/feedback/${ticketId}`, {
        rating,
        comment: feedbackText,
        status: 'Closed'
      });

      setRating(0);
      setFeedbackText("");
      setSelectedTicket(null);
      setShowFeedbackModal(false);
      setView('closed');
      const updatedTickets = await API.get(`/api/tickets?userid=${userid}`);
      setTickets(updatedTickets.data);
      alert("Thank you for your feedback!");
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
    }
  }, [rating, feedbackText, userid]);

  const handleOpenFeedback = useCallback((ticket) => {
    if (ticket.feedback) {
      alert("Feedback already provided!");
      return;
    }
    setSelectedTicket(ticket);
    setShowFeedbackModal(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/userlogin');
  }, [navigate]);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 to-blue-50">
      
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              H
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight">HelpDesk</h1>
              <p className="text-[10px] sm:text-sm text-slate-500 font-medium">Support Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-sm text-slate-700 font-medium">Hi, <span className="font-semibold text-slate-900">{data?.name}</span></span>
            <button
              onClick={handleLogout}
              className="cursor-pointer p-2 sm:px-4 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-all border border-slate-300 text-xs sm:text-sm flex items-center gap-2"
            >
              <CiLogout className="text-lg" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* NAVIGATION */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-12">
          <button onClick={() => setView('dashboard')} className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all border-2 text-sm ${view === 'dashboard' ? 'bg-blue-500 text-white border-blue-400' : 'bg-white border-slate-200 text-slate-700'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </button>

          <button onClick={() => setIsModalOpen(true)} className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all bg-white border-2 border-dashed border-blue-200 text-blue-600 text-sm">
            <PlusCircle size={18} /> New Ticket
          </button>

          <button onClick={() => setView('resolved')} className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all border-2 text-sm ${view === 'resolved' ? 'bg-green-500 text-white border-green-400' : 'bg-white border-slate-200 text-slate-700'}`}>
            <CheckCircle size={18} /> Resolved
          </button>

          <button onClick={() => setView('closed')} className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all border-2 text-sm ${view === 'closed' ? 'bg-slate-500 text-white border-slate-400' : 'bg-white border-slate-200 text-slate-700'}`}>
            <Archive size={18} /> Closed
          </button>

          <button onClick={() => setView('chat')} className={`cursor-pointer col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all border-2 text-sm ${view === 'chat' ? 'bg-purple-500 text-white border-purple-400' : 'bg-white border-slate-200 text-slate-700'}`}>
            <MessageCircle size={18} /> Chat
          </button>
        </div>

        <main>
          {/* STATS CARDS */}
          {view === 'dashboard' && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-1">Dashboard</h2>
                <p className="text-sm sm:text-lg text-slate-600">Overview of all support tickets</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                    <Ticket className="text-blue-500" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open</p>
                    <Clock className="text-orange-500" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{stats.open}</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved</p>
                    <CheckCircle className="text-green-500" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{stats.resolved}</div>
                </div>
              </div>

              
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-slate-200 bg-slate-50 gap-4">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">Recent Tickets</h3>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm font-medium"
                  >
                    <option value="All">All Status</option>
                    <option value="Open">Open</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        {['ID', 'Category', 'Description', 'Priority', 'Status'].map(h => (
                          <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tableFilteredTickets.map(t => (
                        <tr key={t.ticketId} onClick={() => fetchTicketDetails(t.ticketId)} className="hover:bg-slate-50 cursor-pointer">
                          <td className="px-6 py-4 font-mono font-bold text-blue-600 text-sm">#{t.ticketId}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{t.category}</td>
                          <td className="px-6 py-4 text-slate-700 truncate max-w-xs">{t.description}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${t.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{t.priority}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${t.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{t.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

             
                <div className="md:hidden divide-y divide-slate-100">
                  {tableFilteredTickets.map(t => (
                    <div key={t.ticketId} onClick={() => fetchTicketDetails(t.ticketId)} className="p-4 active:bg-slate-50 flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-blue-600">#{t.ticketId}</span>
                          <span className="text-xs font-bold text-slate-900 truncate">{t.category}</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* RESOLVED VIEW */}
          {view === 'resolved' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resolvedTickets.map(t => (
                <div key={t.ticketId} onClick={() => handleOpenFeedback(t)} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex justify-between mb-4"><span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded-full">RESOLVED</span><span className="text-xs text-slate-400">#{t.ticketId}</span></div>
                  <h3 className="font-bold text-slate-900 mb-2">{t.category}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-6">{t.description}</p>
                  <button className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold text-sm">Rate & Close</button>
                </div>
              ))}
            </div>
          )}

          {/* CLOSED VIEW */}
          {view === 'closed' && (
            <div className="space-y-4">
              {closedTickets.map(t => (
                <div key={t.ticketId} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><Lock size={12}/> Closed</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < (t.feedback?.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />)}
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-900">{t.category}</h3>
                      <p className="text-sm text-slate-500 italic mt-1">"{t.feedback?.comment || 'No comment'}"</p>
                    </div>
                    <span className="text-xs font-mono text-slate-300">ID: #{t.ticketId}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CHAT VIEW */}
          {view === 'chat' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-[500px] sm:h-[600px] overflow-hidden">
               <ChatSection ticketId={userid} currentUser={userid} />
            </div>
          )}
        </main>
      </div>

      {/* --- MODALS SECTION --- */}

      {/* NEW TICKET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">New Ticket</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Category</label>
                <select required className="w-full p-3 bg-slate-50 border rounded-xl outline-none" onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="">Select category</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Software Issue">Software Issue</option>
                  <option value="Hardware Issue">Hardware Issue</option>
                  <option value="Network Issue">Network Issue</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
                <textarea required rows="4" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" placeholder="Describe the problem..." onChange={e => setFormData({...formData, description: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Priority</label>
                  <select className="w-full p-3 bg-slate-50 border rounded-xl outline-none" onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Attachment</label>
                  <input type="file" className="text-xs block w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700" onChange={e => setFormData({...formData, image: e.target.files[0]})}/>
                </div>
              </div>
            {ticketSubmitting ? (
             <button 
  type="submit" 
  className="w-full py-4 bg-blue-900 text-white font-bold rounded-xl shadow-lg shadow-blue-100/50 disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-2" 
  disabled
  role="status"
>
  <LoaderCircle className="animate-spin" size={20} />
  <span>Creating Ticket...</span>
</button>
            ) : (
              <button type="submit" className="cursor-pointer w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100">
                Create Ticket
              </button>
            )}
            </form>
          </div>
        </div>
      )}

      {/* TICKET DETAIL MODAL */}
      {selectedTicket && !showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0">
              <h2 className="font-bold text-slate-900">Ticket #{selectedTicket.ticketId}</h2>
              <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex gap-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${selectedTicket.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{selectedTicket.status}</span>
                <span className="text-xs text-slate-400 mt-1">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-slate-700">"{selectedTicket.description}"</div>
              {selectedTicket.imagePath && <img src={selectedTicket.imagePath} className="w-full rounded-xl border object-contain max-h-64 bg-black" alt="attachment" />}
              <div className="flex gap-3 pt-4 border-t">
                {selectedTicket.status === 'Resolved' && <button onClick={() => handleReopen(selectedTicket.ticketId)} className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl text-sm">Reopen</button>}
                <button onClick={() => setSelectedTicket(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {showFeedbackModal && selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600"><CheckCircle size={32}/></div>
            <h2 className="text-xl font-bold mb-6">Rate Experience</h2>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(s => <button key={s} onClick={() => setRating(s)}><Star size={28} className={rating >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} /></button>)}
            </div>
            <textarea className="w-full p-3 bg-slate-50 border rounded-xl mb-6 outline-none" rows="3" placeholder="Comment..." value={feedbackText} onChange={e => setFeedbackText(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setShowFeedbackModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Skip</button>
              <button disabled={rating === 0 || isSubmitting} onClick={() => handleSubmitFeedback(selectedTicket.ticketId)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:bg-slate-300">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
