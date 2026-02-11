
export enum AuthStep {
  ENTRY = 'ENTRY',
  PHONE_ENTRY = 'PHONE_ENTRY',
  OTP_VERIFICATION = 'OTP_VERIFICATION',
  PROFILE_SETUP = 'PROFILE_SETUP',
  DASHBOARD = 'DASHBOARD'
}

export interface Activity {
  id: string;
  type: 'LOGIN' | 'PROFILE_UPDATE' | 'SECURITY_CHANGE' | 'EMAIL_ADDED' | 'MFA_ENABLED';
  timestamp: string;
  details: string;
}

export interface User {
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isNewUser: boolean;
  twoFactorEnabled: boolean;
  recentActivity: Activity[];
}

export interface AuthState {
  step: AuthStep;
  phoneNumber: string;
  user?: User;
  error?: string;
  isLoading: boolean;
}

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}
