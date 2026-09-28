import React, { useState } from 'react';
import { Ticket, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [empid, setEmpId] = useState("");
  const [pass, setPassword] = useState('');
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // New: Prevents double login attempts

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    API.post(`/api/userlogin`, { empid, pass })
      .then(result => {
        setLoading(false);
        if (result.data.message === "Success") {
          localStorage.setItem('token', result.data.token);
          navigate('/userhome', { state: { id: result.data.empid, name: result.data.uname } });
        }
      })
      .catch(err => {
        setLoading(false);
        if (err.response && err.response.data) {
          setError(err.response.data.message);
        } else {
          setError("Server error. Please try again later.");
        }
      });
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-indigo-100 px-4 py-8 relative overflow-hidden">
      
      <div className="hidden md:block absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="hidden md:block absolute -bottom-8 -left-8 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Top Gradient Bar */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500"></div>


          <div className="p-6 sm:p-10">
            
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4 sm:mb-6 shadow-md ring-2 ring-blue-50">
                <Ticket className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">HelpDesk Pro</h1>
              <p className="text-gray-500 text-sm mt-2 font-medium">Employee Portal Login</p>
              <div className="mt-4 h-0.5 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Employee ID Input */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2 pl-1">Employee ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={empid}
                    onChange={(e) => setEmpId(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 sm:py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-200 hover:border-blue-200 bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-400 text-base"
                    placeholder="Enter ID"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2 pl-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={pass}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3 sm:py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-200 hover:border-blue-200 bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-400 text-base"
                    placeholder="Enter Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`cursor-pointer w-full flex items-center justify-center py-3.5 px-4 mt-6 ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'} text-white font-bold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 group active:scale-[0.98]`}
              >
                <span className="flex items-center">
                  {loading ? "Authenticating..." : "Login"}
                  {!loading && <ArrowRight className="ml-2.5 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
            </form>

            {/* Error Alert */}
            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Access Denied</p>
                  <p className="text-xs mt-1 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* Divider Links */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-6">
                <a href="#" className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-indigo-600 transition-colors underline-offset-4 hover:underline">
                  Forgot Password?
                </a>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                <a href="#" className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-indigo-600 transition-colors underline-offset-4 hover:underline">
                  Support
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50/50 px-6 sm:px-10 py-4 border-t border-gray-100">
            <p className="text-center text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-widest">
              © {new Date().getFullYear()} HelpDesk Pro • Enterprise Ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
