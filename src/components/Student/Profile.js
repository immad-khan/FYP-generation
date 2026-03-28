import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { studentAPI } from '../../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    reg_number: user?.profile?.reg_number || 'STU-12345',
    department: user?.profile?.department || 'Computer Science',
    current_semester: user?.profile?.current_semester || '7',
    cgpa: user?.profile?.cgpa || '3.5',
    major: user?.profile?.major || 'Software Engineering',
    area_of_interest: user?.profile?.area_of_interest || 'Machine Learning, Web Development'
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Logic to update profile via API
      await studentAPI.updateProfile(user.id, {
        department: profileData.department,
        cgpa: profileData.cgpa,
        current_semester: profileData.current_semester,
        area_of_interest: profileData.area_of_interest,
        major: profileData.major,
        reg_number: profileData.reg_number
      });
      
      // Also update the global user Context
      updateUser({
        ...user,
        name: profileData.name,
        profile: {
          ...user.profile,
          ...profileData
        }
      });
      
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#1A1A2E]">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-10 text-white overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">User Profile</h1>
          <p className="text-gray-400 text-lg font-medium">Manage your personal and academic information.</p>
        </header>

        <div className="max-w-4xl">
          <div className="bg-[#242444] rounded-3xl shadow-2xl border border-white/5 overflow-hidden">
            {/* Cover Header */}
            <div className="h-32 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 border-b border-white/5 flex items-end p-8">
               <div className="bg-[#1A1A2E] p-1 rounded-2xl border border-white/10 -mb-16 shadow-xl">
                  <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-cyan-500 rounded-xl flex items-center justify-center text-3xl font-bold">
                    {profileData.name.charAt(0)}
                  </div>
               </div>
            </div>

            <div className="p-8 pt-20">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-2xl font-bold text-white">{profileData.name}</h2>
                  <p className="text-cyan-400 font-medium">{profileData.reg_number}</p>
                </div>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm transition-all"
                >
                  {isEditing ? 'CANCEL' : 'EDIT PROFILE'}
                </button>
              </div>

              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Full Name</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full p-4 bg-[#1A1A2E] border border-white/5 rounded-xl text-gray-300 focus:border-pink-500/50 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={profileData.email}
                      className="w-full p-4 bg-[#1A1A2E] border border-white/5 rounded-xl text-gray-500 cursor-not-allowed outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Department</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={profileData.department}
                      onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                      className="w-full p-4 bg-[#1A1A2E] border border-white/5 rounded-xl text-gray-300 focus:border-pink-500/50 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Current Semester</label>
                    <select
                      disabled={!isEditing}
                      value={profileData.current_semester}
                      onChange={(e) => setProfileData({...profileData, current_semester: e.target.value})}
                      className="w-full p-4 bg-[#1A1A2E] border border-white/5 rounded-xl text-gray-300 focus:border-pink-500/50 outline-none transition-all disabled:opacity-50 appearance-none"
                    >
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      disabled={!isEditing}
                      value={profileData.cgpa}
                      onChange={(e) => setProfileData({...profileData, cgpa: e.target.value})}
                      className="w-full p-4 bg-[#1A1A2E] border border-white/5 rounded-xl text-gray-300 focus:border-pink-500/50 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Major Area</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={profileData.major}
                      onChange={(e) => setProfileData({...profileData, major: e.target.value})}
                      className="w-full p-4 bg-[#1A1A2E] border border-white/5 rounded-xl text-gray-300 focus:border-pink-500/50 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Area of Interest</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={profileData.area_of_interest}
                      onChange={(e) => setProfileData({...profileData, area_of_interest: e.target.value})}
                      className="w-full p-4 bg-[#1A1A2E] border border-white/5 rounded-xl text-gray-300 focus:border-pink-500/50 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="md:col-span-2 pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-4 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-xl font-bold text-white uppercase tracking-wider hover:opacity-90 transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
