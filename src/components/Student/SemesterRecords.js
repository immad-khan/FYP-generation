import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { studentAPI } from '../../services/api';
import ErrorDisplay from '../common/ErrorDisplay';

const SemesterRecords = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  const [newProject, setNewProject] = useState({
    semesterNumber: '1',
    course_code: '',
    course_name: '',
    project_name: '',
    languages: '',
    frontend_frameworks: '',
    backend_frameworks: '',
    project_description: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchProjects();
    }
  }, [user?.id]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await studentAPI.getProjects(user.id);
      setProjects(res.projects || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load records.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async () => {
    if (!newProject.course_code || !newProject.course_name || !newProject.project_name || !newProject.languages || !newProject.project_description) {
      setError('Course code, Course name, Project name, Languages, and Description are required!');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await studentAPI.saveProject(user.id, {
        semesterNumber: parseInt(newProject.semesterNumber),
        courseCode: newProject.course_code,
        courseName: newProject.course_name,
        projectName: newProject.project_name,
        languages: newProject.languages,
        frontendFrameworks: newProject.frontend_frameworks,
        backendFrameworks: newProject.backend_frameworks,
        projectDescription: newProject.project_description,
      });

      setNewProject({ ...newProject, course_code: '', course_name: '', project_name: '', languages: '', frontend_frameworks: '', backend_frameworks: '', project_description: '' });
      fetchProjects();
      
      // Show success pop up
      window.alert("Project Record Added Successfully!");
      
    } catch (err) {
      setError('Failed to save project.');
    } finally {
      setLoading(false);
    }
  };

  const removeProject = async (id) => {
    try {
      await studentAPI.deleteProject(id);
      fetchProjects();
    } catch (err) {
      setError('Failed to delete project.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#1A1A2E]">
      <Sidebar />

      <main className="flex-1 p-4 md:p-10 text-white overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Semester Records
          </h1>
          <p className="text-gray-400 text-lg font-medium">Add your projects point by semester. You must add at least 1 project for each completed semester.</p>
        </header>

        {error && <ErrorDisplay message={error} />}

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mt-4">
          <div className="bg-[#242444] p-8 rounded-2xl shadow-2xl border border-white/5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-gray-300 font-bold text-sm mb-3 uppercase">Semester Number</label>
                <select
                  value={newProject.semesterNumber}
                  onChange={(e) => setNewProject({ ...newProject, semesterNumber: e.target.value })}
                  className="w-full p-4 bg-[#1A1A2E] border border-gray-700/50 rounded-xl text-gray-300 focus:border-cyan-500 outline-none transition-all"
                >
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-bold text-sm mb-3 uppercase">Course Code</label>
                <input
                  type="text"
                  value={newProject.course_code}
                  onChange={(e) => setNewProject({ ...newProject, course_code: e.target.value })}
                  placeholder="E.g. CS101"
                  className="w-full p-4 bg-[#1A1A2E] border border-gray-700/50 rounded-xl text-gray-300 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold text-sm mb-3 uppercase">Course Name</label>
                <input
                  type="text"
                  list="course-options"
                  value={newProject.course_name}
                  onChange={(e) => setNewProject({ ...newProject, course_name: e.target.value })}
                  placeholder="Select or type a course..."
                  className="w-full p-4 bg-[#1A1A2E] border border-gray-700/50 rounded-xl text-gray-300 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-600"
                />
                <datalist id="course-options">
                  <option value="Introduction to Programming" />
                  <option value="Object Oriented Programming" />
                  <option value="Information Security and Forensics" />
                  <option value="Web Engineering" />
                  <option value="Blockchain" />
                  <option value="Mobile Application and Development" />
                  <option value="Database" />
                  <option value="Data Structures" />
                  <option value="Software Engineering" />
                  <option value="Software Requirement Engineering" />
                </datalist>
              </div>

              <div>
                <label className="block text-gray-300 font-bold text-sm mb-3 uppercase">Project Name</label>
                <input
                  type="text"
                  value={newProject.project_name}
                  onChange={(e) => setNewProject({ ...newProject, project_name: e.target.value })}
                  placeholder="E.g. E-Commerce Store"
                  className="w-full p-4 bg-[#1A1A2E] border border-gray-700/50 rounded-xl text-gray-300 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold text-sm mb-3 uppercase">Languages</label>
                <input
                  type="text"
                  list="language-options"
                  value={newProject.languages}
                  onChange={(e) => setNewProject({ ...newProject, languages: e.target.value })}
                  placeholder="E.g. JavaScript, Python"
                  className="w-full p-4 bg-[#1A1A2E] border border-gray-700/50 rounded-xl text-gray-300 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-600"
                />
                <datalist id="language-options">
                  <option value="C" />
                  <option value="C++" />
                  <option value="Python" />
                  <option value="Java" />
                  <option value="JavaScript" />
                  <option value="Rust" />
                  <option value="Go" />
                </datalist>
              </div>

              <div>
                <label className="block text-gray-300 font-bold text-sm mb-3 uppercase">Frontend Frameworks</label>
                <input
                  type="text"
                  list="frontend-options"
                  value={newProject.frontend_frameworks}
                  onChange={(e) => setNewProject({ ...newProject, frontend_frameworks: e.target.value })}
                  placeholder="E.g. React, Vue (Optional)"
                  className="w-full p-4 bg-[#1A1A2E] border border-gray-700/50 rounded-xl text-gray-300 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-600"
                />
                <datalist id="frontend-options">
                  <option value="React" />
                  <option value="Vue" />
                  <option value="Angular" />
                  <option value="Svelte" />
                  <option value="Next.js" />
                  <option value="HTML/CSS" />
                  <option value="Tailwind CSS" />
                  <option value="Bootstrap" />
                </datalist>
              </div>

              <div>
                <label className="block text-gray-300 font-bold text-sm mb-3 uppercase">Backend Frameworks</label>
                <input
                  type="text"
                  list="backend-options"
                  value={newProject.backend_frameworks}
                  onChange={(e) => setNewProject({ ...newProject, backend_frameworks: e.target.value })}
                  placeholder="E.g. Node.js, Express (Optional)"
                  className="w-full p-4 bg-[#1A1A2E] border border-gray-700/50 rounded-xl text-gray-300 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-600"
                />
                <datalist id="backend-options">
                  <option value="Node.js" />
                  <option value="Express" />
                  <option value="Django" />
                  <option value="Flask" />
                  <option value="Spring Boot" />
                  <option value="Laravel" />
                  <option value=".NET" />
                </datalist>
              </div>

            </div>

            <div>
              <label className="block text-gray-300 font-bold text-sm mb-3 uppercase">Description (What was it about?)</label>
              <textarea
                value={newProject.project_description}
                onChange={(e) => setNewProject({ ...newProject, project_description: e.target.value })}
                placeholder="A brief description of your project..."
                className="w-full p-4 bg-[#1A1A2E] border border-gray-700/50 rounded-xl text-gray-300 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-600 min-h-[100px]"
              />
            </div>

            <button
              onClick={handleAddProject}
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-xl font-bold text-white uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-lg shadow-pink-500/20"
            >
              {loading ? 'SAVING...' : '+ ADD PROJECT RECORD'}
            </button>
          </div>

          <div className="bg-[#242444] p-8 rounded-2xl shadow-2xl border border-white/5 min-h-[400px]">
            <h3 className="text-xl font-bold mb-8 text-white uppercase tracking-widest">Saved Project Records</h3>

            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-6 grayscale opacity-20">📁</div>    
                <h2 className="text-2xl font-bold text-white mb-2 uppercase italic opacity-20 tracking-tighter">No Records Found</h2>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Start adding your semester projects to see them listed here and generate AI ideas!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="bg-[#1A1A2E] border border-white/5 p-4 rounded-xl flex justify-between items-center group hover:border-cyan-500/30 transition-all gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">Sem {proj.semester_number}</span>
                        <h4 className="text-white font-bold text-base truncate">{proj.course_name} — {proj.project_name}</h4>
                      </div>
                      <div className="text-sm truncate">
                        <span className="text-gray-300 font-medium">Stack:</span> <span className="text-cyan-400/80">{[proj.languages, proj.frontend_frameworks, proj.backend_frameworks].filter(Boolean).join(', ') || 'Not specified'}</span>
                        <span className="text-gray-600 mx-2">|</span> 
                        <span className="text-gray-400 italic truncate">{proj.project_description || 'No description provided.'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeProject(proj.id)}
                      className="text-red-500/50 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SemesterRecords;
