
import React, { useState } from 'react';
import { User } from '../types';
import { completeProfile } from '../services/authService';

interface ProfileSetupProps {
  phoneNumber: string;
  onSuccess: (user: User) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ phoneNumber, onSuccess }) => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const user = await completeProfile(phoneNumber, formData);
    onSuccess(user);
  };

  return (
    <div className="p-8 animate-slide-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost there!</h2>
      <p className="text-gray-500 mb-8">We just need a few details to set up your account.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">First Name</label>
            <input
              required
              type="text"
              placeholder="Jane"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.firstName}
              onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Last Name</label>
            <input
              required
              type="text"
              placeholder="Doe"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.lastName}
              onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Email (Optional)</label>
          <input
            type="email"
            placeholder="jane@example.com"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all"
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
          <p className="text-xs text-gray-400">Used for backup account access.</p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.firstName || !formData.lastName}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Complete Setup'
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
