import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { studentAPI } from '../../services/api';

const SemesterRecords = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(user?.profile?.current_semester || '7');

  const [newSubject, setNewSubject] = useState({
    course_name: '',
    credits: '3',
    grade: 'A'
  });

  const handleAddSubject = () => {
    if (!newSubject.course_name) return;
    setSubjects([...subjects, { ...newSubject, id: Date.now() }]);
    setNewSubject({ course_name: '', credits: '3', grade: 'A' });
  };

  const removeSubject = (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-[#1A1A2E]">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-10 text-white overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Semester Records
          </h1>
          <p className="text-gray-400 text-lg font-medium">Add your academic achievements and calculate CGPA.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          <div className="bg-[#242444] p-8 rounded-2xl shadow-2xl border border-white/5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-300 font-bold text-sm mb-3 uppercase">Course / Subject Name</label>
                <input
                  type="text"
                  value={newSubject.course_name}
                  onChange={(e) => setNewSubject({ ...newSubject, course_name: e.target.value })}
                  placeholder="E.g. Database Systems"
                  className="w-full p-4 bg-[#1A1A2E] border border-gray-700/50 rounded-xl text-gray-300 focus:border-purple-500 outline-none transition-all placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold text-sm mb-3 uppercase">Credit Hours</label>
                <select
                  value={newSubject.credits}
                  onChange={(e) => setNewSubject({ ...newSubject, credits: e.target.value })}
                  className="w-full p-4 bg-[#1A1A2E] border border-gray-700/50 rounded-xl text-gray-300 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="1">1 Credit</option>
                  <option value="2">2 Credits</option>
                  <option value="3">3 Credits</option>
                  <option value="4">4 Credits</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-bold text-sm mb-3 uppercase">Grade Point (G.P)</label>
                <select 
                  value={newSubject.grade}
                  onChange={(e) => setNewSubject({ ...newSubject, grade: e.target.value })}
                  className="w-full p-4 bg-[#1A1A2E] border border-gray-700/50 rounded-xl text-gray-300 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="A">A (4.0)</option>
                  <option value="A-">A- (3.7)</option>
                  <option value="B+">B+ (3.3)</option>
                  <option value="B">B (3.0)</option>
                  <option value="B-">B- (2.7)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAddSubject}
              className="w-full py-5 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-xl font-bold text-white uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-lg shadow-pink-500/20"
            >
              <h1 className="text-xl">+</h1> ADD SUBJECT TO RECORD
            </button>
          </div>

          <div className="bg-[#242444] p-8 rounded-2xl shadow-2xl border border-white/5 min-h-[400px]">
            <h3 className="text-xl font-bold mb-8 text-white uppercase tracking-widest">Selected Semester Records</h3>
            
            {subjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-6 grayscale opacity-20">??</div>
                <h2 className="text-2xl font-bold text-white mb-2 uppercase italic opacity-20 tracking-tighter">No Records Found</h2>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Start adding your subjects for the current semester to See them listed here.
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-widest font-bold">
                    <th className="pb-4 pt-1 px-4">Subject</th>
                    <th className="pb-4 pt-1 px-4">Credits</th>
                    <th className="pb-4 pt-1 px-4">Grade</th>
                    <th className="pb-4 pt-1 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 font-bold text-gray-300">{subject.course_name}</td>
                      <td className="py-4 px-4 text-purple-400 font-bold">{subject.credits} CH</td>
                      <td className="py-4 px-4"><span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-lg text-xs font-bold">{subject.grade}</span></td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => removeSubject(subject.id)}
                          className="text-red-500/50 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          ?
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SemesterRecords;
