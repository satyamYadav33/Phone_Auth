
import React, { useEffect, useState } from 'react';
import { User, Activity } from '../types';
import { getSecurityInsight } from '../services/geminiService';
import { updateSecuritySetting } from '../services/authService';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user: initialUser, onLogout }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'security'>('overview');
  const [securityTip, setSecurityTip] = useState<string | null>(null);
  const [isTipLoading, setIsTipLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    const fetchTip = async () => {
      setIsTipLoading(true);
      const tip = await getSecurityInsight(user.isNewUser, user.firstName || 'there', user.recentActivity, user.twoFactorEnabled);
      setSecurityTip(tip);
      setIsTipLoading(false);
    };
    fetchTip();
  }, [user.twoFactorEnabled, user.email]);

  const toggle2FA = async () => {
    setIsUpdating(true);
    const updatedUser = await updateSecuritySetting(user.phoneNumber, { twoFactorEnabled: !user.twoFactorEnabled });
    setUser(updatedUser);
    setIsUpdating(false);
  };

  const handleAddEmail = async () => {
    if (!newEmail.includes('@')) return;
    setIsUpdating(true);
    const updatedUser = await updateSecuritySetting(user.phoneNumber, { email: newEmail });
    setUser(updatedUser);
    setIsUpdating(false);
    setShowEmailModal(false);
    setNewEmail('');
  };

  const ActivityIcon = ({ type }: { type: Activity['type'] }) => {
    switch (type) {
      case 'LOGIN': return <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg></div>;
      case 'SECURITY_CHANGE': return <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>;
      case 'EMAIL_ADDED': return <div className="p-2 bg-green-100 text-green-600 rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>;
      default: return <div className="p-2 bg-gray-100 text-gray-600 rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
    }
  };

  return (
    <div className="flex flex-col h-[600px] animate-slide-in relative">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
              {user.firstName?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-none">Hi, {user.firstName}!</h2>
              <p className="text-xs text-green-500 font-medium mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Secure Session
              </p>
            </div>
          </div>
          <button onClick={onLogout} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-6">
          {(['overview', 'activity', 'security'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-semibold capitalize transition-all border-b-2 ${
                activeTab === tab ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-slide-in">
            {/* AI Security Tip Card */}
            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3">
                <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg animate-bounce">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                </div>
              </div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Smart Assistant</p>
              {isTipLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
                </div>
              ) : (
                <p className="text-gray-700 font-medium leading-relaxed italic">"{securityTip}"</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Status</p>
                <div className={`text-sm font-bold ${user.twoFactorEnabled ? 'text-green-600' : 'text-yellow-600'}`}>
                  {user.twoFactorEnabled ? '2FA Enabled' : 'Basic SMS Auth'}
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Activity</p>
                <div className="text-sm font-bold text-gray-900">{user.recentActivity.length} Events Logged</div>
              </div>
            </div>

            {/* Profile Glance */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Phone</span>
                <span className="font-semibold">{user.phoneNumber}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Backup Email</span>
                <span className={`font-semibold ${user.email ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                  {user.email || 'Not added'}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4 animate-slide-in">
            {user.recentActivity.map((activity) => (
              <div key={activity.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
                <ActivityIcon type={activity.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{activity.details}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6 animate-slide-in">
            {/* 2FA Toggle */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Two-Factor Auth</h3>
                    <p className="text-xs text-gray-400">TOTP or Security Key</p>
                  </div>
                </div>
                <button
                  onClick={toggle2FA}
                  disabled={isUpdating}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${user.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Add an extra layer of security by requiring a second factor to log in.
              </p>
            </div>

            {/* Email Setting */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Backup Email</h3>
                    <p className="text-xs text-gray-400">{user.email || 'Protect your access'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="text-blue-600 text-sm font-bold hover:underline"
                >
                  {user.email ? 'Change' : 'Set Up'}
                </button>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                If you lose your phone number, your backup email will be used to recover your account.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Backup Email Modal */}
      {showEmailModal && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-slide-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Backup Email</h3>
            <p className="text-sm text-gray-500 mb-6">Enter your email address to secure your account recovery flow.</p>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="name@example.com"
              autoFocus
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmail}
                disabled={!newEmail.includes('@') || isUpdating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all"
              >
                {isUpdating ? 'Saving...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
