import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    ideaAlerts: true,
    deadlineReminders: true
  });
  const [saveStatus, setSaveStatus] = useState('');

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (setting) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSaveStatus('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setSaveStatus('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setSaveStatus('Updating password...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('Error updating password');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAccountDeletion = () => {
    if (window.confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.')) {
      console.log('Account deletion requested');
      logout();
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#12042B] to-[#2A004E]">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-10">
        <header className="mb-8 md:mb-10 pb-4 border-b border-pink-500/50">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF00C8] to-[#00FFF0]">
              AI FYP
            </span> Idea Generator
          </h1>
          <p className="text-gray-300 text-lg">Your Final Year Project starts here.</p>
        </header>

        <div className="max-w-4xl">
          <h2 className="text-3xl font-semibold text-purple-400 mb-8">Settings</h2>
          
          <div className="flex border-b border-gray-700 mb-8">
            <button
              onClick={() => setActiveTab('account')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'account'
                  ? 'text-cyan-300 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Account
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'notifications'
                  ? 'text-cyan-300 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'privacy'
                  ? 'text-cyan-300 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Privacy
            </button>
          </div>

          {activeTab === 'account' && (
            <div className="space-y-8">
              <div className="bg-[#161625] p-8 rounded-xl border border-[#00FFF0]/10">
                <h3 className="text-2xl font-semibold text-pink-300 mb-6">Account Security</h3>
                
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full p-3 bg-[#161625] border border-[#7F5CFF]/30 rounded-lg text-white focus:border-[#00FFF0] focus:outline-none"
                      placeholder="Enter current password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="8"
                      className="w-full p-3 bg-[#161625] border border-[#7F5CFF]/30 rounded-lg text-white focus:border-[#00FFF0] focus:outline-none"
                      placeholder="At least 8 characters"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full p-3 bg-[#161625] border border-[#7F5CFF]/30 rounded-lg text-white focus:border-[#00FFF0] focus:outline-none"
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-cyan-600 text-white font-semibold hover:opacity-90 transition"
                  >
                    Update Password
                  </button>
                  
                  {saveStatus && (
                    <p className={`mt-2 text-sm font-medium ${
                      saveStatus.includes('success') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {saveStatus}
                    </p>
                  )}
                </form>
              </div>

              <div className="bg-[#161625] p-8 rounded-xl border border-[#00FFF0]/10">
                <h3 className="text-2xl font-semibold text-red-400 mb-4">Danger Zone</h3>
                <p className="text-gray-400 mb-6">These actions are irreversible. Please proceed with caution.</p>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-red-900/20 border border-red-700/30">
                    <h4 className="text-lg font-semibold text-red-300 mb-2">Delete Account</h4>
                    <p className="text-gray-400 mb-4 text-sm">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleAccountDeletion}
                      className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
                    >
                      Delete My Account
                    </button>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-700/30">
                    <h4 className="text-lg font-semibold text-yellow-300 mb-2">Export Data</h4>
                    <p className="text-gray-400 mb-4 text-sm">
                      Download all your submitted ideas and profile data in JSON format.
                    </p>
                    <button className="px-6 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-medium transition">
                      Export All Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-[#161625] p-8 rounded-xl border border-[#00FFF0]/10">
              <h3 className="text-2xl font-semibold text-pink-300 mb-6">Notification Preferences</h3>
              
              <div className="space-y-6">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-[#2A004E] hover:bg-[#2A004E]/80 transition">
                    <div>
                      <h4 className="font-medium text-white capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {key === 'emailUpdates' && 'Receive weekly email updates with new FYP ideas'}
                        {key === 'ideaAlerts' && 'Get alerts when new ideas match your interests'}
                        {key === 'deadlineReminders' && 'Reminders for project deadlines and milestones'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        value ? 'bg-cyan-600' : 'bg-gray-600'
                      } transition-colors`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
                
                <div className="pt-6 border-t border-gray-700">
                  <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:opacity-90 transition">
                    Save Notification Settings
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'privacy' && (
            <div className="bg-[#161625] p-8 rounded-xl border border-[#00FFF0]/10">
              <h3 className="text-2xl font-semibold text-pink-300 mb-6">Privacy Settings</h3>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-[#2A004E]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">Profile Visibility</h4>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-600/30 text-green-300">
                      Public
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Control who can see your profile and submitted ideas. Public allows faculty to view your profile.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-[#2A004E]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">Data Sharing</h4>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-600/30 text-yellow-300">
                      Limited
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Allow anonymous usage data to improve the AI model (no personal information shared).
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-[#2A004E]">
                  <h4 className="font-medium text-white mb-2">Cookie Preferences</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    We use cookies to enhance your experience. You can manage your cookie preferences here.
                  </p>
                  <button className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium text-sm transition">
                    Manage Cookies
                  </button>
                </div>
                
                <div className="pt-6 border-t border-gray-700">
                  <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold hover:opacity-90 transition">
                    Save Privacy Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 bg-[#161625] p-8 rounded-xl border border-[#00FFF0]/10 text-center">
            <h3 className="text-2xl font-semibold text-cyan-300 mb-4">Session Management</h3>
            <p className="text-gray-400 mb-6">Click below to securely sign out of the system on all devices.</p>
            <button
              onClick={handleLogout}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold hover:opacity-90 transition"
            >
              <i className="fas fa-sign-out-alt mr-2"></i> Secure Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;