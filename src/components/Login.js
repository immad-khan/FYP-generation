import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { validateForm } from '../utils/validation';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users } from 'lucide-react';

const Login = () => {
  const [currentView, setCurrentView] = useState('role-select');
  const [selectedRole, setSelectedRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        navigate('/student/dashboard');
      } else if (user.role === 'faculty') {
        navigate('/faculty/dashboard');
      }
    }
  }, [user, navigate]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData(prev => ({ ...prev, role }));
    setCurrentView('login');
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateForm(
      currentView === 'login' 
        ? { email: formData.email, password: formData.password }
        : formData,
      currentView === 'login' ? 'login' : 'registration'
    );
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      let result;
      if (currentView === 'login') {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData);
      }
      
      if (result && !result.success) {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    setCurrentView('role-select');
    setSelectedRole('');
    setErrors({});
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student'
    });
  };

  // Role Selection View
  if (currentView === 'role-select') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              🎓 AI FYP Generator
            </h1>
            <p className="text-blue-100 text-lg md:text-xl max-w-md mx-auto">
              Intelligent Final Year Project Ideation System
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Student Button */}
            <button
              onClick={() => handleRoleSelect('student')}
              className="group relative bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 cursor-pointer border border-purple-400/30"
            >
              <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="text-purple-600 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Student</h2>
                <p className="text-purple-100 text-sm leading-relaxed">
                  Get personalized FYP ideas based on your project history using AI
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-purple-100 text-sm font-semibold">Continue as Student</span>
                  <svg className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Teacher Button */}
            <button
              onClick={() => handleRoleSelect('faculty')}
              className="group relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 cursor-pointer border border-orange-400/30"
            >
              <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="text-orange-600 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Teacher</h2>
                <p className="text-orange-100 text-sm leading-relaxed">
                  Review and approve student FYP proposals with detailed feedback
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-orange-100 text-sm font-semibold">Continue as Teacher</span>
                  <svg className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          <div className="text-center mt-12 text-blue-100">
            <p className="text-sm">Secure platform for FYP management</p>
          </div>
        </div>
      </div>
    );
  }

  // Login/Signup View
  const roleLabel = selectedRole === 'student' ? 'Student' : 'Teacher';
  const isStudent = selectedRole === 'student';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      <div className="w-full max-w-sm sm:max-w-md">
        <button
          onClick={handleBackClick}
          className="mb-6 flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to role selection
        </button>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
          <div className="text-center mb-8">
            <div className={`inline-block p-3 rounded-xl mb-4 ${
              isStudent 
                ? 'bg-purple-500/20 text-purple-400' 
                : 'bg-orange-500/20 text-orange-400'
            }`}>
              {isStudent ? <BookOpen size={24} /> : <Users size={24} />}
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">AI FYP</h1>
            <p className="text-slate-400 text-sm">
              {currentView === 'login' ? 'Welcome back' : 'Create your account'}
            </p>
          </div>

          {errors.submit && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm font-medium">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {currentView === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 border rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:outline-none transition ${
                    errors.name 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                      : 'border-slate-600 focus:ring-2 focus:ring-blue-500'
                  }`}
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                className={`w-full px-4 py-3 border rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:outline-none transition ${
                  errors.email 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                    : 'border-slate-600 focus:ring-2 focus:ring-blue-500'
                }`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:outline-none transition pr-10 ${
                    errors.password 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                      : 'border-slate-600 focus:ring-2 focus:ring-blue-500'
                  }`}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>

            {currentView === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:outline-none transition ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                      : 'border-slate-600 focus:ring-2 focus:ring-blue-500'
                  }`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all mt-8 ${
                isStudent
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50'
                  : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:opacity-50'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : currentView === 'login' ? (
                `Login as ${roleLabel}`
              ) : (
                `Create ${roleLabel} Account`
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              {currentView === 'login' ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button
                type="button"
                onClick={() => {
                  setCurrentView(currentView === 'login' ? 'signup' : 'login');
                  setErrors({});
                }}
                className={`font-semibold transition-colors ${
                  isStudent
                    ? 'text-purple-400 hover:text-purple-300'
                    : 'text-orange-400 hover:text-orange-300'
                }`}
              >
                {currentView === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-8 text-blue-200 text-xs">
          <p>Secure • Encrypted • Student-Focused</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
