
import React, { useState, useEffect, useRef } from 'react';
import { OTP_LENGTH, RESEND_COOLDOWN } from '../constants';
import { verifyOtp, sendOtp } from '../services/authService';
import { User } from '../types';

interface OtpVerificationProps {
  phoneNumber: string;
  onSuccess: (user: User) => void;
  onBack: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ phoneNumber, onSuccess, onBack }) => {
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if full
    if (newOtp.every(char => char !== '') && !newOtp.includes('')) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (code: string) => {
    setIsLoading(true);
    try {
      const { success, user } = await verifyOtp(phoneNumber, code);
      if (success && user) {
        onSuccess(user);
      } else {
        setError('That code didn’t work. Try again.');
        setOtp(new Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Verification failed. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setIsLoading(true);
    await sendOtp(phoneNumber);
    setTimer(RESEND_COOLDOWN);
    setIsLoading(false);
  };

  return (
    <div className="p-8 animate-slide-in">
      <button onClick={onBack} className="mb-6 p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify phone</h2>
      <p className="text-gray-500 mb-8 leading-relaxed">
        Enter the 6-digit code sent to <span className="font-semibold text-gray-900">{phoneNumber}</span>
      </p>

      <div className="space-y-8">
        <div className="flex justify-between gap-2">
          {otp.map((char, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el!}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={char}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              autoFocus={i === 0}
              className={`w-full h-14 border-2 rounded-xl text-center text-2xl font-bold focus:ring-4 focus:ring-blue-100 transition-all ${
                error ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-100 bg-gray-50 text-gray-900 focus:border-blue-500'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="text-center space-y-4">
          <p className="text-gray-400 text-sm">
            Didn't receive the code?{' '}
            {timer > 0 ? (
              <span className="text-gray-500 font-medium">Wait {timer}s</span>
            ) : (
              <button 
                onClick={handleResend}
                className="text-blue-600 font-bold hover:underline"
              >
                Resend SMS
              </button>
            )}
          </p>

          <div className="flex justify-center">
            {isLoading && (
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
