import React, { useState, useRef, useEffect } from "react";
import { UserProfile } from "../lib/types";
import { useAppStore } from "../lib/store";
import VerifyRequestModal from "./VerifyRequestModal";
import GroupInvitesBanner from "./GroupInvitesBanner";
import PrivacyView from "./PrivacyView";
import OwnProfileView from "./OwnProfileView";
import {
  MessageSquare,
  MoreVertical,
  Search,
  ArrowLeft,
  LogOut,
  Users,
  Moon,
  Sun,
  User,
  Camera,
  Check,
  CircleDashed,
  Phone,
  Map,
  MessageCircle,
  PhoneCall,
  Mic,
  BadgeCheck,
  Trash2,
  Radio,
  Video,
  Image as ImageIcon,
  X,
  ShieldCheck,
  UserPlus,
  Loader,
  RefreshCw,
  TrendingUp,
  Lock,
} from "lucide-react";
import { format } from "date-fns";

export default function Sidebar({
  currentUser,
  isAdmin,
}: {
  currentUser: UserProfile;
  isAdmin: boolean;
}) {
  const {
    chats,
    users,
    currentChatId,
    setCurrentChatId,
    logout,
    startChat,
    createGroup,
    isDarkMode,
    setDarkMode,
    updateProfile,
    systemSettings,
    channels,
    channelPosts,
    currentChannelId,
    setCurrentChannelId,
    createChannel,
    toggleFollowChannel,
    calls,
    clearCallHistory,
    startCall,
  } = useAppStore();
  const appName = systemSettings?.appName || "CK Chat";
  const [view, setView] = useState<
    "chats" | "contacts" | "newGroup" | "profile" | "privacy"
  >("chats");
  const [activeTab, setActiveTab] = useState<
    "chats" | "updates" | "channels" | "calls"
  >("chats");
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelAbout, setNewChannelAbout] = useState("");
  const [showWallpaper, setShowWallpaper] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [channelSubTab, setChannelSubTab] = useState<"my" | "explorer">("my");
  const [showExplorerFull, setShowExplorerFull] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingContacts, setIsSearchingContacts] = useState(false);
  const [isSearchingGroupMembers, setIsSearchingGroupMembers] = useState(false);

  // Status state
  const statusInputRef = useRef<HTMLInputElement>(null);

  const handleStatusUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateProfile({
          myStatus: event.target?.result as string,
          myStatusTime: Date.now(),
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Group state
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const groupAvatarInputRef = useRef<HTMLInputElement>(null);

  const [viewingStatus, setViewingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (viewingStatus) {
      const timer = setTimeout(() => {
        setViewingStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [viewingStatus]);

  const handleGroupAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setGroupAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Profile Edit State
  const [editName, setEditName] = useState(currentUser.displayName);
  const [editBio, setEditBio] = useState(
    currentUser.bio || `Hey there! I am using ${appName}.`,
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const profilePicRef = useRef<HTMLInputElement>(null);

  const myChats = chats
    .filter((c) => c.members.includes(currentUser.uid))
    .sort((a, b) => {
      const t1 = a.recentMessage?.createdAt || a.createdAt;
      const t2 = b.recentMessage?.createdAt || b.createdAt;
      return t2 - t1;
    });

  const contacts = users
    .filter((u) => u.uid !== currentUser.uid && !u.isBanned)
    .filter(
      (u) => !searchQuery || u.username.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const handleStartChat = (uid: string) => {
    startChat(uid);
    setView("chats");
    setSearchQuery("");
    setIsSearchingContacts(false);
    setIsSearchingGroupMembers(false);
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      createGroup(groupName, selectedMembers, groupAvatar || undefined);
      setView("chats");
      setGroupName("");
      setGroupAvatar(null);
      setSelectedMembers([]);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        updateProfile({ photoURL: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfileName = () => {
    updateProfile({ displayName: editName });
    setIsEditingName(false);
  };

  const saveProfileBio = () => {
    updateProfile({ bio: editBio });
    setIsEditingBio(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0b141a] relative">
      {(view === "chats" || view === "contacts" || view === "newGroup") && (
        <div className="h-[60px] bg-white dark:bg-[#0b141a] px-4 flex items-center justify-between z-20 relative">
          <div className="flex items-center gap-2">
            <h1
              className="text-xl font-bold text-green-500 dark:text-white cursor-pointer"
              onClick={() => setView("chats")}
            >
              {appName}
            </h1>
            {isAdmin && (
              <span
                className="text-[9px] bg-[#25d366] text-white px-1.5 py-0.5 rounded cursor-pointer font-bold uppercase tracking-wider"
                onClick={() => (window.location.hash = "#/admin")}
              >
                Admin
              </span>
            )}
          </div>
          <div className="flex flex-1 items-center justify-end gap-5 text-[#54656f] dark:text-white">
            <button
              onClick={() => setShowCameraCapture(true)}
              className="hover:opacity-80 transition-opacity"
              title="Camera"
            >
              <Camera size={24} />
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="hover:opacity-80 transition-opacity"
              >
                <MoreVertical size={24} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#233138] shadow-xl rounded-2xl overflow-hidden z-50 py-2 border border-gray-100 dark:border-[#313d45]">
                  <button
                    onClick={() => {
                      setView("profile");
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-[#3b4a54] dark:text-[#e9edef] text-[15px]"
                  >
                    <User size={18} /> Profile
                  </button>
                  <button
                    onClick={() => {
                      setView("newGroup");
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-[#3b4a54] dark:text-[#e9edef] text-[15px]"
                  >
                    <Users size={18} /> New group
                  </button>
                  <button
                    onClick={() => {
                      setShowNewChannel(true);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-[#3b4a54] dark:text-[#e9edef] text-[15px]"
                  >
                    <Radio size={18} /> New channel
                  </button>
                  <button
                    onClick={() => {
                      setShowWallpaper(true);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-[#3b4a54] dark:text-[#e9edef] text-[15px]"
                  >
                    <ImageIcon size={18} /> Wallpaper
                  </button>
                  <button
                    onClick={() => {
                      setShowVerifyModal(true);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-[#3b4a54] dark:text-[#e9edef] text-[15px]"
                  >
                    <ShieldCheck size={18} /> Request blue tick
                  </button>
                  <button
                    onClick={() => {
                      setView("privacy");
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-[#3b4a54] dark:text-[#e9edef] text-[15px]"
                  >
                    <Lock size={18} /> Privacy
                  </button>
                  <button
                    onClick={() => {
                      setDarkMode(!isDarkMode);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-[#3b4a54] dark:text-[#e9edef] text-[15px]"
                  >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}{" "}
                    {isDarkMode ? "Light mode" : "Dark mode"}
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-red-500 font-medium text-[15px]"
                  >
                    <LogOut size={18} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {view === "profile" ? (
        <OwnProfileView currentUser={currentUser} onBack={() => setView("chats")} />
      ) : view === "privacy" ? (
        <PrivacyView currentUser={currentUser} onBack={() => setView("chats")} />
      ) : view === "contacts" ? (
        <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#0b141a] relative z-20">
          <div className="h-[60px] bg-white dark:bg-[#0b141a] text-[#111b21] dark:text-white flex items-center px-4 shrink-0 shadow-sm relative z-20 border-b border-gray-100 dark:border-[#202c33]">
            {isSearchingContacts ? (
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => {
                    setIsSearchingContacts(false);
                    setSearchQuery("");
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-[#202c33] rounded-full transition-colors text-[#54656f] dark:text-white shrink-0"
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="flex-1 flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1">
                  <Search size={18} className="text-[#54656f] dark:text-[#8696a0] shrink-0 mr-2" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search name or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-[#111b21] dark:text-[#e9edef] text-[15px] py-1 placeholder-[#8696a0]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-[#00a884] font-semibold text-xs ml-1 hover:opacity-85"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => {
                      setView("chats");
                      setSearchQuery("");
                    }}
                    className="font-bold hover:opacity-80"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <div>
                    <h2 className="text-[17px] font-medium leading-tight">
                      Select contact
                    </h2>
                    <div className="text-[12px] text-[#667781] dark:text-[#8696a0] font-medium">
                      {contacts.length} contacts
                    </div>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-4 text-[#54656f] dark:text-white">
                  <button
                    onClick={() => setIsSearchingContacts(true)}
                    className="p-2 hover:bg-[#f0f2f5] dark:hover:bg-[#202c33] rounded-full transition-colors"
                  >
                    <Search size={22} />
                  </button>
                  <MoreVertical size={22} />
                </div>
              </>
            )}
          </div>

          <div className="bg-white dark:bg-[#111b21] flex-1 overflow-y-auto">
            <div
              className="flex items-center p-4 hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] cursor-pointer"
              onClick={() => setView("newGroup")}
            >
              <div className="w-11 h-11 rounded-full bg-[#25d366] flex items-center justify-center text-white mr-4 shrink-0">
                <Users size={22} style={{ fill: "currentColor" }} />
              </div>
              <div className="font-medium text-[#111b21] dark:text-[#e9edef] text-[16px]">
                New group
              </div>
            </div>

            <div className="py-2 text-[#667781] dark:text-[#8696a0] font-semibold text-[13px] px-6 bg-transparent">
              Contacts on WhatsApp
            </div>
            {contacts.map((contact) => (
              <div
                key={contact.uid}
                onClick={() => handleStartChat(contact.uid)}
                className="flex items-center px-4 py-2 hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] cursor-pointer"
              >
                <img
                  src={contact.photoURL}
                  className="w-11 h-11 rounded-full mr-4 shrink-0 object-cover"
                />
                <div className="flex-1 border-b border-[#f0f2f5] dark:border-[#202c33] pb-2 pt-1">
                  <div className="font-medium text-[#111b21] dark:text-[#e9edef] text-[16px] flex items-center gap-1">
                    {contact.displayName}
                    {contact.isVerified && (
                      <BadgeCheck
                        size={16}
                        className="text-white fill-[#1da1f2] shrink-0"
                      />
                    )}
                  </div>
                  <div className="text-[13px] text-[#667781] dark:text-[#8696a0] truncate mt-0.5">
                    {contact.bio || "Available"}
                  </div>
                </div>
              </div>
            ))}
            {contacts.length === 0 && (
              <div className="p-4 text-center text-[#667781] text-sm mt-4">
                No users found.
              </div>
            )}
          </div>
        </div>
      ) : view === "newGroup" ? (
        <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#0b141a] relative z-20">
          <div className="h-[60px] bg-white dark:bg-[#0b141a] text-[#111b21] dark:text-white flex items-center px-4 shrink-0 shadow-sm relative z-20 border-b border-gray-100 dark:border-[#202c33]">
            {isSearchingGroupMembers ? (
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => {
                    setIsSearchingGroupMembers(false);
                    setSearchQuery("");
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-[#202c33] rounded-full transition-colors text-[#54656f] dark:text-white shrink-0"
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="flex-1 flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1">
                  <Search size={18} className="text-[#54656f] dark:text-[#8696a0] shrink-0 mr-2" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search name or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-[#111b21] dark:text-[#e9edef] text-[15px] py-1 placeholder-[#8696a0]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-[#00a884] font-semibold text-xs ml-1 hover:opacity-85"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => {
                      setView("contacts");
                      setSearchQuery("");
                      setIsSearchingGroupMembers(false);
                    }}
                    className="font-bold hover:opacity-80"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <div>
                    <h2 className="text-[17px] font-medium leading-tight">
                      New group
                    </h2>
                    <div className="text-[12px] text-[#667781] dark:text-[#8696a0] font-medium">
                      Add members
                    </div>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-4 text-[#54656f] dark:text-white">
                  <button
                    onClick={() => setIsSearchingGroupMembers(true)}
                    className="p-2 hover:bg-[#f0f2f5] dark:hover:bg-[#202c33] rounded-full transition-colors"
                  >
                    <Search size={22} />
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-[#111b21] flex items-center gap-4 border-b border-gray-100 dark:border-[#202c33]">
            <div
              className="w-14 h-14 rounded-full bg-[#f0f2f5] dark:bg-[#2a3942] flex items-center justify-center shrink-0 cursor-pointer overflow-hidden text-[#54656f] dark:text-[#aebac1]"
              onClick={() => groupAvatarInputRef.current?.click()}
            >
              {groupAvatar ? (
                <img
                  src={groupAvatar}
                  alt="Group Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera size={24} />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={groupAvatarInputRef}
                onChange={handleGroupAvatarChange}
              />
            </div>
            <input
              autoFocus
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Type group subject here..."
              className="w-full border-b-2 border-[#25d366] bg-transparent py-2 focus:outline-none text-[#111b21] dark:text-white font-medium"
            />
          </div>

          <div className="py-2 text-[#667781] dark:text-[#8696a0] font-semibold text-[13px] px-6 bg-transparent">
            Contacts
          </div>
          <div className="flex-1 overflow-y-auto bg-white dark:bg-[#111b21]">
            {users
              .filter((u) => u.uid !== currentUser.uid && !u.isBanned)
              .filter(
                (u) => !searchQuery || u.username.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map((contact) => (
                <div
                  key={contact.uid}
                  onClick={() => {
                    setSelectedMembers((prev) =>
                      prev.includes(contact.uid)
                        ? prev.filter((id) => id !== contact.uid)
                        : [...prev, contact.uid],
                    );
                  }}
                  className="flex items-center px-4 py-2 hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={contact.photoURL}
                      className="w-11 h-11 rounded-full mr-4 shrink-0 object-cover"
                    />
                    {selectedMembers.includes(contact.uid) && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#25d366] rounded-full border-2 border-white dark:border-[#111b21] flex items-center justify-center text-[#111b21]">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 border-b border-[#f0f2f5] dark:border-[#202c33] pb-2 pt-1 font-medium text-[#111b21] dark:text-[#e9edef] text-[16px] flex items-center gap-1">
                    {contact.displayName}
                    {contact.isVerified && (
                      <BadgeCheck
                        size={16}
                        className="text-white fill-[#1da1f2] shrink-0"
                      />
                    )}
                  </div>
                </div>
              ))}
          </div>
          {selectedMembers.length > 0 && groupName.trim() && (
            <div className="absolute bottom-6 right-6 z-30">
              <button
                onClick={handleCreateGroup}
                className="w-[56px] h-[56px] bg-[#25d366] rounded-full flex items-center justify-center text-[#111b21] shadow-lg hover:bg-[#20c359] transition-transform animate-bounce"
              >
                <ArrowLeft size={24} style={{ transform: "rotate(180deg)" }} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0b141a] pb-[70px]">
            {activeTab === "chats" && (
              <>
                <GroupInvitesBanner currentUser={currentUser} />
                <div className="px-3 pt-3 pb-1">
                  <div className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f0f2f5] dark:bg-[#202c33]">
                    <Search size={18} className="text-[#54656f] dark:text-[#8696a0] shrink-0" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search chats by name or username"
                      className="flex-1 bg-transparent outline-none text-[15px] text-[#111b21] dark:text-[#e9edef] placeholder-[#8696a0]"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="text-[#8696a0]">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
                {myChats
                  .filter((chat) => {
                    if (!searchQuery) return true;
                    if (chat.type === "group")
                      return chat.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());
                    const otherUid = chat.members.find(
                      (m) => m !== currentUser.uid,
                    );
                    const otherUser = users.find((u) => u.uid === otherUid);
                    return (
                      otherUser?.displayName
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      otherUser?.username
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    );
                  })
                  .map((chat) => {
                    const isDirect = chat.type === "direct";
                    let otherUser = null;
                    if (isDirect) {
                      const otherUid = chat.members.find(
                        (m) => m !== currentUser.uid,
                      );
                      otherUser = users.find((u) => u.uid === otherUid);
                    }
                    const chatName = !isDirect
                      ? chat.name
                      : otherUser
                        ? otherUser.displayName
                        : "Unknown User";
                    const avatar = !isDirect
                      ? chat.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName)}&background=8696a0&color=fff`
                      : otherUser
                        ? otherUser.photoURL
                        : "";

                    return (
                      <div
                        key={chat.id}
                        onClick={() => setCurrentChatId(chat.id)}
                        className={`flex items-center p-3 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#111b21] ${currentChatId === chat.id ? "bg-[#f0f2f5] dark:bg-[#202c33]" : ""}`}
                      >
                        <img
                          src={avatar}
                          className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-white shrink-0 mr-3 object-cover"
                        />
                        <div className="flex-1 pb-1 pt-1 truncate">
                          <div className="flex justify-between items-baseline mb-0.5 flex-1">
                            <span className="font-medium text-[17px] text-[#111b21] dark:text-[#e9edef] truncate flex items-center gap-1">
                              {chatName}
                              {isDirect && otherUser?.isVerified && (
                                <BadgeCheck
                                  size={16}
                                  className="text-white fill-[#1da1f2] shrink-0"
                                />
                              )}
                            </span>
                            <span className="text-[12px] text-[#667781] dark:text-[#8696a0] shrink-0 ml-2">
                              {chat.recentMessage?.createdAt
                                ? format(
                                    new Date(chat.recentMessage.createdAt),
                                    "HH:mm",
                                  )
                                : ""}
                            </span>
                          </div>
                          <div className="text-[14px] text-[#667781] dark:text-[#aebac1] truncate flex items-center gap-1">
                            {chat.recentMessage?.text === "Image" ? (
                              <>
                                <Camera size={14} /> Photo
                              </>
                            ) : chat.recentMessage?.text.startsWith(
                                "Voice message",
                              ) ? (
                              <>
                                <Mic size={14} /> {chat.recentMessage.text}
                              </>
                            ) : (
                              chat.recentMessage?.text || "No messages yet"
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {myChats.length === 0 && !searchQuery && (
                  <div className="flex flex-col items-center justify-center h-full px-8 text-center bg-white dark:bg-[#0b141a]">
                    <div className="w-48 h-48 mb-6 relative mt-10">
                      <div className="absolute inset-0 bg-[#00a884] rounded-full opacity-10 blur-xl"></div>
                      <svg
                        viewBox="0 0 200 200"
                        className="w-full h-full text-[#25d366] fill-current drop-shadow-md"
                      >
                        <path d="M100 20C55.8 20 20 55.8 20 100c0 17.5 5.6 33.7 15 47L22 180l33.8-11.3c13 8 28.5 12.6 44.9 12.6 44.2 0 80-35.8 80-80s-35.8-80-80-80zm42.7 114.7c-1.8 5-10.4 9.6-14.7 10.1-4.1.5-9.3.8-15.1-1.1-3.5-1.1-8.3-2.9-14-6.4-12.2-7.3-20.1-19.4-20.7-20.3-.6-.9-5-6.6-5-12.6s3.1-8.9 4.2-10.2c1.1-1.2 2.4-1.5 3.3-1.5.9 0 1.8 0 2.5 0 .9 0 2.1-.3 3.3 2.5 1.2 2.9 4 9.8 4.4 10.6.4.8.6 1.8.1 3-1 2.2-1.8 3.5-3.3 5.3-1.3 1.5-2.8 3.3-1.3 5.9 1.5 2.6 6.5 10.8 14 17.5 9.6 8.6 17.5 11.2 20 12.4 2.5 1.2 3.9 1 5.3-.5 1.4-1.5 6-7.1 7.6-9.5 1.6-2.4 3.2-2 5.5-1.2 2.3.8 14.5 6.8 17 8.1 2.5 1.2 4.1 1.9 4.7 2.9.6 1.1.6 6.1-1.2 11.1z" />
                        <path
                          d="M110 50 L140 50 L110 90 L150 90"
                          stroke="#fff"
                          strokeWidth="8"
                          fill="none"
                          className="opacity-80"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h2 className="text-[24px] font-bold text-[#111b21] dark:text-[#e9edef] mb-3">
                      Start chatting
                    </h2>
                    <p className="text-[#667781] dark:text-[#8696a0] mb-8 leading-relaxed font-medium">
                      WhatsApp is better with friends. Use the button below to
                      invite your contacts.
                    </p>
                    <button
                      onClick={() => setView("contacts")}
                      className="bg-transparent border border-[#3b4a54] dark:border-[#313d45] text-[#111b21] dark:text-[#25d366] px-6 py-2.5 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-[#111b21] transition-colors shadow-sm mb-10"
                    >
                      Invite a friend
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === "updates" && (
              <div className="p-4">
                <h2 className="text-[22px] font-bold text-[#111b21] dark:text-[#e9edef] mb-6">
                  Status
                </h2>
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="relative cursor-pointer"
                    onClick={(e) => {
                      if (currentUser.myStatus) {
                        setViewingStatus(currentUser.myStatus);
                      } else {
                        statusInputRef.current?.click();
                      }
                    }}
                  >
                    <img
                      src={
                        currentUser.myStatus
                          ? currentUser.myStatus
                          : currentUser.photoURL
                      }
                      className={`w-14 h-14 rounded-full object-cover ${currentUser.myStatus ? "border-[3px] border-[#25d366] p-[2px]" : ""}`}
                    />
                    <div
                      className="absolute bottom-0 right-0 w-[22px] h-[22px] bg-[#25d366] rounded-full border-[3px] border-white dark:border-[#0b141a] flex items-center justify-center text-[#0b141a] shrink-0 font-bold text-lg leading-none pt-0.5 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        statusInputRef.current?.click();
                      }}
                    >
                      +
                    </div>
                  </div>
                  <div
                    className="cursor-pointer flex-1"
                    onClick={() => {
                      if (currentUser.myStatus) {
                        setViewingStatus(currentUser.myStatus);
                      } else {
                        statusInputRef.current?.click();
                      }
                    }}
                  >
                    <div className="font-medium text-[#111b21] dark:text-[#e9edef] text-[17px]">
                      My status
                    </div>
                    <div className="text-[14px] text-[#667781] dark:text-[#8696a0]">
                      {currentUser.myStatusTime
                        ? format(new Date(currentUser.myStatusTime), "h:mm a")
                        : "Tap to add status update"}
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={statusInputRef}
                  onChange={handleStatusUpload}
                />

                {currentUser.myStatus && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 flex justify-between items-center bg-[#f0f2f5] dark:bg-[#111b21] p-3 rounded-lg">
                      <div className="text-sm text-[#54656f] dark:text-[#aebac1]">
                        Viewed by {currentUser.myStatusViews?.length || 0}
                      </div>
                      <button
                        onClick={() =>
                          updateProfile({
                            myStatus: "",
                            myStatusTime: 0,
                            myStatusViews: [],
                          })
                        }
                        className="text-red-500 hover:opacity-80 text-sm font-medium"
                      >
                        Delete Status
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-[14px] font-medium text-[#667781] dark:text-[#8696a0] mb-4 pl-1">
                  Recent updates
                </div>
                {(() => {
                  const friendUids = chats
                    .filter((c) => c.type === "direct")
                    .flatMap((c) => c.members)
                    .filter((m) => m !== currentUser.uid);
                  const friendsWithUpdates = users.filter(
                    (u) => friendUids.includes(u.uid) && u.myStatus,
                  );
                  if (friendsWithUpdates.length === 0)
                    return (
                      <div className="text-center text-[#667781] dark:text-[#8696a0] p-4 text-sm">
                        No recent updates
                      </div>
                    );

                  return friendsWithUpdates.map((f) => (
                    <div
                      key={f.uid}
                      className="flex items-center gap-4 mb-4 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] p-2 rounded-lg"
                      onClick={() => {
                        setViewingStatus(f.myStatus || null);
                        useAppStore
                          .getState()
                          .addStatusView(f.uid, currentUser.uid);
                      }}
                    >
                      <img
                        src={f.myStatus ? f.myStatus : f.photoURL}
                        className="w-14 h-14 rounded-full border-[3px] border-[#25d366] p-[2px] object-cover"
                      />
                      <div className="flex-1 border-b border-[#f0f2f5] dark:border-[#202c33] pb-2">
                        <div className="font-medium text-[#111b21] dark:text-[#e9edef] text-[17px] flex items-center gap-1">
                          {f.displayName}
                          {f.isVerified && (
                            <BadgeCheck
                              size={16}
                              className="text-white fill-[#1da1f2] shrink-0"
                            />
                          )}
                        </div>
                        <div className="text-[14px] text-[#667781] dark:text-[#8696a0]">
                          {f.myStatusTime
                            ? format(new Date(f.myStatusTime), "h:mm a")
                            : ""}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}

            {activeTab === "channels" && (() => {
              const myChannels = channels.filter(
                (ch) => ch.ownerId === currentUser.uid || ch.followers.includes(currentUser.uid),
              );
              const trending = [...channels].sort((a, b) => {
                const postsA = channelPosts.filter((p) => p.channelId === a.id).length;
                const postsB = channelPosts.filter((p) => p.channelId === b.id).length;
                const recentA = Math.max(0, ...channelPosts.filter((p) => p.channelId === a.id).map((p) => p.createdAt), a.createdAt);
                const recentB = Math.max(0, ...channelPosts.filter((p) => p.channelId === b.id).map((p) => p.createdAt), b.createdAt);
                const scoreA = a.followers.length * 3 + postsA * 2 + recentA / 1e12;
                const scoreB = b.followers.length * 3 + postsB * 2 + recentB / 1e12;
                return scoreB - scoreA;
              });
              const filteredMy = myChannels.filter(
                (ch) => !searchQuery || ch.name.toLowerCase().includes(searchQuery.toLowerCase()) || ch.username?.toLowerCase().includes(searchQuery.toLowerCase()),
              );
              const renderChannelRow = (ch: typeof channels[number]) => (
                <div
                  key={ch.id}
                  onClick={() => setCurrentChannelId(ch.id)}
                  className={`flex items-center p-3 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#111b21] ${currentChannelId === ch.id ? "bg-[#f0f2f5] dark:bg-[#202c33]" : ""}`}
                >
                  <img
                    src={ch.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=25d366&color=fff`}
                    className="w-12 h-12 rounded-full shrink-0 mr-3 object-cover"
                  />
                  <div className="flex-1 truncate">
                    <div className="flex items-center gap-1 font-medium text-[16px] text-[#111b21] dark:text-[#e9edef] truncate">
                      {ch.name}
                      {ch.isVerified && <BadgeCheck size={15} className="text-white fill-[#1da1f2] shrink-0" />}
                    </div>
                    <div className="text-[13px] text-[#667781] dark:text-[#8696a0] truncate">
                      {ch.followers?.length || 0} followers · {ch.about || "Channel"}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFollowChannel(ch.id);
                    }}
                    className={`text-[13px] font-bold px-3 py-1.5 rounded-full shrink-0 ${
                      ch.followers?.includes(currentUser.uid)
                        ? "bg-[#f0f2f5] dark:bg-[#202c33] text-[#667781] dark:text-[#8696a0]"
                        : "bg-[#25d366] text-[#0b141a]"
                    }`}
                  >
                    {ch.followers?.includes(currentUser.uid) ? "Following" : "Follow"}
                  </button>
                </div>
              );

              return (
                <div className="flex flex-col h-full">
                  <div className="p-4 flex flex-col gap-2 shrink-0 border-b border-gray-100 dark:border-[#202c33]">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-[22px] font-bold text-[#111b21] dark:text-[#e9edef]">Channels</h2>
                      <div className="relative">
                        <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 text-[#54656f] dark:text-white">
                          <MoreVertical size={22} />
                        </button>
                        {menuOpen && (
                          <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#233138] shadow-xl rounded-2xl overflow-hidden z-50 py-2 border border-gray-100 dark:border-[#313d45]">
                            <button
                              onClick={() => { setShowNewChannel(true); setMenuOpen(false); }}
                              className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-[#3b4a54] dark:text-[#e9edef] text-[15px]"
                            >
                              <Radio size={18} /> Create Channel
                            </button>
                            <button
                              onClick={() => { setIsSearchingContacts(false); setMenuOpen(false); document.getElementById("channel-search-input")?.focus(); }}
                              className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-[#3b4a54] dark:text-[#e9edef] text-[15px]"
                            >
                              <Search size={18} /> Search
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f0f2f5] dark:bg-[#202c33]">
                      <Search size={18} className="text-[#54656f] dark:text-[#8696a0] shrink-0" />
                      <input
                        id="channel-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search channels"
                        className="flex-1 bg-transparent outline-none text-[15px] text-[#111b21] dark:text-[#e9edef] placeholder-[#8696a0]"
                      />
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => setChannelSubTab("my")}
                        className={`flex-1 py-2 rounded-lg text-[13px] font-bold ${channelSubTab === "my" ? "bg-[#00a884] text-white" : "bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1]"}`}
                      >
                        My Channels
                      </button>
                      <button
                        onClick={() => setChannelSubTab("explorer")}
                        className={`flex-1 py-2 rounded-lg text-[13px] font-bold flex items-center justify-center gap-1 ${channelSubTab === "explorer" ? "bg-[#00a884] text-white" : "bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1]"}`}
                      >
                        <TrendingUp size={14} /> Explorer
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {channelSubTab === "my" ? (
                      filteredMy.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center h-[250px]">
                          <div className="w-16 h-16 mb-4 text-white rounded-2xl flex items-center justify-center shadow-sm bg-[#54656f] dark:bg-[#202c33]">
                            <Radio size={32} />
                          </div>
                          <h2 className="text-[17px] font-bold text-[#111b21] dark:text-[#e9edef] mb-1">No channels yet</h2>
                          <p className="text-[#667781] dark:text-[#8696a0] leading-relaxed text-xs">
                            Create or follow a channel to see it here.
                          </p>
                        </div>
                      ) : (
                        filteredMy.map(renderChannelRow)
                      )
                    ) : showExplorerFull ? (
                      <>
                        <button
                          onClick={() => setShowExplorerFull(false)}
                          className="flex items-center gap-2 px-4 py-3 text-[#00a884] font-semibold text-sm"
                        >
                          <ArrowLeft size={16} /> Back
                        </button>
                        {trending.map(renderChannelRow)}
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 text-[13px] font-semibold text-[#667781] dark:text-[#8696a0]">
                          Trending channels
                        </div>
                        {trending.slice(0, 3).map(renderChannelRow)}
                        {trending.length > 0 && (
                          <button
                            onClick={() => setShowExplorerFull(true)}
                            className="w-full text-center py-3 text-[#00a884] font-semibold text-sm hover:bg-[#f5f6f6] dark:hover:bg-[#111b21]"
                          >
                            See all channels
                          </button>
                        )}
                        {trending.length === 0 && (
                          <div className="p-8 text-center text-[#667781] dark:text-[#8696a0] text-sm">No channels yet.</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            {activeTab === "calls" && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[22px] font-bold text-[#111b21] dark:text-[#e9edef]">
                    Calls
                  </h2>
                  {calls.length > 0 && (
                    <button
                      onClick={() => clearCallHistory()}
                      className="text-[13px] text-red-500 font-medium hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="text-[14px] font-medium text-[#667781] dark:text-[#8696a0] mb-3 pl-1">
                  Recent
                </div>
                {calls.filter(
                  (c) =>
                    c.callerId === currentUser.uid || c.calleeId === currentUser.uid,
                ).length === 0 ? (
                  <div className="text-center text-[#667781] dark:text-[#8696a0] p-4 text-sm">
                    No recent calls
                  </div>
                ) : (
                  calls
                    .filter(
                      (c) =>
                        c.callerId === currentUser.uid ||
                        c.calleeId === currentUser.uid,
                    )
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((call) => {
                      const outgoing = call.callerId === currentUser.uid;
                      const peer = users.find(
                        (u) => u.uid === (outgoing ? call.calleeId : call.callerId),
                      );
                      const missed = call.status === "missed" || call.status === "declined";
                      return (
                        <div
                          key={call.id}
                          className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-[#202c33]"
                        >
                          <img
                            src={peer?.photoURL}
                            className="w-12 h-12 rounded-full object-cover shrink-0"
                          />
                          <div className="flex-1 truncate">
                            <div className="font-medium text-[16px] text-[#111b21] dark:text-[#e9edef] flex items-center gap-1 truncate">
                              {peer?.displayName || "User"}
                              {peer?.isVerified && (
                                <BadgeCheck
                                  size={14}
                                  className="text-white fill-[#1da1f2] shrink-0"
                                />
                              )}
                            </div>
                            <div
                              className={`text-[13px] flex items-center gap-1 ${missed ? "text-red-500" : "text-[#667781] dark:text-[#8696a0]"}`}
                            >
                              {outgoing ? "Outgoing" : "Incoming"} ·{" "}
                              {format(new Date(call.createdAt), "MMM d, HH:mm")}
                            </div>
                          </div>
                          <button
                            onClick={() => peer && startCall(peer.uid, call.type)}
                            className="text-[#25d366] p-2"
                          >
                            {call.type === "video" ? (
                              <Video size={20} />
                            ) : (
                              <Phone size={20} />
                            )}
                          </button>
                        </div>
                      );
                    })
                )}
              </div>
            )}
          </div>

          {/* Floating Action Button */}
          {(activeTab === "chats" ||
            activeTab === "updates" ||
            activeTab === "calls") && (
            <button
              onClick={() => setView("contacts")}
              className="absolute bottom-[84px] right-4 bg-[#25d366] rounded-2xl flex items-center justify-center text-[#111b21] shadow-lg hover:bg-[#20c359] transition-colors z-20 px-4 py-3 gap-2 shrink-0"
            >
              {activeTab === "chats" ? (
                <>
                  <MessageSquare size={22} style={{ fill: "currentColor" }} />
                  <span className="font-bold text-[14px] pr-1">
                    Send message
                  </span>
                </>
              ) : activeTab === "updates" ? (
                <Camera size={22} style={{ fill: "currentColor" }} />
              ) : (
                <PhoneCall size={22} style={{ fill: "currentColor" }} />
              )}
            </button>
          )}

          {/* Bottom Navigation */}
          <div className="absolute bottom-0 w-full h-[70px] bg-white dark:bg-[#0b141a] border-t border-gray-100 dark:border-[#202c33] flex items-center justify-around z-30 pb-1">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "chats" ? "text-[#111b21] dark:text-white" : "text-[#667781] dark:text-[#aebac1] hover:text-[#111b21] dark:hover:text-white"}`}
            >
              <div
                className={`px-5 py-1 rounded-full transition-colors ${activeTab === "chats" ? "bg-[#d8fdd2] dark:bg-[#0f4523]" : ""}`}
              >
                <MessageSquare
                  size={24}
                  className={
                    activeTab === "chats"
                      ? "text-[#0b141a] dark:text-[#d8fdd2]"
                      : ""
                  }
                  style={activeTab === "chats" ? { fill: "currentColor" } : {}}
                />
              </div>
              <span className="text-[12px] font-bold">Chats</span>
            </button>
            <button
              onClick={() => setActiveTab("updates")}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "updates" ? "text-[#111b21] dark:text-white" : "text-[#667781] dark:text-[#aebac1] hover:text-[#111b21] dark:hover:text-white"}`}
            >
              <div
                className={`px-5 py-1 rounded-full transition-colors ${activeTab === "updates" ? "bg-[#d8fdd2] dark:bg-[#0f4523]" : ""}`}
              >
                <CircleDashed
                  size={24}
                  className={
                    activeTab === "updates"
                      ? "text-[#0b141a] dark:text-[#d8fdd2]"
                      : ""
                  }
                />
              </div>
              <span className="text-[12px] font-bold">Updates</span>
            </button>
            <button
              onClick={() => setActiveTab("channels")}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "channels" ? "text-[#111b21] dark:text-white" : "text-[#667781] dark:text-[#aebac1] hover:text-[#111b21] dark:hover:text-white"}`}
            >
              <div
                className={`px-5 py-1 rounded-full transition-colors ${activeTab === "channels" ? "bg-[#d8fdd2] dark:bg-[#0f4523]" : ""}`}
              >
                <Radio
                  size={24}
                  className={
                    activeTab === "channels"
                      ? "text-[#0b141a] dark:text-[#d8fdd2]"
                      : ""
                  }
                />
              </div>
              <span className="text-[12px] font-bold">Channels</span>
            </button>
            <button
              onClick={() => setActiveTab("calls")}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "calls" ? "text-[#111b21] dark:text-white" : "text-[#667781] dark:text-[#aebac1] hover:text-[#111b21] dark:hover:text-white"}`}
            >
              <div
                className={`px-5 py-1 rounded-full transition-colors ${activeTab === "calls" ? "bg-[#d8fdd2] dark:bg-[#0f4523]" : ""}`}
              >
                <Phone
                  size={24}
                  className={
                    activeTab === "calls"
                      ? "text-[#0b141a] dark:text-[#d8fdd2]"
                      : ""
                  }
                  style={
                    activeTab === "calls"
                      ? { fill: "currentColor", transform: "rotate(90deg)" }
                      : { transform: "rotate(90deg)" }
                  }
                />
              </div>
              <span className="text-[12px] font-bold">Calls</span>
            </button>
          </div>
        </>
      )}

      {/* Status Viewer Overlay */}
      {viewingStatus && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center">
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent z-10">
            <button
              onClick={() => setViewingStatus(null)}
              className="text-white hover:opacity-80 p-2"
            >
              <ArrowLeft size={28} />
            </button>
            {viewingStatus === currentUser.myStatus && (
              <button
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: "Delete Status Updates",
                    message: "Are you sure you want to delete your status update? It will be permanently removed for everyone.",
                    onConfirm: () => {
                      updateProfile({
                        myStatus: "",
                        myStatusTime: 0,
                        myStatusViews: [],
                      });
                      setViewingStatus(null);
                    }
                  });
                }}
                className="text-white hover:text-red-500 p-2 flex items-center gap-2"
              >
                <Trash2 size={22} className="shrink-0" />
                <span className="text-sm font-semibold">Delete</span>
              </button>
            )}
          </div>
          <div className="w-full max-w-md h-full flex flex-col pt-16 pb-4 relative">
            {/* Progress bar effect like WhatsApp */}
            <div className="w-full h-1 bg-white/20 rounded-full mb-4 px-2">
              <div className="w-full h-full bg-white rounded-full"></div>
            </div>
            <img
              src={viewingStatus}
              className="max-w-full max-h-[72vh] object-contain flex-1 mx-auto rounded-lg shadow-md"
            />
            {viewingStatus === currentUser.myStatus && (
              <div className="mt-4 text-center text-white bg-black/60 p-3 rounded-xl max-w-xs mx-auto text-sm">
                <div className="font-bold flex items-center justify-center gap-1.5 mb-1">
                  <span>Views:</span>{" "}
                  <span className="bg-[#25d366] text-[#0b141a] text-xs px-2 py-0.5 rounded-full font-bold">
                    {currentUser.myStatusViews?.length || 0}
                  </span>
                </div>
                {currentUser.myStatusViews &&
                currentUser.myStatusViews.length > 0 ? (
                  <div className="text-gray-300 text-xs overflow-x-auto whitespace-nowrap scrollbar-thin max-w-full p-1 leading-relaxed">
                    Checked by:{" "}
                    {currentUser.myStatusViews
                      .map(
                        (uid) =>
                          users.find((u) => u.uid === uid)?.displayName ||
                          "Someone",
                      )
                      .join(", ")}
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs">No views yet</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-[#222e35] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 text-left animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {confirmDialog.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 text-sm font-medium bg-red-500 text-white hover:bg-red-600 rounded-lg shadow-sm transition-colors"
               >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* New channel */}
      {showNewChannel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-[#222e35] rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Radio size={18} /> New channel
              </h3>
              <button onClick={() => setShowNewChannel(false)} className="text-gray-400">
                <X size={18} />
              </button>
            </div>
            <input
              autoFocus
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="Channel name"
              className="w-full mb-3 bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-2.5 outline-none text-[15px] text-[#111b21] dark:text-[#e9edef]"
            />
            <textarea
              value={newChannelAbout}
              onChange={(e) => setNewChannelAbout(e.target.value)}
              placeholder="Channel description"
              rows={3}
              className="w-full mb-4 bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-2.5 outline-none text-[15px] text-[#111b21] dark:text-[#e9edef] resize-none"
            />
            <button
              onClick={() => {
                if (!newChannelName.trim()) return;
                createChannel(newChannelName.trim(), newChannelAbout.trim());
                setNewChannelName("");
                setNewChannelAbout("");
                setShowNewChannel(false);
              }}
              className="w-full py-2.5 bg-[#25d366] text-[#0b141a] font-bold rounded-lg hover:bg-[#20c359] transition-colors"
            >
              Create channel
            </button>
          </div>
        </div>
      )}

      {/* Wallpaper picker */}
      {showWallpaper && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-[#222e35] rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ImageIcon size={18} /> Chat wallpaper
              </h3>
              <button onClick={() => setShowWallpaper(false)} className="text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {[
                "#efeae2",
                "#d1f4ff",
                "#dcf8c6",
                "#f5e6ff",
                "#ffe8d6",
                "#0b141a",
                "#1f2c34",
                "#12261f",
                "#2a1f33",
                "#332a1f",
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => updateProfile({ wallpaper: c })}
                  className="w-full aspect-square rounded-lg border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={wallpaperInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) =>
                  updateProfile({ wallpaper: ev.target?.result as string });
                reader.readAsDataURL(file);
              }}
            />
            <button
              onClick={() => wallpaperInputRef.current?.click()}
              className="w-full py-2.5 mb-2 bg-[#25d366] text-[#0b141a] font-bold rounded-lg hover:bg-[#20c359] transition-colors"
            >
              Upload photo
            </button>
            <button
              onClick={() => updateProfile({ wallpaper: "" })}
              className="w-full py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg"
            >
              Reset to default
            </button>
          </div>
        </div>
      )}

      {showVerifyModal && (
        <VerifyRequestModal onClose={() => setShowVerifyModal(false)} />
      )}

      {showCameraCapture && (
        <CameraCaptureModal
          onClose={() => setShowCameraCapture(false)}
          onCaptured={(photo) => {
            setCapturedPhoto(photo);
            setShowCameraCapture(false);
          }}
        />
      )}

      {capturedPhoto && (
        <SendPhotoToPicker
          photo={capturedPhoto}
          users={users.filter((u) => u.uid !== currentUser.uid && !u.isBanned)}
          onClose={() => setCapturedPhoto(null)}
          onSend={(uid) => {
            startChat(uid);
            const chat = useAppStore.getState().chats.find(
              (c) => c.type === "direct" && c.members.includes(currentUser.uid) && c.members.includes(uid),
            );
            if (chat) {
              try {
                useAppStore.getState().addMessage(chat.id, "Image", "image", capturedPhoto);
              } catch {}
            }
            setCapturedPhoto(null);
          }}
        />
      )}
    </div>
  );
}

function CameraCaptureModal({ onClose, onCaptured }: { onClose: () => void; onCaptured: (photo: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setError("Could not access camera. Please allow camera permission."));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onCaptured(dataUrl);
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]">
      <button onClick={onClose} className="absolute top-4 right-4 text-white p-2">
        <X size={28} />
      </button>
      {error ? (
        <div className="text-white text-center p-6">{error}</div>
      ) : (
        <video ref={videoRef} autoPlay playsInline muted className="max-w-full max-h-[80vh] rounded-lg" />
      )}
      {!error && (
        <button
          onClick={capture}
          className="mt-6 w-16 h-16 rounded-full bg-white border-4 border-[#25d366] shadow-lg active:scale-95 transition-transform"
          title="Capture photo"
        />
      )}
    </div>
  );
}

function SendPhotoToPicker({
  photo,
  users,
  onClose,
  onSend,
}: {
  photo: string;
  users: UserProfile[];
  onClose: () => void;
  onSend: (uid: string) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = users.filter((u) => !q || u.username.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-[#222e35] rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-gray-100 dark:border-[#313d45] flex items-center justify-between">
          <h3 className="font-bold text-[#111b21] dark:text-white">Send photo to...</h3>
          <button onClick={onClose} className="text-gray-400"><X size={18} /></button>
        </div>
        <img src={photo} className="w-full max-h-40 object-cover" />
        <div className="p-3 border-b border-gray-100 dark:border-[#313d45]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search username"
            className="w-full bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-2 text-sm outline-none text-[#111b21] dark:text-[#e9edef]"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((u) => (
            <button
              key={u.uid}
              onClick={() => onSend(u.uid)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-left"
            >
              <img src={u.photoURL} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <div className="font-medium text-[#111b21] dark:text-[#e9edef]">{u.displayName}</div>
                <div className="text-xs text-[#667781]">@{u.username}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
