import React, { useState } from 'react';
import { Ticket, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import API from '../api';

const Login = () => {
  const navigate= useNavigate()
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

const handleSubmit = (event) => {
  event.preventDefault();
  setError(""); 

  API.post(`/api/login`, { username, password })
    .then(result => {
      if (result.data.message === "Success") {
        localStorage.setItem('admintoken', result.data.admintoken);
        const uname = result.data.uname.split(' ')[0];
        navigate('/home', { state: { uname: uname } });
      }
    })
    .catch(err => {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred. Please try again.");
      }
      console.log(err);
    });
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden py-10 sm:py-0">
      
      {/* Top Right Gradient Blob */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-300 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      
      {/* Bottom Left Gradient Blob */}
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-300 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-5xl z-10 px-4">
        {/* Changed grid-cols-2 to grid-cols-1 lg:grid-cols-2 to stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding & Info (Hidden on mobile, appears on lg) */}
          <div className="hidden lg:flex flex-col justify-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-500">
                <Ticket className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>
              <h1 className="text-5xl font-black text-gray-900 mb-4">HelpDesk Pro</h1>
              <p className="text-xl text-gray-600 leading-relaxed font-medium">
                Streamline your support operations with our intuitive admin portal. Manage tickets, track issues, and deliver exceptional customer service.
              </p>
            </div>
            
            <div className="space-y-4 mt-10">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Real-time Ticket Management</h3>
                  <p className="text-sm text-gray-500">Track and manage support tickets instantly</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Advanced Analytics</h3>
                  <p className="text-sm text-gray-500">Gain insights with detailed reporting</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Secure Access</h3>
                  <p className="text-sm text-gray-500">Enterprise-grade security for your data</p>
                </div>
              </div>
            </div>
          </div>


          <div>
            <div className="lg:hidden flex flex-col items-center mb-8">
               <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                  <Ticket className="w-8 h-8 text-white" />
               </div>
               <h1 className="text-3xl font-black text-gray-900">HelpDesk Pro</h1>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100">
              
              {/* Header */}
              <div className="mb-10">
                <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-500 font-medium">Sign in to your admin account</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">Username</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 hover:bg-white"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

              
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 hover:bg-white"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>


                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 border-2 border-gray-300 rounded-lg text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 transition-all hover:border-blue-500" 
                    />
                    <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">Remember me</span>
                  </label>
                  <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Forgot password?
                  </a>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center py-3.5 px-4 mt-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 group cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="flex items-center">
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </form>

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 text-sm flex items-start gap-3 animate-pulse">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-bold">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-center text-xs text-gray-500 font-medium tracking-wide">SECURE ADMINISTRATOR LOGIN</p>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-500 mt-6">© {new Date().getFullYear()} HelpDesk Pro. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
