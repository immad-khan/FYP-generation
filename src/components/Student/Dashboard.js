import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { studentAPI } from '../../services/api';
import ProfileCompletion from './ProfileCompletion';
import LoadingSpinner from '../common/LoadingSpinner';
import { Share2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  // Profile completion states
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  
  // Scope states
  const [department, setDepartment] = useState(user?.profile?.department || 'Software Engineering');
  const [semester, setSemester] = useState(user?.profile?.current_semester || '7');
  const [cgpa, setCgpa] = useState(user?.profile?.cgpa || '3.5');
  const [areaOfInterest, setAreaOfInterest] = useState(user?.profile?.area_of_interest || '');

  // Project submission states
  const [projectType, setProjectType] = useState('FYP'); // 'FYP' or 'Semester'
  const [semesterCourseId, setSemesterCourseId] = useState('');
  const [semesterCourses, setSemesterCourses] = useState([]);

  const isInterestEnabled = parseInt(semester) >= 6;

  // Check profile completion on mount
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user?.id) return;
      try {
        setCheckingProfile(true);
        const response = await studentAPI.checkProfileCompletion(user.id);
        setProfileComplete(response.isComplete || false);
      } catch (error) {
        console.error('Error checking profile completion:', error);
        setProfileComplete(false);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfileCompletion();
  }, [user?.id]);

  // Fetch semester courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.id) return;
      try {
        setLoadingCourses(true);
        const courses = await studentAPI.getSemesterCourses(user.id);
        setSemesterCourses(courses || []);
        if (courses?.length > 0) {
          setSemesterCourseId(courses[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch semester courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [user?.id]);

  const generateIdeas = async () => {
    setLoading(true);
    try {
      // Use Groq AI generation with student's project history
      const response = await studentAPI.generateIdeasWithHistory(user.id);
      setIdeas(response.ideas || []);
    } catch (error) {
      console.error("Generation failed:", error);
      // Fallback to traditional generation if Groq fails
      try {
        const fallbackResponse = await studentAPI.generateIdeas(user.id, {
          department,
          semester,
          cgpa,
          interests: areaOfInterest
        });
        setIdeas(fallbackResponse.ideas || []);
      } catch (fallbackError) {
        alert("Failed to generate ideas. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const saveIdea = async (idea) => {
    try {
      if (!idea.id) {
        alert("Error: Idea ID not found. Please try again.");
        return;
      }

      // Validate semester selection for Semester projects
      if (projectType === 'Semester' && !semesterCourseId) {
        alert("Please select a semester course before submitting.");
        return;
      }
      
      await studentAPI.saveIdea(user.id, idea.id, projectType, semesterCourseId);
      
      const projectLabel = projectType === 'FYP' ? 'FYP' : 'Semester Course';
      alert(`✅ ${projectLabel} project submitted for faculty review! Teachers can now see your submission.`);
    } catch (error) {
      console.error("Save error:", error);
      const errorMsg = error.response?.data?.error || error.message;
      alert(`Failed to submit: ${errorMsg}`);
    }
  };

  const handleProfileComplete = () => {
    setProfileComplete(true);
  };

  // Show loading state while checking profile
  if (checkingProfile) {
    return <LoadingSpinner />;
  }

  // Show ProfileCompletion modal if profile is not complete
  if (!profileComplete) {
    return (
      <div className="flex min-h-screen bg-[#1A1A2E]">
        <Sidebar />
        <main className="flex-1">
          <ProfileCompletion userId={user?.id} onComplete={handleProfileComplete} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#1A1A2E] font-['Inter',sans-serif]">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-10 text-white overflow-y-auto">
        {/* WELLCOME Header */}
        <header className="mb-12 border-b border-white/10 pb-8">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 uppercase tracking-widest font-['Armand_Nicolet','Inter',sans-serif]">
            WELLCOME
          </h1>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
            <span className="text-gray-400 text-lg font-medium">Let's Create Your Next Big Idea</span>
          </div>
          <p className="text-gray-500 text-base max-w-2xl">
            Welcome {user?.name || 'Student'}! Your academic profile has been set up successfully. Now it's time to define your scope and generate personalized FYP ideas based on your project history.
          </p>
        </header>

        {/* Profile Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-[#242444] border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
            <p className="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-2">Department</p>
            <p className="text-white text-lg font-bold">{department}</p>
          </div>
          <div className="bg-[#242444] border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
            <p className="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-2">Semester</p>
            <p className="text-white text-lg font-bold">Semester {semester}</p>
          </div>
          <div className="bg-[#242444] border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
            <p className="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-2">Current CGPA</p>
            <p className="text-white text-lg font-bold">{cgpa}</p>
          </div>
          <div className="bg-[#242444] border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
            <p className="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-2">Status</p>
            <p className="text-cyan-400 text-lg font-bold">✓ Complete</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Configuration Card */}
          <div className="bg-[#242444] p-8 rounded-3xl shadow-2xl border border-white/5 space-y-6">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Define Your Scope</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 font-bold text-xs uppercase tracking-widest mb-3">Department</label>
                <select 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-4 bg-[#1A1A2E] border border-gray-700/30 rounded-2xl text-gray-300 focus:border-cyan-500 outline-none transition-all cursor-pointer"
                >
                  <option>Software Engineering</option>
                  <option>Computer Science</option>
                  <option>Information Technology</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-bold text-xs uppercase tracking-widest mb-3">Semester</label>
                <select 
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full p-4 bg-[#1A1A2E] border border-gray-700/30 rounded-2xl text-gray-300 focus:border-cyan-500 outline-none transition-all cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>{sem}th Semester</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-bold text-xs uppercase tracking-widest mb-3">Current CGPA</label>
                <input
                  type="number"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  min="0" max="4" step="0.01"
                  className="w-full p-4 bg-[#1A1A2E] border border-gray-700/30 rounded-2xl text-gray-300 focus:border-cyan-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold text-xs uppercase tracking-widest mb-3">
                  Interest <span className="text-[10px] text-gray-500 font-normal ml-1">(!6th Sem Req)</span>
                </label>
                <input
                  type="text"
                  value={areaOfInterest}
                  onChange={(e) => setAreaOfInterest(e.target.value)}
                  disabled={!isInterestEnabled}
                  placeholder={isInterestEnabled ? "E.g. Blockchain, AI" : "Locked"}
                  className="w-full p-4 bg-[#1A1A2E] border border-gray-700/30 rounded-2xl text-white placeholder-gray-600 focus:border-cyan-500 outline-none transition-all disabled:opacity-20"
                />
              </div>
            </div>

            {/* Project Type Selector */}
            <div className="pt-4 border-t border-white/5">
              <label className="block text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Project Type</label>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setProjectType('FYP')}
                  className={`p-4 rounded-2xl border-2 transition-all font-bold uppercase text-xs tracking-wider ${
                    projectType === 'FYP'
                      ? 'border-pink-500 bg-pink-500/10 text-pink-400'
                      : 'border-gray-700/30 bg-[#1A1A2E]/50 text-gray-400 hover:border-gray-500/50'
                  }`}
                >
                  🎓 Final Year Project
                </button>
                <button
                  onClick={() => setProjectType('Semester')}
                  className={`p-4 rounded-2xl border-2 transition-all font-bold uppercase text-xs tracking-wider ${
                    projectType === 'Semester'
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                      : 'border-gray-700/30 bg-[#1A1A2E]/50 text-gray-400 hover:border-gray-500/50'
                  }`}
                >
                  📚 Semester Project
                </button>
              </div>

              {/* Semester Course Selection */}
              {projectType === 'Semester' && (
                <div>
                  <label className="block text-gray-400 font-bold text-xs uppercase tracking-widest mb-3">Select Course</label>
                  {loadingCourses ? (
                    <div className="w-full p-4 bg-[#1A1A2E] border border-gray-700/30 rounded-2xl text-gray-500 text-center">
                      Loading courses...
                    </div>
                  ) : semesterCourses.length === 0 ? (
                    <div className="w-full p-4 bg-[#1A1A2E] border border-gray-700/30 rounded-2xl text-gray-500 text-center">
                      No semester courses found
                    </div>
                  ) : (
                    <select
                      value={semesterCourseId}
                      onChange={(e) => setSemesterCourseId(e.target.value)}
                      className="w-full p-4 bg-[#1A1A2E] border border-gray-700/30 rounded-2xl text-gray-300 focus:border-cyan-500 outline-none transition-all cursor-pointer"
                    >
                      {semesterCourses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.course_code} - {course.course_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={generateIdeas}
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-2xl font-bold text-white uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-pink-500/20"
            >
              {loading ? (
                <span className="w-6 h-6 border-2 border-t-white border-white/20 rounded-full animate-spin"></span>
              ) : (
                <>✨ GENERATE IDEAS</>
              )}
            </button>
          </div>

          {/* Results Area */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white font-['Armand_Nicolet','Inter',sans-serif] tracking-wide uppercase">Suggested Projects</h2>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{ideas.length} Results</span>
            </div>
            
            <div className="flex-1 space-y-4 max-h-[520px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
              {ideas.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl p-10 bg-white/5 backdrop-blur-sm">
                   <div className="text-5xl mb-4 grayscale opacity-20">??</div>
                   <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest italic">Awaiting Generation</h2>
                </div>
              ) : (
                ideas.map((idea, index) => (
                  <div key={idea.id || index} className="bg-[#242444] p-6 rounded-3xl border border-white/5 hover:border-cyan-500/30 transition-all group shadow-2xl relative overflow-hidden">
                    {idea.icon && (
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        {idea.icon}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors font-['Armand_Nicolet','Inter',sans-serif] pr-10">{idea.title}</h3>
                    </div>
                    
                    <p className="text-gray-400 text-xs mb-6 leading-relaxed bg-[#1A1A2E]/40 p-3 rounded-xl border border-white/5 font-medium">
                      {idea.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(() => {
                        const techList = idea.technologies || (typeof idea.tags === 'string' ? idea.tags.split(',') : idea.tags) || [];
                        return techList.map((tech, i) => {
                          const techLabel = typeof tech === 'string' ? tech.trim() : tech;
                          return (
                            <span key={i} className="text-[10px] font-bold text-cyan-400/70 border border-cyan-500/20 px-2 py-0.5 rounded-lg bg-cyan-500/5">#{techLabel}</span>
                          );
                        });
                      })()}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => saveIdea(idea)}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-bold uppercase transition-all tracking-widest shadow-inner shadow-black/20"
                      >
                         Add to Interest List
                      </button>
                      <button className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
