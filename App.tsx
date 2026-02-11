
import React, { useState, useCallback } from 'react';
import { AuthStep, AuthState, User } from './types';
import PhoneEntry from './components/PhoneEntry';
import OtpVerification from './components/OtpVerification';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import EntryScreen from './components/EntryScreen';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    step: AuthStep.ENTRY,
    phoneNumber: '',
    isLoading: false
  });

  const handleStartPhoneAuth = () => {
    setAuthState(prev => ({ ...prev, step: AuthStep.PHONE_ENTRY }));
  };

  const handlePhoneSubmitted = (phoneNumber: string) => {
    setAuthState(prev => ({ 
      ...prev, 
      phoneNumber, 
      step: AuthStep.OTP_VERIFICATION 
    }));
  };

  const handleOtpVerified = (user: User) => {
    if (user.isNewUser) {
      setAuthState(prev => ({ 
        ...prev, 
        user, 
        step: AuthStep.PROFILE_SETUP 
      }));
    } else {
      setAuthState(prev => ({ 
        ...prev, 
        user, 
        step: AuthStep.DASHBOARD 
      }));
    }
  };

  const handleProfileCompleted = (user: User) => {
    setAuthState(prev => ({ 
      ...prev, 
      user, 
      step: AuthStep.DASHBOARD 
    }));
  };

  const handleLogout = () => {
    setAuthState({
      step: AuthStep.ENTRY,
      phoneNumber: '',
      isLoading: false
    });
  };

  const renderStep = () => {
    switch (authState.step) {
      case AuthStep.ENTRY:
        return <EntryScreen onContinue={handleStartPhoneAuth} />;
      case AuthStep.PHONE_ENTRY:
        return <PhoneEntry onBack={() => setAuthState(prev => ({ ...prev, step: AuthStep.ENTRY }))} onSuccess={handlePhoneSubmitted} />;
      case AuthStep.OTP_VERIFICATION:
        return (
          <OtpVerification 
            phoneNumber={authState.phoneNumber} 
            onSuccess={handleOtpVerified} 
            onBack={() => setAuthState(prev => ({ ...prev, step: AuthStep.PHONE_ENTRY }))}
          />
        );
      case AuthStep.PROFILE_SETUP:
        return <ProfileSetup phoneNumber={authState.phoneNumber} onSuccess={handleProfileCompleted} />;
      case AuthStep.DASHBOARD:
        return <Dashboard user={authState.user!} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-500">
        {renderStep()}
      </div>
      
      {/* Footer Branding */}
      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>&copy; 2024 PhoneAuth Pro. Secure & Passwordless.</p>
      </div>
    </div>
  );
};

export default App;
