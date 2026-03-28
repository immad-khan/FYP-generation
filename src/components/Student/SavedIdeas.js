import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentAPI } from '../../services/api';
import Sidebar from './Sidebar';

const SavedIdeas = () => {
  const { user } = useAuth();
  
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    difficulty: ''
  });

  useEffect(() => {
    fetchSavedIdeas();
  }, []);

  const fetchSavedIdeas = async () => {
    try {
      setLoading(true);
      const ideas = await studentAPI.getSavedIdeas(user.id);
      console.log('📚 Fetched saved ideas:', ideas);
      // Ensure it's always an array
      setSavedIdeas(Array.isArray(ideas) ? ideas : []);
    } catch (error) {
      console.error('Error fetching saved ideas:', error);
      setSavedIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredIdeas = (Array.isArray(savedIdeas) ? savedIdeas : []).filter(idea => {
    const matchesSearch = !searchQuery || 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = !filters.difficulty || idea.difficulty === filters.difficulty;
    
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#1A1A2E]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
           <div className="w-10 h-10 border-4 border-t-pink-500 border-white/20 rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#1A1A2E]">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-10 text-white overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold font-['Armand_Nicolet','Inter',sans-serif] tracking-tight uppercase mb-2">Saved Ideas</h1>
          <p className="text-gray-400 text-lg">Manage your curated collection of FYP concepts.</p>
        </header>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input 
              type="text"
              placeholder="Search your collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#242444] border border-white/5 rounded-2xl py-4 px-6 text-white focus:border-cyan-500 outline-none transition-all"
            />
          </div>
          <select 
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            className="bg-[#242444] border border-white/5 rounded-2xl px-6 py-4 text-gray-300 outline-none focus:border-cyan-500"
          >
            <option value="">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {filteredIdeas.length === 0 ? (
          <div className="bg-[#242444] rounded-3xl p-20 text-center border border-dashed border-white/10">
            <h2 className="text-xl font-bold text-gray-500 uppercase tracking-widest italic font-['Armand_Nicolet']">No Saved Ideas Found</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredIdeas.map((idea) => (
              <div key={idea.id} className="bg-[#242444] p-6 rounded-3xl border border-white/5 hover:border-pink-500/30 transition-all group shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Difficulty Badge */}
                    <span className="text-[10px] font-bold opacity-5 group-hover:opacity-10 transition-opacity uppercase">
                      {idea.difficulty}
                    </span>
                  </div>
                  {idea.status && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                      idea.status === 'Approved' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 
                      idea.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                    }`}>
                      {idea.status}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 pr-10 font-['Armand_Nicolet'] mt-10">{idea.title}</h3>
                
                <p className="text-gray-400 text-sm mb-6 leading-relaxed bg-[#1A1A2E]/50 p-4 rounded-2xl border border-white/5 italic">
                  {idea.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                   {(() => {
                     const techList = idea.technologies || (typeof idea.tags === 'string' ? idea.tags.split(',') : idea.tags) || [];
                     return (Array.isArray(techList) ? techList : []).map((tech, i) => (
                       <span key={i} className="text-[10px] font-bold text-cyan-400/80 bg-cyan-500/5 px-3 py-1 rounded-lg border border-cyan-500/10">#{typeof tech === 'string' ? tech.trim() : tech}</span>
                     ));
                   })()}
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                   <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Added: {new Date(idea.saved_at || idea.savedAt).toLocaleDateString()}</span>
                   <button className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest transition-colors py-1 px-3 bg-red-500/10 rounded-lg">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedIdeas;
