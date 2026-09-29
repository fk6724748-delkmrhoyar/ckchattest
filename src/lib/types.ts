export interface UserProfile {
  uid: string;
  email: string;
  phone?: string;
  username: string;
  displayName: string;
  photoURL: string;
  bio?: string;
  myStatus?: string;
  myStatusTime?: number;
  myStatusViews?: string[];
  createdAt: number;
  lastSeen: number;
  isOnline?: boolean;
  isAdmin?: boolean;
  isBanned?: boolean;
  isVerified?: boolean;
  password?: string;
  blocked?: string[];        // UIDs this user has blocked
  wallpaper?: string;        // chat background (data url or css color)
  otpCode?: string;          // last OTP sent (demo / smtp)
  otpVerified?: boolean;
  groupInviteApproval?: boolean; // if true, adding to a group requires approval
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name: string; // empty if direct
  avatarUrl?: string;
  members: string[]; // UIDs
  admins?: string[]; // UIDs of group admins
  onlyAdminsMessage?: boolean; // if true, only admins can send messages
  onlyAdminsEditInfo?: boolean; // if true, only admins can edit group info
  description?: string;
  createdAt: number;
  createdBy: string;
  recentMessage?: {
    text: string;
    createdAt: number;
  };
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'audio' | 'file' | 'none';
  fileName?: string;
  fileSize?: number;
  createdAt: number;
  status?: MessageStatus;
  starred?: boolean;
  replyToId?: string;
  forwarded?: boolean;
  isSystem?: boolean;
  reactions?: Record<string, string>; // uid -> emoji
  deletedFor?: string[]; // uids who deleted this message "for me"
  deletedForEveryone?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  username?: string;
  about?: string;
  avatarUrl?: string;
  ownerId: string;
  followers: string[];
  isVerified?: boolean;
  createdAt: number;
}

export interface ChannelPost {
  id: string;
  channelId: string;
  text: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'none';
  createdAt: number;
  views: string[];
  reactions?: Record<string, string>; // uid -> emoji
}

export type CallType = 'voice' | 'video';
export type CallStatus = 'ringing' | 'answered' | 'missed' | 'ended' | 'declined';

export interface CallLog {
  id: string;
  callerId: string;
  calleeId: string;
  type: CallType;
  status: CallStatus;
  createdAt: number;
  duration: number; // seconds
}

export interface VerifyRequest {
  id: string;
  userId: string;
  targetType: 'user' | 'channel';
  targetName: string;
  email: string;
  method: string;
  trxId: string;
  screenshot?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export interface SmtpSettings {
  host: string;
  port: string;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  secure: boolean;
  enabled: boolean;
}

export interface SystemSettings {
  isInstalled: boolean;
  chatEnabled: boolean;
  disabledMessage: string;
  appName?: string;
  otpEnabled?: boolean;
  callsEnabled?: boolean;
  channelsEnabled?: boolean;
  statusExpiryHours?: number;
  verifyPrice?: string;
  easypaisa?: string;
  jazzcash?: string;
  binance?: string;
  smtp?: SmtpSettings;
}

export interface GroupInvite {
  id: string;
  chatId: string;
  userId: string; // invited user
  invitedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'user' | 'message' | 'channelPost' | 'groupPost';
  targetId: string;
  reason: string;
  createdAt: number;
  status: 'pending' | 'reviewed';
}
