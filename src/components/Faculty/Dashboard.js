'use client';

import React, { useState, useEffect, useRef } from 'react';
import FacultySidebar from './FacultySidebar';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { facultyAPI, authAPI, studentAPI } from '../../services/api';

const FacultyDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [uploading, setUploading] = useState(false);
  const [students, setStudents] = useState([]);
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [studentProjects, setStudentProjects] = useState([]);
  const [facultyProfile] = useState({
    name: user?.name || "Faculty Member",
    department: "Artificial Intelligence",
    id: user?.id || "FCLT-1001",
    role: "Project Coordinator"
  });
  const [studentForm, setStudentForm] = useState({
    name: '',
    regNum: '',
    department: '',
    cgpa: '',
    interest: '',
    projectId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching faculty data...');
        const studentsRes = await facultyAPI.getStudents();
        // Ensure students is an array
        const studentsData = Array.isArray(studentsRes) ? studentsRes : 
                            (studentsRes?.data && Array.isArray(studentsRes.data)) ? studentsRes.data : [];
        setStudents(studentsData);

        const ideasRes = await facultyAPI.getSavedIdeas();
        // Ensure ideas is an array
        const ideasData = Array.isArray(ideasRes) ? ideasRes : 
                         (ideasRes?.data && Array.isArray(ideasRes.data)) ? ideasRes.data : [];
        setSavedIdeas(ideasData);
        console.log('Data loaded:', { students: studentsData.length, ideas: ideasData.length });
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    const fetchStudentHistory = async () => {
      if (selectedIdea && selectedIdea.user_id) {
        try {
          const projects = await studentAPI.getProjects(selectedIdea.user_id);
          setStudentProjects(Array.isArray(projects) ? projects : []);
        } catch (err) {
          console.error("Failed to fetch student projects:", err);
          setStudentProjects([]);
        }
      } else {
        setStudentProjects([]);
      }
    };
    fetchStudentHistory();
  }, [selectedIdea]);

  const handleUpdateStatus = async (savedId, status) => {
    try {
      await facultyAPI.updateIdeaStatus(savedId, status);
      
      // Update local state
      setSavedIdeas(prev => prev.map(idea => 
        idea.saved_id === savedId ? { ...idea, status } : idea
      ));
      
      if (selectedIdea && selectedIdea.saved_id === savedId) {
        setSelectedIdea(prev => ({ ...prev, status }));
      }
      
      alert(`Idea ${status} successfully!`);
      setSelectedIdea(null);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please ensure the "status" column exists in your saved_ideas table.');
    }
  };

  const handleStudentFormChange = (e) => {
    const { id, value } = e.target;
    setStudentForm(prev => ({ ...prev, [id]: value }));
  };

  const generateProjectId = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(100 + Math.random() * 900);
    const projectId = `FYP-${year}-${randomNum}`;
    setStudentForm(prev => ({ ...prev, projectId }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      // 1. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');

      // Using axios for better error reporting
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dcdhsyj86/image/upload`,
        formData
      );
      
      const imageUrl = response.data.secure_url;

      if (!imageUrl) throw new Error('Failed to get image URL from Cloudinary');

      // 2. Update in our backend
      await authAPI.updateProfilePicture(user.id, imageUrl);

      // 3. Update local state
      updateUser({ ...user, profile_picture: imageUrl });
      alert('Profile picture updated!');
    } catch (err) {
      console.error('Upload error details:', err.response?.data || err);
      const msg = err.response?.data?.error?.message || err.message;
      alert(`Upload failed: ${msg}. Please ensure "ml_default" preset is enabled in Cloudinary.`);
    } finally {
      setUploading(false);
    }
  };

  const saveStudentProfile = async (e) => {
    e.preventDefault();
    console.log('Saving student profile:', studentForm);
    try {
      const response = await facultyAPI.addStudent(studentForm);
      console.log('Student saved successfully:', response);
      setStudents(prevStudents => [...prevStudents, studentForm]);
      // Optional: reset form
      setStudentForm({
        name: '',
        regNum: '',
        department: '',
        cgpa: '',
        interest: '',
        projectId: ''
      });
      alert('Student profile saved successfully!');
    } catch (error) {
      console.error('Error saving student profile:', error);
      alert('Failed to save student profile.');
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard Overview</h1>
              <p className="text-gray-400">Manage your students and project ideas</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-blue-700/10 to-transparent border border-blue-500/30 p-8 hover:border-blue-400/60 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-400/5 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-blue-400/20 group-hover:to-blue-500/10 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-blue-300/80 mb-1">Total Students</p>
                      <p className="text-5xl font-bold text-white">{students.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 19H9m6 0a6 6 0 01-12 0m12 0h.01M9 19a6 6 0 01-6 0m6 0h.01" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Active participants in FYP program</p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 via-purple-700/10 to-transparent border border-purple-500/30 p-8 hover:border-purple-400/60 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-400/5 to-purple-500/0 group-hover:from-purple-500/10 group-hover:via-purple-400/20 group-hover:to-purple-500/10 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-purple-300/80 mb-1">Saved Ideas</p>
                      <p className="text-5xl font-bold text-white">{savedIdeas.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Ideas waiting for approval</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-600/10 via-slate-900/50 to-transparent p-8">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-400/5 to-cyan-500/0"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setActiveSection('student-info')}
                    className="group relative px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 overflow-hidden bg-gradient-to-r from-pink-500 to-rose-600 hover:shadow-lg hover:shadow-pink-500/30 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add New Student
                    </div>
                  </button>
                  <button 
                    onClick={() => setActiveSection('saved-ideas')}
                    className="group relative px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Saved Ideas
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'student-info':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Student Enrollment</h1>
              <p className="text-gray-400">Register and manage student project details</p>
            </div>
            
            <div className="relative overflow-hidden rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-600/10 via-slate-900/50 to-transparent p-8">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-400/5 to-pink-500/0"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-pink-400 to-rose-500 rounded-full"></span>
                  Record Student Details
                </h3>
              
                <form onSubmit={saveStudentProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Project/System ID (Auto-Generated)
                      </label>
                      <input
                        type="text"
                        id="projectId"
                        value={studentForm.projectId}
                        readOnly
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/30 border border-slate-600/50 text-slate-300 cursor-not-allowed focus:border-cyan-400/50 focus:outline-none transition-colors"
                        placeholder="Click 'Generate ID' to create an internal project ID."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={generateProjectId}
                      className="group relative px-4 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 transition-all overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="relative">Generate ID</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Student Name</label>
                    <input
                      type="text"
                      id="name"
                      value={studentForm.name}
                      onChange={handleStudentFormChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 focus:border-pink-400/70 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all"
                      placeholder="e.g., Alishba Khan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Registration Number</label>
                    <input
                      type="text"
                      id="regNum"
                      value={studentForm.regNum}
                      onChange={handleStudentFormChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 focus:border-pink-400/70 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all"
                      placeholder="e.g., F2021-AI-042"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Department</label>
                    <input
                      type="text"
                      id="department"
                      value={studentForm.department}
                      onChange={handleStudentFormChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 focus:border-pink-400/70 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all"
                      placeholder="e.g., AI or CS"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">CGPA</label>
                      <input
                        type="number"
                        id="cgpa"
                        value={studentForm.cgpa}
                        onChange={handleStudentFormChange}
                        min="0.0"
                        max="4.0"
                        step="0.01"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 focus:border-pink-400/70 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all"
                        placeholder="e.g., 3.65"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Area of Interest</label>
                      <input
                        type="text"
                        id="interest"
                        value={studentForm.interest}
                        onChange={handleStudentFormChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 focus:border-pink-400/70 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all"
                        placeholder="e.g., NLP, Vision, Robotics"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="group relative w-full px-6 py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-pink-500 to-rose-600 hover:shadow-lg hover:shadow-pink-500/40 transition-all overflow-hidden mt-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Save Student Profile
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case 'saved-ideas':
        return (
          <div className="space-y-10">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Project Ideas</h1>
              <p className="text-gray-400">Review and approve student project submissions</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-pink-400 to-rose-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-white">🎓 FYP Projects</h2>
                <span className="ml-auto px-4 py-2 rounded-full bg-pink-500/20 text-pink-300 font-bold text-sm border border-pink-500/40">
                  {savedIdeas.length} Submissions
                </span>
              </div>
              
              {savedIdeas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedIdeas.map(idea => (
                    <div key={idea.id} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-600/10 via-slate-900/40 to-transparent border border-pink-500/30 p-6 hover:border-pink-400/60 hover:bg-gradient-to-br hover:from-pink-600/15 hover:via-slate-900/60 hover:to-transparent transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-400/5 to-pink-500/0 group-hover:via-pink-400/10 transition-all duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-lg font-bold text-pink-300 group-hover:text-pink-200 transition-colors flex-1">{idea.title}</h4>
                          {idea.status && (
                            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap ${
                              idea.status === 'Approved' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 
                              idea.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                              'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                            }`}>
                              {idea.status}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <p className="text-xs text-pink-400/80 font-medium">
                            ðŸ‘¤ {idea.student_name}
                          </p>
                          {idea.cgpa && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              CGPA: {idea.cgpa}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mb-4 line-clamp-2">{idea.description.substring(0, 120)}...</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {idea.technologies && idea.technologies.split(',').slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-1 text-xs rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50">
                              #{tag.trim()}
                            </span>
                          ))}
                          {idea.technologies && idea.technologies.split(',').length > 3 && (
                            <span className="px-2 py-1 text-xs rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/50">
                              +{idea.technologies.split(',').length - 3} more
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => setSelectedIdea(idea)}
                          className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500/80 to-rose-600/80 hover:from-pink-500 hover:to-rose-600 text-white text-sm font-semibold transition-all duration-300"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-slate-600/30 bg-gradient-to-br from-slate-800/30 via-slate-900 to-transparent p-12 text-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-400/5 to-pink-500/0"></div>
                  <div className="relative z-10">
                    <p className="text-gray-400">No FYP projects submitted yet</p>
                  </div>
                </div>
              )}
            </div>

            {/* Idea Details Modal */}
            {selectedIdea && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-cyan-500/40 shadow-2xl shadow-cyan-900/30 overflow-hidden animate-in fade-in zoom-in duration-300">
                  <div className="p-6 border-b border-cyan-500/20 flex justify-between items-center bg-gradient-to-r from-cyan-600/10 to-blue-600/10 shrink-0">
                    <div>
                      <h3 className="text-2xl font-bold text-cyan-300">Project Details</h3>
                      <p className="text-xs text-gray-400 mt-1">Review and manage idea submission</p>
                    </div>
                    <button
                      onClick={() => setSelectedIdea(null)}
                      className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400/70">Student</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-2xl font-bold text-white">{selectedIdea.student_name}</p>
                        {selectedIdea.reg_number && (
                          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                            {selectedIdea.reg_number}
                          </span>
                        )}
                        {selectedIdea.department && (
                          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                            {selectedIdea.department}
                          </span>
                        )}
                        {selectedIdea.cgpa && (
                          <span className="px-3 py-1 rounded-full bg-cyan-900/40 text-cyan-300 text-xs font-semibold border border-cyan-800/50 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                            CGPA: {selectedIdea.cgpa}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400/70">Project Title</p>
                      <p className="text-3xl font-extrabold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">{selectedIdea.title}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400/70">Description</p>
                      <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/50 text-gray-300 leading-relaxed text-sm">
                        {selectedIdea.description}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Category</p>
                        <p className="text-white font-medium">{selectedIdea.category || 'N/A'}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Submitted</p>
                        <p className="text-white font-medium">
                          {selectedIdea.saved_at ? new Date(selectedIdea.saved_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400/70">Technologies</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedIdea.technologies && typeof selectedIdea.technologies === 'string' && selectedIdea.technologies.split(',').map((tag, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 text-xs font-medium">
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedIdea.status && (
                      <div className="pt-4 border-t border-slate-600/50">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Current Status</p>
                        <span className={`inline-block px-4 py-2 rounded-lg font-bold uppercase text-xs ${
                          selectedIdea.status === 'Approved' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 
                          selectedIdea.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                        }`}>
                          {selectedIdea.status}
                        </span>
                      </div>
                    )}

                    {studentProjects.length > 0 && (
                      <div className="pt-6 border-t border-slate-600/50 space-y-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400/70">Student's Past Projects</p>
                        <div className="grid gap-3">
                          {studentProjects.map(proj => (
                            <div key={proj.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="text-white font-bold text-sm tracking-wide">{proj.project_name}</h4>
                                  <p className="text-xs text-gray-400">{proj.course_name} (Sem {proj.semester_number})</p>
                                </div>
                              </div>
                              <p className="text-xs text-gray-400 mb-3 leading-relaxed bg-[#1A1A2E]/50 p-2 rounded-lg">{proj.project_description}</p>
                              <div className="flex flex-wrap gap-1">
                                {[...(proj.languages ? proj.languages.split(',') : []), ...(proj.frontend_frameworks ? proj.frontend_frameworks.split(',') : []), ...(proj.backend_frameworks ? proj.backend_frameworks.split(',') : [])].filter(Boolean).slice(0, 5).map((tech, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-700/50 text-slate-300">
                                    {tech.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-gradient-to-r from-slate-800/30 to-slate-900/30 border-t border-slate-600/30 flex gap-3 shrink-0">
                    <button
                      onClick={() => handleUpdateStatus(selectedIdea.saved_id, 'Approved')}
                      className="flex-1 group relative py-3 px-4 rounded-lg text-white font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/30 transition-all overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="relative flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                      </span>
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedIdea.saved_id, 'Rejected')}
                      className="flex-1 group relative py-3 px-4 rounded-lg text-white font-bold bg-gradient-to-r from-red-600 to-pink-600 hover:shadow-lg hover:shadow-red-500/30 transition-all overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="relative flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Faculty Profile</h1>
              <p className="text-gray-400">View and manage your account information</p>
            </div>
            
            <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-600/10 via-slate-900/50 to-transparent p-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-400/5 to-purple-500/0"></div>
              <div className="relative z-10">
                <div className="flex flex-col items-center mb-8 pb-8 border-b border-purple-500/20">
                  <div className="relative mb-4 group">
                    <div className="w-40 h-40 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-6xl font-bold text-white overflow-hidden border-4 border-purple-400/50 shadow-2xl shadow-purple-900/50 group-hover:border-purple-300/80 transition-all">
                      {user?.profile_picture ? (
                        <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'MU'
                      )}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-slate-900 border-4 border-slate-900 hover:scale-110 transition-all shadow-lg hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Update Profile Picture"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <i className="fas fa-spinner animate-spin text-sm"></i>
                      ) : (
                        <i className="fas fa-plus text-base"></i>
                      )}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{user?.name}</h3>
                  <p className="text-indigo-300 font-medium">Faculty Member</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">Department</p>
                    <p className="text-lg font-medium text-white">{facultyProfile.department}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">Faculty ID</p>
                    <p className="text-lg font-medium text-white">{facultyProfile.id}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">Current Role</p>
                    <p className="text-lg font-medium text-white">{facultyProfile.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-white mb-6">Account Settings</h2>
            
            <div className="p-6 rounded-xl bg-[#2A004E] border border-purple-400/30 space-y-6">
              <p className="text-lg text-cyan-300">Manage account preferences, password, and security settings.</p>
              
              <div className="pt-6 border-t border-purple-700/50">
                <h3 className="text-xl font-semibold mb-3 text-pink-400">Session Management</h3>
                <p className="text-sm text-indigo-300 mb-4">Click below to securely sign out of the system.</p>
                <button 
                  onClick={logout}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:opacity-90 transition"
                >
                  Secure Logout
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#12042B] to-[#2A004E] text-white">
      <FacultySidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="flex-1 p-6 lg:p-10">
        <header className="mb-10 p-6 rounded-xl bg-[#2A004E] border-none shadow-xl">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            AI FYP Idea Generator -- Faculty Panel
          </h1>
        </header>
        
        {renderContent()}
      </main>
    </div>
  );
};

export default FacultyDashboard;

