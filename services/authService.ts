
import { User, Activity } from '../types';

const createActivity = (type: Activity['type'], details: string): Activity => ({
  id: Math.random().toString(36).substr(2, 9),
  type,
  timestamp: new Date().toISOString(),
  details,
});

// Mock database
const MOCK_USERS: Record<string, User> = {
  '+15550123456': {
    phoneNumber: '+15550123456',
    firstName: 'Alex',
    lastName: 'Chen',
    email: 'alex@example.com',
    isNewUser: false,
    twoFactorEnabled: false,
    recentActivity: [
      createActivity('LOGIN', 'Logged in from Chrome on MacOS'),
      createActivity('SECURITY_CHANGE', 'Phone number verified'),
    ]
  }
};

let currentOtp: string | null = null;
let otpTimestamp: number = 0;

export const sendOtp = async (phoneNumber: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  currentOtp = Math.floor(100000 + Math.random() * 900000).toString();
  otpTimestamp = Date.now();
  console.log(`[MOCK SMS] To: ${phoneNumber} | Code: ${currentOtp}`);
  return true;
};

export const verifyOtp = async (phoneNumber: string, code: string): Promise<{ success: boolean; user?: User }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (code !== currentOtp) return { success: false };
  if (Date.now() - otpTimestamp > 300000) return { success: false };

  const existingUser = MOCK_USERS[phoneNumber];
  if (existingUser) {
    existingUser.recentActivity.unshift(createActivity('LOGIN', 'New login session started'));
    return { success: true, user: { ...existingUser, isNewUser: false } };
  }

  return { 
    success: true, 
    user: { 
      phoneNumber, 
      isNewUser: true, 
      twoFactorEnabled: false, 
      recentActivity: [createActivity('SECURITY_CHANGE', 'Account created via SMS')] 
    } 
  };
};

export const completeProfile = async (phoneNumber: string, profile: Partial<User>): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newUser: User = {
    phoneNumber,
    firstName: profile.firstName || 'Guest',
    lastName: profile.lastName || '',
    email: profile.email,
    isNewUser: false,
    twoFactorEnabled: false,
    recentActivity: [
      createActivity('PROFILE_UPDATE', 'Completed initial profile setup'),
      createActivity('SECURITY_CHANGE', 'SMS verification linked')
    ]
  };
  MOCK_USERS[phoneNumber] = newUser;
  return newUser;
};

export const updateSecuritySetting = async (phoneNumber: string, update: Partial<User>): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const user = MOCK_USERS[phoneNumber];
  if (update.twoFactorEnabled !== undefined) {
    user.twoFactorEnabled = update.twoFactorEnabled;
    user.recentActivity.unshift(createActivity('MFA_ENABLED', update.twoFactorEnabled ? '2FA Protection enabled' : '2FA disabled'));
  }
  if (update.email !== undefined) {
    user.email = update.email;
    user.recentActivity.unshift(createActivity('EMAIL_ADDED', `Backup email set to ${update.email}`));
  }
  return { ...user };
};
