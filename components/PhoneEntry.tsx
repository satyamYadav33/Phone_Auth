
import React, { useState } from 'react';
import { SUPPORTED_COUNTRIES } from '../constants';
import { sendOtp } from '../services/authService';

interface PhoneEntryProps {
  onSuccess: (phone: string) => void;
  onBack: () => void;
}

const PhoneEntry: React.FC<PhoneEntryProps> = ({ onSuccess, onBack }) => {
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(SUPPORTED_COUNTRIES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setPhone(val);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 7) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    const fullPhone = `${selectedCountry.dialCode}${phone}`;
    try {
      const success = await sendOtp(fullPhone);
      if (success) {
        onSuccess(fullPhone);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 animate-slide-in">
      <button onClick={onBack} className="mb-6 p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your number?</h2>
      <p className="text-gray-500 mb-8">We'll text you a code to verify your account.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2">
          {/* Country Selector */}
          <div className="relative">
            <select
              value={selectedCountry.code}
              onChange={(e) => setSelectedCountry(SUPPORTED_COUNTRIES.find(c => c.code === e.target.value) || SUPPORTED_COUNTRIES[0])}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pr-10 text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.dialCode}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Number Input */}
          <div className="flex-1">
            <input
              type="tel"
              placeholder="555 0123"
              value={phone}
              onChange={handlePhoneChange}
              autoFocus
              className={`w-full bg-gray-50 border ${error ? 'border-red-300' : 'border-gray-200'} rounded-xl px-5 py-4 text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

        <p className="text-xs text-gray-400 leading-relaxed">
          By continuing, you agree to receive an SMS for verification. Message & data rates may apply.
        </p>

        <button
          type="submit"
          disabled={isLoading || phone.length < 7}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              Continue
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PhoneEntry;
