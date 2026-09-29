import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Chat,
  Message,
  UserProfile,
  SystemSettings,
  Channel,
  ChannelPost,
  CallLog,
  CallType,
  CallStatus,
  VerifyRequest,
  SmtpSettings,
  GroupInvite,
  Report,
} from './types';

export const ONLINE_WINDOW = 60 * 1000; // user counts as online for 60s after last ping

export const isUserOnline = (u?: UserProfile | null) =>
  !!u && !!u.isOnline && Date.now() - (u.lastSeen || 0) < ONLINE_WINDOW;

interface ActiveCall {
  id: string;
  peerId: string;
  type: CallType;
  status: CallStatus;
  startedAt: number;
  answeredAt?: number;
  incoming?: boolean;
  participants?: string[]; // extra uids for group/multi-party calls
  groupChatId?: string;
}

interface AppState {
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
  currentChannelId: string | null;
  setCurrentChannelId: (id: string | null) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isDarkMode: boolean;
  setDarkMode: (dark: boolean) => void;

  // Data State for Local Backend
  systemSettings: SystemSettings;
  currentUser: UserProfile | null;
  users: UserProfile[];
  chats: Chat[];
  messages: Message[];
  channels: Channel[];
  channelPosts: ChannelPost[];
  calls: CallLog[];
  verifyRequests: VerifyRequest[];
  groupInvites: GroupInvite[];
  reports: Report[];

  // Live (not persisted logically, but kept simple)
  activeCall: ActiveCall | null;

  // Actions
  installSystem: (adminData: Partial<UserProfile>) => void;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  updateSmtp: (smtp: Partial<SmtpSettings>) => void;
  login: (identifier: string, pass: string) => void;
  signup: (email: string, phone: string, username: string, name: string, password?: string) => void;
  logout: () => void;
  heartbeat: () => void;
  purgeExpiredStatuses: () => void;

  addMessage: (
    chatId: string,
    text: string,
    mediaType?: 'image' | 'video' | 'audio' | 'file' | 'none',
    mediaUrl?: string,
    extra?: Partial<Message>,
  ) => void;
  deleteMessage: (msgId: string, forEveryone?: boolean) => void;
  toggleStarMessage: (msgId: string) => void;
  reactToMessage: (msgId: string, emoji: string) => void;
  markChatRead: (chatId: string) => void;
  forwardMessage: (msgId: string, targetChatId: string) => void;

  startChat: (otherUserId: string) => void;
  createGroup: (name: string, members: string[], avatarUrl?: string) => void;
  respondGroupInvite: (inviteId: string, approve: boolean) => void;
  addReport: (targetType: Report['targetType'], targetId: string, reason: string) => void;
  addMemberToCall: (uid: string) => void;
  transferChannelOwnership: (channelId: string, newOwnerId: string) => void;
  deleteUser: (uid: string) => void;
  toggleBanUser: (uid: string, isBanned: boolean) => void;
  toggleVerifyUser: (uid: string, isVerified: boolean) => void;
  toggleBlockUser: (uid: string) => void;
  isBlocked: (uid: string) => boolean;
  isBlockedBy: (uid: string) => boolean;
  updateGroup: (chatId: string, data: Partial<Chat>) => void;
  deleteGroup: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  leaveGroup: (chatId: string, userId: string) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  addStatusView: (uid: string, viewerId: string) => void;

  // Channels
  createChannel: (name: string, about: string, avatarUrl?: string) => void;
  toggleFollowChannel: (channelId: string) => void;
  addChannelPost: (channelId: string, text: string, mediaType?: 'image' | 'video' | 'none', mediaUrl?: string) => void;
  deleteChannelPost: (postId: string) => void;
  reactToChannelPost: (postId: string, emoji: string) => void;
  deleteChannel: (channelId: string) => void;
  updateChannel: (channelId: string, data: Partial<Channel>) => void;
  toggleVerifyChannel: (channelId: string, isVerified: boolean) => void;

  // Calls
  startCall: (peerId: string, type: CallType) => void;
  startGroupCall: (chatId: string, type: CallType) => void;
  answerCall: () => void;
  endCall: (status?: CallStatus) => void;
  clearCallHistory: () => void;

  // Verification
  submitVerifyRequest: (data: Omit<VerifyRequest, 'id' | 'status' | 'createdAt' | 'userId'>) => void;
  resolveVerifyRequest: (id: string, approve: boolean) => void;

  // Admin
  broadcastMessage: (text: string) => void;
  sendOtp: (uid: string) => string;
}

const defaultSmtp: SmtpSettings = {
  host: '',
  port: '587',
  username: '',
  password: '',
  fromEmail: '',
  fromName: 'CK Chat',
  secure: true,
  enabled: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentChatId: null,
      setCurrentChatId: (id) => {
        set({ currentChatId: id, currentChannelId: null, isSidebarOpen: false });
        if (id) get().markChatRead(id);
      },
      currentChannelId: null,
      setCurrentChannelId: (id) => set({ currentChannelId: id, currentChatId: null, isSidebarOpen: false }),
      isSidebarOpen: true,
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      isDarkMode: false,
      setDarkMode: (dark) => set({ isDarkMode: dark }),

      systemSettings: {
        isInstalled: false,
        chatEnabled: true,
        disabledMessage: 'The system is currently undergoing maintenance. Messaging is temporarily disabled.',
        appName: 'CK Chat',
        otpEnabled: false,
        callsEnabled: true,
        channelsEnabled: true,
        statusExpiryHours: 24,
        verifyPrice: '500 PKR',
        easypaisa: '',
        jazzcash: '',
        binance: '',
        smtp: defaultSmtp,
      },
      currentUser: null,
      users: [],
      chats: [],
      messages: [],
      channels: [],
      channelPosts: [],
      calls: [],
      verifyRequests: [],
      groupInvites: [],
      reports: [],
      activeCall: null,

      installSystem: (adminData) => {
        const admin: UserProfile = {
          uid: 'admin-' + Date.now(),
          email: adminData.email || '',
          phone: adminData.phone || '',
          username: adminData.username || 'admin',
          displayName: adminData.displayName || 'Super Admin',
          photoURL: `https://ui-avatars.com/api/?name=Admin&background=00a884&color=fff`,
          createdAt: Date.now(),
          lastSeen: Date.now(),
          isOnline: true,
          isAdmin: true,
          isBanned: false,
          isVerified: true,
          blocked: [],
          password: adminData.password || (adminData as any).pass || 'admin123',
        };
        set({
          users: [admin],
          currentUser: admin,
          systemSettings: { ...get().systemSettings, isInstalled: true },
        });
      },

      updateSystemSettings: (settings) => {
        set({ systemSettings: { ...get().systemSettings, ...settings } });
      },

      updateSmtp: (smtp) => {
        const s = get().systemSettings;
        set({ systemSettings: { ...s, smtp: { ...defaultSmtp, ...s.smtp, ...smtp } } });
      },

      login: (identifier, pass) => {
        const { users } = get();
        let user = users.find(
          (u) => u.email === identifier || u.username === identifier || u.phone === identifier,
        );

        if (!user) {
          throw new Error('User not found. Please check your credentials.');
        }
        if (user.isBanned) {
          throw new Error('Your account has been banned by the administrator.');
        }
        if (user.password && user.password !== pass) {
          throw new Error('Incorrect password. Please try again.');
        }
        const online = { ...user, isOnline: true, lastSeen: Date.now() };
        set({
          currentUser: online,
          users: users.map((u) => (u.uid === user!.uid ? online : u)),
        });
      },

      signup: (email, phone, username, name, password) => {
        const { users } = get();
        if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
          throw new Error('Username already exists.');
        }
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('Email already registered.');
        }
        const newUser: UserProfile = {
          uid: 'user-' + Date.now(),
          email,
          phone,
          username,
          displayName: name || username,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || username)}&background=00a884&color=fff`,
          createdAt: Date.now(),
          lastSeen: Date.now(),
          isOnline: true,
          isAdmin: false,
          isBanned: false,
          blocked: [],
          password: password || '',
        };
        set({ users: [...users, newUser], currentUser: newUser });
      },

      logout: () => {
        const { currentUser, users } = get();
        set({
          users: currentUser
            ? users.map((u) => (u.uid === currentUser.uid ? { ...u, isOnline: false, lastSeen: Date.now() } : u))
            : users,
          currentUser: null,
          currentChatId: null,
          currentChannelId: null,
          activeCall: null,
          isSidebarOpen: true,
        });
      },

      heartbeat: () => {
        const { currentUser, users } = get();
        if (!currentUser) return;
        const updated = { ...currentUser, isOnline: true, lastSeen: Date.now() };
        set({
          currentUser: updated,
          users: users.map((u) => (u.uid === currentUser.uid ? { ...u, isOnline: true, lastSeen: updated.lastSeen } : u)),
        });
      },

      // Status updates auto delete after configured hours (default 24h)
      purgeExpiredStatuses: () => {
        const { users, currentUser, systemSettings } = get();
        const ttl = (systemSettings.statusExpiryHours || 24) * 60 * 60 * 1000;
        const now = Date.now();
        let changed = false;
        const cleaned = users.map((u) => {
          if (u.myStatus && u.myStatusTime && now - u.myStatusTime > ttl) {
            changed = true;
            return { ...u, myStatus: '', myStatusTime: 0, myStatusViews: [] };
          }
          return u;
        });
        if (!changed) return;
        set({
          users: cleaned,
          currentUser: currentUser ? cleaned.find((u) => u.uid === currentUser.uid) || currentUser : currentUser,
        });
      },

      addMessage: (chatId, text, mediaType = 'none', mediaUrl, extra) => {
        const { currentUser, messages, chats, systemSettings, users } = get();
        if (!currentUser) return;
        if (!systemSettings.chatEnabled && !currentUser.isAdmin) {
          throw new Error(systemSettings.disabledMessage);
        }

        const chat = chats.find((c) => c.id === chatId);
        if (chat?.type === 'group' && chat.onlyAdminsMessage && !currentUser.isAdmin) {
          const isGroupAdmin = chat.admins?.includes(currentUser.uid) || chat.createdBy === currentUser.uid;
          if (!isGroupAdmin) {
            throw new Error('Only admins can send messages in this group.');
          }
        }
        if (chat?.type === 'direct') {
          const otherId = chat.members.find((m) => m !== currentUser.uid);
          const other = users.find((u) => u.uid === otherId);
          if (currentUser.blocked?.includes(otherId || '')) {
            throw new Error('You blocked this user. Unblock to send messages.');
          }
          if (other?.blocked?.includes(currentUser.uid)) {
            throw new Error("You can't message this user.");
          }
        }

        // Delivery ticks: single tick when receiver offline, double tick when online
        let anyOnline = false;
        if (chat) {
          anyOnline = chat.members
            .filter((m) => m !== currentUser.uid)
            .some((m) => isUserOnline(users.find((u) => u.uid === m)));
        }

        const newMessage: Message = {
          id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
          chatId,
          senderId: currentUser.uid,
          text,
          mediaType,
          mediaUrl,
          createdAt: Date.now(),
          status: anyOnline ? 'delivered' : 'sent',
          ...extra,
        };

        const preview =
          mediaType === 'image'
            ? 'Image'
            : mediaType === 'audio'
              ? text
              : mediaType === 'video'
                ? 'Video'
                : mediaType === 'file'
                  ? `📄 ${extra?.fileName || 'File'}`
                  : text;

        const updatedChats = chats.map((c) =>
          c.id === chatId ? { ...c, recentMessage: { text: preview, createdAt: Date.now() } } : c,
        );

        set({ messages: [...messages, newMessage], chats: updatedChats });
      },

      deleteMessage: (msgId, forEveryone) => {
        const { messages, currentUser } = get();
        if (!currentUser) return;
        const msg = messages.find((m) => m.id === msgId);
        if (!msg) return;
        if (forEveryone && msg.senderId === currentUser.uid) {
          set({
            messages: messages.map((m) =>
              m.id === msgId ? { ...m, deletedForEveryone: true, text: '', mediaUrl: undefined } : m,
            ),
          });
        } else {
          set({
            messages: messages.map((m) =>
              m.id === msgId ? { ...m, deletedFor: [...(m.deletedFor || []), currentUser.uid] } : m,
            ),
          });
        }
      },

      reactToMessage: (msgId, emoji) => {
        const { messages, currentUser } = get();
        if (!currentUser) return;
        set({
          messages: messages.map((m) => {
            if (m.id !== msgId) return m;
            const reactions = { ...(m.reactions || {}) };
            if (reactions[currentUser.uid] === emoji) {
              delete reactions[currentUser.uid];
            } else {
              reactions[currentUser.uid] = emoji;
            }
            return { ...m, reactions };
          }),
        });
      },

      toggleStarMessage: (msgId) => {
        set({
          messages: get().messages.map((m) => (m.id === msgId ? { ...m, starred: !m.starred } : m)),
        });
      },

      // Blue ticks: mark all incoming messages of this chat as read
      markChatRead: (chatId) => {
        const { messages, currentUser } = get();
        if (!currentUser) return;
        let changed = false;
        const updated = messages.map((m) => {
          if (m.chatId === chatId && m.senderId !== currentUser.uid && m.status !== 'read') {
            changed = true;
            return { ...m, status: 'read' as const };
          }
          return m;
        });
        if (changed) set({ messages: updated });
      },

      forwardMessage: (msgId, targetChatId) => {
        const { messages } = get();
        const msg = messages.find((m) => m.id === msgId);
        if (!msg) return;
        get().addMessage(targetChatId, msg.text, msg.mediaType, msg.mediaUrl, { forwarded: true });
      },

      startChat: (otherUserId) => {
        const { currentUser, chats } = get();
        if (!currentUser) return;

        const existing = chats.find(
          (c) => c.type === 'direct' && c.members.includes(currentUser.uid) && c.members.includes(otherUserId),
        );
        if (existing) {
          set({ currentChatId: existing.id, currentChannelId: null, isSidebarOpen: false });
          get().markChatRead(existing.id);
          return;
        }

        const newChat: Chat = {
          id: 'chat-' + Date.now(),
          type: 'direct',
          name: '',
          members: [currentUser.uid, otherUserId],
          createdAt: Date.now(),
          createdBy: currentUser.uid,
        };

        set({ chats: [...chats, newChat], currentChatId: newChat.id, currentChannelId: null, isSidebarOpen: false });
      },

      createGroup: (name, members, avatarUrl) => {
        const { currentUser, chats, users, groupInvites } = get();
        if (!currentUser) return;

        const directMembers: string[] = [];
        const pendingInvites: GroupInvite[] = [];
        const chatId = 'group-' + Date.now();

        members.forEach((uid) => {
          const u = users.find((x) => x.uid === uid);
          if (u?.groupInviteApproval) {
            pendingInvites.push({
              id: 'ginv-' + Date.now() + '-' + uid,
              chatId,
              userId: uid,
              invitedBy: currentUser.uid,
              status: 'pending',
              createdAt: Date.now(),
            });
          } else {
            directMembers.push(uid);
          }
        });

        const newChat: Chat = {
          id: chatId,
          type: 'group',
          name,
          avatarUrl,
          members: [currentUser.uid, ...directMembers],
          admins: [currentUser.uid],
          onlyAdminsMessage: false,
          onlyAdminsEditInfo: false,
          createdAt: Date.now(),
          createdBy: currentUser.uid,
        };
        set({
          chats: [...chats, newChat],
          groupInvites: [...groupInvites, ...pendingInvites],
          currentChatId: newChat.id,
          currentChannelId: null,
          isSidebarOpen: false,
        });
      },

      respondGroupInvite: (inviteId, approve) => {
        const { groupInvites, chats, currentUser } = get();
        const invite = groupInvites.find((i) => i.id === inviteId);
        if (!invite || !currentUser || invite.userId !== currentUser.uid) return;
        let nextChats = chats;
        if (approve) {
          nextChats = chats.map((c) =>
            c.id === invite.chatId && !c.members.includes(currentUser.uid)
              ? { ...c, members: [...c.members, currentUser.uid] }
              : c,
          );
        }
        set({
          chats: nextChats,
          groupInvites: groupInvites.map((i) =>
            i.id === inviteId ? { ...i, status: approve ? 'approved' : 'rejected' } : i,
          ),
        });
      },

      addReport: (targetType, targetId, reason) => {
        const { currentUser, reports } = get();
        if (!currentUser) return;
        set({
          reports: [
            ...reports,
            {
              id: 'report-' + Date.now(),
              reporterId: currentUser.uid,
              targetType,
              targetId,
              reason,
              createdAt: Date.now(),
              status: 'pending',
            },
          ],
        });
      },

      deleteUser: (uid) => {
        const { users, currentUser } = get();
        if (currentUser?.uid === uid) return;
        set({ users: users.filter((u) => u.uid !== uid) });
      },

      toggleBanUser: (uid, isBanned) => {
        const { users, currentUser } = get();
        if (currentUser?.uid === uid) return;
        set({ users: users.map((u) => (u.uid === uid ? { ...u, isBanned } : u)) });
      },

      toggleVerifyUser: (uid, isVerified) => {
        const { users, currentUser } = get();
        if (!currentUser?.isAdmin) return;
        set({ users: users.map((u) => (u.uid === uid ? { ...u, isVerified } : u)) });
      },

      toggleBlockUser: (uid) => {
        const { users, currentUser } = get();
        if (!currentUser) return;
        const blocked = currentUser.blocked || [];
        const next = blocked.includes(uid) ? blocked.filter((b) => b !== uid) : [...blocked, uid];
        const updated = { ...currentUser, blocked: next };
        set({
          currentUser: updated,
          users: users.map((u) => (u.uid === currentUser.uid ? updated : u)),
        });
      },

      isBlocked: (uid) => !!get().currentUser?.blocked?.includes(uid),

      isBlockedBy: (uid) => {
        const me = get().currentUser;
        const other = get().users.find((u) => u.uid === uid);
        return !!me && !!other?.blocked?.includes(me.uid);
      },

      updateGroup: (chatId, data) => {
        const { chats } = get();
        set({
          chats: chats.map((c) => (c.id === chatId && c.type === 'group' ? { ...c, ...data } : c)),
        });
      },

      deleteGroup: (chatId) => {
        const { chats, currentChatId } = get();
        const nextId = currentChatId === chatId ? null : currentChatId;
        set({
          chats: chats.filter((c) => c.id !== chatId),
          currentChatId: nextId,
          ...(nextId === null ? { isSidebarOpen: true } : {}),
        });
      },

      deleteChat: (chatId) => {
        const { chats, messages, currentChatId } = get();
        const nextId = currentChatId === chatId ? null : currentChatId;
        set({
          chats: chats.filter((c) => c.id !== chatId),
          messages: messages.filter((m) => m.chatId !== chatId),
          currentChatId: nextId,
          ...(nextId === null ? { isSidebarOpen: true } : {}),
        });
      },

      leaveGroup: (chatId, userId) => {
        const { chats, currentChatId, currentUser } = get();
        const updatedChats = chats.map((c) => {
          if (c.id === chatId && c.type === 'group') {
            return {
              ...c,
              members: c.members.filter((m) => m !== userId),
              admins: (c.admins || []).filter((a) => a !== userId),
            };
          }
          return c;
        });

        const nextChatId = currentChatId === chatId && currentUser?.uid === userId ? null : currentChatId;

        set({
          chats: updatedChats,
          currentChatId: nextChatId,
          ...(nextChatId === null ? { isSidebarOpen: true } : {}),
        });
      },

      updateProfile: (data) => {
        const { users, currentUser } = get();
        if (!currentUser) return;
        if (data.username && data.username.toLowerCase() !== currentUser.username.toLowerCase()) {
          if (users.some((u) => u.uid !== currentUser.uid && u.username.toLowerCase() === data.username!.toLowerCase())) {
            throw new Error('Username already exists.');
          }
        }
        const updatedUser = { ...currentUser, ...data };
        set({
          currentUser: updatedUser,
          users: users.map((u) => (u.uid === currentUser.uid ? updatedUser : u)),
        });
      },

      addStatusView: (uid, viewerId) => {
        const { users, currentUser } = get();
        const updatedUsers = users.map((u) => {
          if (u.uid === uid) {
            const views = u.myStatusViews || [];
            if (!views.includes(viewerId)) {
              return { ...u, myStatusViews: [...views, viewerId] };
            }
          }
          return u;
        });

        const updatedCurrentUser =
          currentUser && currentUser.uid === uid ? updatedUsers.find((u) => u.uid === uid) || currentUser : currentUser;

        set({ users: updatedUsers, currentUser: updatedCurrentUser });
      },

      /* ---------------- Channels ---------------- */

      createChannel: (name, about, avatarUrl) => {
        const { currentUser, channels } = get();
        if (!currentUser) return;
        const channel: Channel = {
          id: 'ch-' + Date.now(),
          name,
          about,
          avatarUrl,
          ownerId: currentUser.uid,
          followers: [currentUser.uid],
          isVerified: false,
          createdAt: Date.now(),
        };
        set({ channels: [...channels, channel], currentChannelId: channel.id, currentChatId: null, isSidebarOpen: false });
      },

      toggleFollowChannel: (channelId) => {
        const { channels, currentUser } = get();
        if (!currentUser) return;
        set({
          channels: channels.map((c) =>
            c.id === channelId
              ? {
                  ...c,
                  followers: c.followers.includes(currentUser.uid)
                    ? c.followers.filter((f) => f !== currentUser.uid)
                    : [...c.followers, currentUser.uid],
                }
              : c,
          ),
        });
      },

      addChannelPost: (channelId, text, mediaType = 'none', mediaUrl) => {
        const { channelPosts, currentUser } = get();
        if (!currentUser) return;
        const post: ChannelPost = {
          id: 'post-' + Date.now(),
          channelId,
          text,
          mediaType,
          mediaUrl,
          createdAt: Date.now(),
          views: [],
        };
        set({ channelPosts: [...channelPosts, post] });
      },

      deleteChannelPost: (postId) => set({ channelPosts: get().channelPosts.filter((p) => p.id !== postId) }),

      reactToChannelPost: (postId, emoji) => {
        const { channelPosts, currentUser } = get();
        if (!currentUser) return;
        set({
          channelPosts: channelPosts.map((p) => {
            if (p.id !== postId) return p;
            const reactions = { ...(p.reactions || {}) };
            if (reactions[currentUser.uid] === emoji) {
              delete reactions[currentUser.uid];
            } else {
              reactions[currentUser.uid] = emoji;
            }
            return { ...p, reactions };
          }),
        });
      },

      deleteChannel: (channelId) =>
        set({
          channels: get().channels.filter((c) => c.id !== channelId),
          channelPosts: get().channelPosts.filter((p) => p.channelId !== channelId),
          currentChannelId: get().currentChannelId === channelId ? null : get().currentChannelId,
        }),

      updateChannel: (channelId, data) =>
        set({ channels: get().channels.map((c) => (c.id === channelId ? { ...c, ...data } : c)) }),

      toggleVerifyChannel: (channelId, isVerified) =>
        set({ channels: get().channels.map((c) => (c.id === channelId ? { ...c, isVerified } : c)) }),

      transferChannelOwnership: (channelId, newOwnerId) => {
        const { channels, currentUser } = get();
        const ch = channels.find((c) => c.id === channelId);
        if (!ch || (ch.ownerId !== currentUser?.uid && !currentUser?.isAdmin)) return;
        set({
          channels: channels.map((c) =>
            c.id === channelId
              ? { ...c, ownerId: newOwnerId, followers: c.followers.includes(newOwnerId) ? c.followers : [...c.followers, newOwnerId] }
              : c,
          ),
        });
      },

      addMemberToCall: (uid) => {
        const { activeCall } = get();
        if (!activeCall) return;
        const participants = activeCall.participants || [];
        if (participants.includes(uid) || uid === activeCall.peerId) return;
        set({ activeCall: { ...activeCall, participants: [...participants, uid] } });
      },

      /* ---------------- Calls ---------------- */

      startCall: (peerId, type) => {
        const { currentUser, systemSettings } = get();
        if (!currentUser) return;
        if (systemSettings.callsEnabled === false) throw new Error('Calling is disabled by the administrator.');
        if (get().isBlocked(peerId) || get().isBlockedBy(peerId)) throw new Error('You cannot call this user.');
        set({
          activeCall: {
            id: 'call-' + Date.now(),
            peerId,
            type,
            status: 'ringing',
            startedAt: Date.now(),
          },
        });
      },

      startGroupCall: (chatId, type) => {
        const { currentUser, chats, systemSettings } = get();
        if (!currentUser) return;
        if (systemSettings.callsEnabled === false) throw new Error('Calling is disabled by the administrator.');
        const chat = chats.find((c) => c.id === chatId && c.type === 'group');
        if (!chat) return;
        if (chat.onlyAdminsMessage) {
          const isGroupAdmin = chat.admins?.includes(currentUser.uid) || chat.createdBy === currentUser.uid || currentUser.isAdmin;
          if (!isGroupAdmin) throw new Error('Only admins can start a call in this group.');
        }
        const others = chat.members.filter((m) => m !== currentUser.uid);
        if (others.length === 0) return;
        const [firstPeer, ...rest] = others;
        set({
          activeCall: {
            id: 'call-' + Date.now(),
            peerId: firstPeer,
            type,
            status: 'ringing',
            startedAt: Date.now(),
            participants: rest,
            groupChatId: chatId,
          },
        });
      },

      answerCall: () => {
        const call = get().activeCall;
        if (!call) return;
        set({ activeCall: { ...call, status: 'answered', answeredAt: Date.now() } });
      },

      endCall: (status) => {
        const { activeCall, calls, currentUser, chats } = get();
        if (!activeCall || !currentUser) {
          set({ activeCall: null });
          return;
        }
        const answered = activeCall.status === 'answered';
        const duration = answered && activeCall.answeredAt ? Math.floor((Date.now() - activeCall.answeredAt) / 1000) : 0;
        const finalStatus: CallStatus = status || (answered ? 'ended' : 'missed');

        const log: CallLog = {
          id: activeCall.id,
          callerId: currentUser.uid,
          calleeId: activeCall.peerId,
          type: activeCall.type,
          status: finalStatus,
          createdAt: activeCall.startedAt,
          duration,
        };

        // Log call inside the conversation, like CK MR Chat
        const chat = chats.find(
          (c) => c.type === 'direct' && c.members.includes(currentUser.uid) && c.members.includes(activeCall.peerId),
        );
        const icon = activeCall.type === 'video' ? '📹' : '📞';
        const label = activeCall.type === 'video' ? 'Video call' : 'Voice call';
        const mm = Math.floor(duration / 60);
        const ss = duration % 60;
        const body = answered
          ? `${icon} ${label} · ${mm}:${ss < 10 ? '0' : ''}${ss}`
          : `${icon} Missed ${label.toLowerCase()}`;

        set({ activeCall: null, calls: [...calls, log] });

        if (chat) {
          try {
            get().addMessage(chat.id, body, 'none', undefined, { isSystem: true });
          } catch (e) {
            /* messaging may be disabled */
          }
        }
      },

      clearCallHistory: () => set({ calls: [] }),

      /* ---------------- Verification ---------------- */

      submitVerifyRequest: (data) => {
        const { currentUser, verifyRequests } = get();
        if (!currentUser) return;
        set({
          verifyRequests: [
            ...verifyRequests,
            {
              ...data,
              id: 'vr-' + Date.now(),
              userId: currentUser.uid,
              status: 'pending',
              createdAt: Date.now(),
            },
          ],
        });
      },

      resolveVerifyRequest: (id, approve) => {
        const { verifyRequests, users, channels, currentUser } = get();
        const req = verifyRequests.find((r) => r.id === id);
        if (!req) return;

        let nextUsers = users;
        let nextChannels = channels;

        if (approve) {
          if (req.targetType === 'user') {
            nextUsers = users.map((u) =>
              u.uid === req.userId || u.username === req.targetName ? { ...u, isVerified: true } : u,
            );
          } else {
            nextChannels = channels.map((c) => (c.name === req.targetName ? { ...c, isVerified: true } : c));
          }
        }

        set({
          verifyRequests: verifyRequests.map((r) => (r.id === id ? { ...r, status: approve ? 'approved' : 'rejected' } : r)),
          users: nextUsers,
          channels: nextChannels,
          currentUser: currentUser ? nextUsers.find((u) => u.uid === currentUser.uid) || currentUser : currentUser,
        });
      },

      /* ---------------- Admin tools ---------------- */

      broadcastMessage: (text) => {
        const { currentUser, users, chats, messages } = get();
        if (!currentUser?.isAdmin || !text.trim()) return;

        const newChats: Chat[] = [];
        const newMessages: Message[] = [];
        const updatedChats = [...chats];

        users
          .filter((u) => u.uid !== currentUser.uid)
          .forEach((u) => {
            let chat = updatedChats.find(
              (c) => c.type === 'direct' && c.members.includes(currentUser.uid) && c.members.includes(u.uid),
            );
            if (!chat) {
              chat = {
                id: 'chat-' + Date.now() + '-' + u.uid,
                type: 'direct',
                name: '',
                members: [currentUser.uid, u.uid],
                createdAt: Date.now(),
                createdBy: currentUser.uid,
              };
              newChats.push(chat);
              updatedChats.push(chat);
            }
            newMessages.push({
              id: 'msg-' + Date.now() + '-' + u.uid,
              chatId: chat.id,
              senderId: currentUser.uid,
              text,
              mediaType: 'none',
              createdAt: Date.now(),
              status: isUserOnline(u) ? 'delivered' : 'sent',
            });
            const idx = updatedChats.findIndex((c) => c.id === chat!.id);
            updatedChats[idx] = { ...updatedChats[idx], recentMessage: { text, createdAt: Date.now() } };
          });

        set({ chats: updatedChats, messages: [...messages, ...newMessages] });
      },

      sendOtp: (uid) => {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        set({ users: get().users.map((u) => (u.uid === uid ? { ...u, otpCode: code, otpVerified: false } : u)) });
        return code;
      },
    }),
    {
      name: 'ckchat-db-v3',
      partialize: (state) => {
        const { activeCall, ...rest } = state as any;
        return rest;
      },
    },
  ),
);
