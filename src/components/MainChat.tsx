import React, { useEffect, useState, useRef } from "react";
import { UserProfile, Message } from "../lib/types";
import { useAppStore, isUserOnline } from "../lib/store";
import {
  Smile,
  Paperclip,
  Mic,
  Send,
  MoreVertical,
  ArrowLeft,
  Search,
  X,
  Camera,
  BadgeCheck,
  UserPlus,
  Trash2,
  ShieldCheck,
  LogOut,
  Phone,
  Video,
  Ban,
  Star,
  Reply,
  Forward,
  Copy,
  Info,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Flag,
  FileText,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import EmojiPicker, { Theme } from "emoji-picker-react";

function GroupInfo({
  chatId,
  onClose,
  otherUser,
}: {
  chatId: string;
  onClose: () => void;
  otherUser: UserProfile | null;
}) {
  const {
    chats,
    users,
    updateGroup,
    currentUser,
    systemSettings,
    toggleBlockUser,
    isBlocked,
  } = useAppStore();
  const appName = systemSettings?.appName || "CK Chat";
  const chatInfo = chats.find((c) => c.id === chatId);

  const [newGroupName, setNewGroupName] = useState(chatInfo?.name || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  if (!chatInfo) return null;

  const isAdmin =
    chatInfo.type === "group" &&
    (chatInfo.admins?.includes(currentUser?.uid || "") ||
      chatInfo.createdBy === currentUser?.uid ||
      currentUser?.isAdmin);

  const handleUpdateAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEditInfo || !e.target.files?.[0]) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      updateGroup(chatId, { avatarUrl: event.target?.result as string });
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleSaveName = () => {
    if (newGroupName.trim() && newGroupName !== chatInfo.name) {
      updateGroup(chatId, { name: newGroupName });
    }
    setIsEditingName(false);
  };

  const handleRemoveMember = (uid: string) => {
    if (!isAdmin) return;
    const memberName = users.find((x) => x.uid === uid)?.displayName || "this user";
    setConfirmDialog({
      isOpen: true,
      title: "Remove Participant",
      message: `Are you sure you want to remove ${memberName} from this group?`,
      onConfirm: () => {
        updateGroup(chatId, { members: chatInfo.members.filter((m) => m !== uid) });
      },
    });
  };

  const handleToggleAdmin = (uid: string) => {
    if (!isAdmin) return;
    const isCurrentlyAdmin = chatInfo.admins?.includes(uid);
    if (isCurrentlyAdmin) {
      updateGroup(chatId, { admins: chatInfo.admins?.filter((a) => a !== uid) });
    } else {
      updateGroup(chatId, { admins: [...(chatInfo.admins || []), uid] });
    }
  };

  const canEditInfo = isAdmin || !chatInfo.onlyAdminsEditInfo;
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(chatInfo.description || "");
  const isGroup = chatInfo.type === "group";
  const displayAvatar = isGroup
    ? chatInfo.avatarUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(chatInfo.name)}&background=8696a0&color=fff`
    : otherUser?.photoURL;
  const displayName = isGroup ? chatInfo.name : otherUser?.displayName;

  const [addingMember, setAddingMember] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  const handleAddMember = (uid: string) => {
    if (!isAdmin) return;
    updateGroup(chatId, { members: [...chatInfo.members, uid] });
    setAddingMember(false);
    setMemberSearch("");
  };

  if (addingMember) {
    const availableUsers = users.filter(
      (u) =>
        !chatInfo.members.includes(u.uid) &&
        (u.displayName.toLowerCase().includes(memberSearch.toLowerCase()) ||
          u.username.toLowerCase().includes(memberSearch.toLowerCase())),
    );
    return (
      <div className="w-full lg:w-[350px] h-full bg-white dark:bg-[#111b21] flex flex-col shrink-0 border-l border-[#f0f2f5] dark:border-[#202c33] z-20 absolute lg:relative right-0">
        <div className="h-[60px] bg-[#f0f2f5] dark:bg-[#202c33] px-4 flex items-center gap-4 border-b border-[#f0f2f5] dark:border-[#202c33] shrink-0">
          <button
            onClick={() => setAddingMember(false)}
            className="text-[#54656f] dark:text-[#aebac1] hover:text-[#111b21] dark:hover:text-[#e9edef]"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-[16px] font-medium text-[#111b21] dark:text-[#e9edef]">
            Add Members
          </h2>
        </div>
        <div className="p-3 border-b border-[#f0f2f5] dark:border-[#202c33]">
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg flex items-center px-3 py-1">
            <Search size={18} className="text-[#54656f] dark:text-[#8696a0]" />
            <input
              autoFocus
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search users"
              className="bg-transparent w-full p-2 outline-none text-sm text-[#111b21] dark:text-[#e9edef]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {availableUsers.map((u) => (
            <div
              key={u.uid}
              onClick={() => handleAddMember(u.uid)}
              className="flex items-center px-4 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] cursor-pointer"
            >
              <img src={u.photoURL} className="w-10 h-10 rounded-full mr-4 object-cover" />
              <div className="flex-1">
                <div className="font-medium text-[#111b21] dark:text-[#e9edef]">
                  {u.displayName}
                </div>
                <div className="text-xs text-[#667781]">@{u.username}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const blocked = otherUser ? isBlocked(otherUser.uid) : false;

  return (
    <div className="w-full lg:w-[350px] h-full bg-white dark:bg-[#0b141a] flex flex-col shrink-0 border-l border-[#f0f2f5] dark:border-[#202c33] z-20 absolute lg:relative right-0">
      <div className="h-[60px] bg-[#f0f2f5] dark:bg-[#202c33] px-4 flex items-center gap-4 border-b border-[#f0f2f5] dark:border-[#202c33] shrink-0">
        <button
          onClick={onClose}
          className="text-[#54656f] dark:text-[#aebac1] hover:text-[#111b21] dark:hover:text-[#e9edef]"
        >
          <X size={24} />
        </button>
        <h2 className="text-[16px] font-medium text-[#111b21] dark:text-[#e9edef]">
          Contact info
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white dark:bg-[#111b21] p-6 flex flex-col items-center shadow-sm mb-2 relative group">
          <img
            src={displayAvatar}
            className={`w-48 h-48 rounded-full object-cover shadow-md mb-4 ${isAdmin && isGroup ? "cursor-pointer hover:opacity-80" : ""}`}
            onClick={() => canEditInfo && isGroup && fileInputRef.current?.click()}
          />
          {canEditInfo && isGroup && (
            <div className="absolute top-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a3942] rounded-full p-2 text-gray-500 shadow-xl hidden group-hover:block pointer-events-none">
              <Camera size={20} />
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleUpdateAvatar}
          />

          {isEditingName && isGroup ? (
            <div className="flex items-center w-full gap-2 px-6">
              <input
                autoFocus
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full bg-transparent border-b-2 border-[#00a884] text-center text-[20px] outline-none"
              />
              <button onClick={handleSaveName} className="text-[#00a884]">
                <Check size={24} />
              </button>
            </div>
          ) : (
            <h2
              className="text-[22px] font-medium text-[#111b21] dark:text-[#e9edef] flex items-center gap-1 cursor-pointer"
              onClick={() => canEditInfo && isGroup && setIsEditingName(true)}
            >
              {displayName}
              {!isGroup && otherUser?.isVerified && (
                <BadgeCheck size={18} className="text-white fill-[#1da1f2] shrink-0" />
              )}
            </h2>
          )}

          {!isGroup && (
            <p className="text-[15px] font-medium text-[#667781] mt-1">@{otherUser?.username}</p>
          )}
          {isGroup && (
            <p className="text-[15px] text-[#667781] mt-1">
              Group · {chatInfo.members.length} participants
            </p>
          )}
        </div>

        {!isGroup && (
          <div className="bg-white dark:bg-[#111b21] p-4 shadow-sm mb-2">
            <div className="text-[14px] text-[#00a884] font-medium mb-1">About</div>
            <div className="text-[16px] text-[#111b21] dark:text-[#e9edef]">
              {otherUser?.bio || `Hey there! I am using ${appName}.`}
            </div>
          </div>
        )}

        {isGroup && (
          <div className="bg-white dark:bg-[#111b21] p-4 shadow-sm mb-2">
            <div className="text-[14px] text-[#00a884] font-medium mb-1">Description</div>
            {isEditingDesc ? (
              <div className="flex items-start gap-2">
                <textarea
                  autoFocus
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  className="flex-1 bg-transparent border border-[#00a884] rounded-md p-2 text-[15px] outline-none"
                  rows={2}
                />
                <button
                  onClick={() => {
                    updateGroup(chatId, { description: descDraft });
                    setIsEditingDesc(false);
                  }}
                  className="text-[#00a884] shrink-0"
                >
                  <Check size={20} />
                </button>
              </div>
            ) : (
              <div
                className={`text-[15px] text-[#111b21] dark:text-[#e9edef] ${canEditInfo ? "cursor-pointer" : ""}`}
                onClick={() => canEditInfo && setIsEditingDesc(true)}
              >
                {chatInfo.description || (canEditInfo ? "Tap to add group description" : "No description")}
              </div>
            )}
          </div>
        )}

        {isGroup && isAdmin && (
          <div className="bg-white dark:bg-[#111b21] shadow-sm mb-2 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-[#111b21] dark:text-[#e9edef]">Only admins can send messages</span>
              <button
                onClick={() => updateGroup(chatId, { onlyAdminsMessage: !chatInfo.onlyAdminsMessage })}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${chatInfo.onlyAdminsMessage ? "bg-[#00a884]" : "bg-gray-300 dark:bg-gray-600"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${chatInfo.onlyAdminsMessage ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-[#111b21] dark:text-[#e9edef]">Only admins can edit group info</span>
              <button
                onClick={() => updateGroup(chatId, { onlyAdminsEditInfo: !chatInfo.onlyAdminsEditInfo })}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${chatInfo.onlyAdminsEditInfo ? "bg-[#00a884]" : "bg-gray-300 dark:bg-gray-600"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${chatInfo.onlyAdminsEditInfo ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        )}

        {isGroup && (
          <div className="bg-white dark:bg-[#111b21] shadow-sm mb-2 flex flex-col">
            <div className="text-[14px] text-[#8696a0] font-medium px-6 py-4 flex items-center justify-between">
              <span>{chatInfo.members.length} participants</span>
            </div>
            <div className="flex flex-col">
              {isAdmin && (
                <div
                  onClick={() => setAddingMember(true)}
                  className="flex items-center px-6 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white mr-4">
                    <UserPlus size={20} />
                  </div>
                  <div className="font-medium text-[16px] text-[#111b21] dark:text-[#e9edef]">
                    Add members
                  </div>
                </div>
              )}
              {chatInfo.members.map((memberId) => {
                const u = users.find((x) => x.uid === memberId);
                if (!u) return null;
                const memberIsAdmin = chatInfo.admins?.includes(u.uid);
                const isMe = u.uid === currentUser?.uid;

                return (
                  <div
                    key={u.uid}
                    className="flex items-center px-6 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] group transition-colors cursor-pointer"
                  >
                    <img src={u.photoURL} className="w-10 h-10 rounded-full mr-4 object-cover" />
                    <div className="flex-1 truncate">
                      <div className="font-medium text-[16px] text-[#111b21] dark:text-[#e9edef] flex items-center gap-1">
                        {isMe ? "You" : u.displayName}
                        {u.isVerified && (
                          <BadgeCheck size={14} className="text-white fill-[#1da1f2] shrink-0" />
                        )}
                      </div>
                      <div className="text-[13px] text-[#667781] truncate">
                        {u.bio || "Available"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {memberIsAdmin && (
                        <span className="text-[11px] font-medium text-[#00a884] border border-[#00a884] px-1 rounded truncate">
                          Group Admin
                        </span>
                      )}
                      {isAdmin && !isMe && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleAdmin(u.uid);
                            }}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-[#00a884] transition-colors"
                            title={memberIsAdmin ? "Demote Admin" : "Make Admin"}
                          >
                            <ShieldCheck size={16} className={memberIsAdmin ? "text-[#00a884]" : ""} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMember(u.uid);
                            }}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove from Group"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isGroup && (
          <div className="p-4 bg-white dark:bg-[#111b21] shadow-sm flex flex-col gap-2 mt-2">
            <button
              onClick={() => {
                setConfirmDialog({
                  isOpen: true,
                  title: "Leave Group",
                  message:
                    "Are you sure you want to leave this group? You will no longer receive or send messages here.",
                  onConfirm: () => {
                    useAppStore.getState().leaveGroup(chatId, currentUser?.uid || "");
                    onClose();
                  },
                });
              }}
              className="w-full flex items-center justify-center gap-2 py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors font-medium text-sm"
            >
              <LogOut size={16} />
              Leave Group
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: "Delete Group permanently",
                    message:
                      "Are you sure you want to delete this group permanently? All history and data will be gone forever.",
                    onConfirm: () => {
                      useAppStore.getState().deleteGroup(chatId);
                      onClose();
                    },
                  });
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm shadow-sm"
              >
                <Trash2 size={16} />
                Delete Group
              </button>
            )}
          </div>
        )}

        {!isGroup && otherUser && (
          <div className="p-4 bg-white dark:bg-[#111b21] shadow-sm flex flex-col gap-2 mt-2">
            <button
              onClick={() => {
                const reason = window.prompt(`Report ${otherUser.displayName}? Please describe the reason:`);
                if (reason && reason.trim()) {
                  useAppStore.getState().addReport('user', otherUser.uid, reason.trim());
                  alert('Report submitted. Thank you.');
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-colors border border-orange-400 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20"
            >
              <Flag size={16} />
              Report {otherUser.displayName}
            </button>
            <button
              onClick={() => {
                if (blocked) {
                  toggleBlockUser(otherUser.uid);
                  return;
                }
                setConfirmDialog({
                  isOpen: true,
                  title: "Block user",
                  message: `Are you sure you want to block ${otherUser.displayName}? They will no longer be able to message or call you.`,
                  onConfirm: () => toggleBlockUser(otherUser.uid),
                });
              }}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-colors border ${
                blocked
                  ? "border-[#00a884] text-[#00a884] hover:bg-[#00a884]/10"
                  : "border-red-500 text-red-500 hover:bg-red-500/10"
              }`}
            >
              <Ban size={16} />
              {blocked ? `Unblock ${otherUser.displayName}` : `Block ${otherUser.displayName}`}
            </button>
            <button
              onClick={() => {
                setConfirmDialog({
                  isOpen: true,
                  title: "Delete Chat Conversation",
                  message:
                    "Are you sure you want to delete this chat conversation? All messages will be permanently cleared from your view.",
                  onConfirm: () => {
                    useAppStore.getState().deleteChat(chatId);
                    onClose();
                  },
                });
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm shadow-sm"
            >
              <Trash2 size={16} />
              Delete Chat
            </button>
          </div>
        )}
      </div>

      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-[#222e35] rounded-2xl max-w-xs w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 text-left">
            <h3 className="text-md font-bold text-gray-900 dark:text-white mb-2">
              {confirmDialog.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="px-3.5 py-1.5 text-xs font-medium bg-red-500 text-white hover:bg-red-600 rounded-lg shadow-sm transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------- Message ticks --------------------------- */
function Ticks({ status }: { status?: string }) {
  if (status === "read")
    return <CheckCheck size={15} className="text-[#53bdeb] ml-1 shrink-0" />;
  if (status === "delivered")
    return <CheckCheck size={15} className="text-[#8696a0] ml-1 shrink-0" />;
  return <Check size={15} className="text-[#8696a0] ml-1 shrink-0" />;
}

export default function MainChat({
  currentUser,
  chatId,
}: {
  currentUser: UserProfile;
  chatId: string;
}) {
  const {
    chats,
    messages,
    users,
    addMessage,
    setSidebarOpen,
    systemSettings,
    isDarkMode,
    markChatRead,
    toggleStarMessage,
    forwardMessage,
    startCall,
    toggleBlockUser,
    isBlocked,
    isBlockedBy,
    reactToMessage,
    addReport,
    startGroupCall,
    currentUser: storeCurrentUser,
  } = useAppStore();
  const [text, setText] = useState("");
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [activeMsgId, setActiveMsgId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [forwardMsgId, setForwardMsgId] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<Message | null>(null);
  const [errorToast, setErrorToast] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [msgMenuId, setMsgMenuId] = useState<string | null>(null);
  const longPressTimer = useRef<any>(null);
  const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const chatInfo = chats.find((c) => c.id === chatId);

  let otherUser: UserProfile | null = null;
  if (chatInfo?.type === "direct") {
    const otherId = chatInfo.members.find((m) => m !== currentUser.uid);
    otherUser = users.find((u) => u.uid === otherId) || null;
  }

  const blockedByMe = otherUser ? isBlocked(otherUser.uid) : false;
  const blockedByThem = otherUser ? isBlockedBy(otherUser.uid) : false;

  const chatName =
    chatInfo?.type === "group" ? chatInfo.name : otherUser?.displayName || "User";
  const chatAvatar =
    chatInfo?.type === "group"
      ? chatInfo.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(chatInfo.name)}&background=8696a0&color=fff`
      : otherUser?.photoURL;
  const groupIsAdmin =
    chatInfo?.type === "group" &&
    (chatInfo.admins?.includes(currentUser.uid) || chatInfo.createdBy === currentUser.uid || currentUser.isAdmin);
  const groupBlocksMe = !!(chatInfo?.type === "group" && chatInfo.onlyAdminsMessage && !groupIsAdmin);
  const isInputMuted =
    (!systemSettings.chatEnabled && !currentUser.isAdmin) || blockedByMe || blockedByThem || groupBlocksMe;

  const chatMessages = messages
    .filter((m) => m.chatId === chatId)
    .filter((m) => !m.deletedFor?.includes(currentUser.uid))
    .filter((m) => !searchQuery || m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.createdAt - b.createdAt);

  // Blue ticks: mark incoming messages read while the chat is open
  useEffect(() => {
    markChatRead(chatId);
  }, [chatId, messages.length]);

  useEffect(() => {
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [chatMessages.length, chatId]);

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(""), 3000);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isInputMuted) return;
    try {
      addMessage(chatId, text, "none", undefined, replyTo ? { replyToId: replyTo.id } : undefined);
      setText("");
      setReplyTo(null);
      setShowEmojiPicker(false);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err: any) {
      showError(err.message || "Message could not be sent");
    }
  };

  const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024; // 15MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isInputMuted || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > MAX_ATTACHMENT_BYTES) {
      showError("File is too large. Maximum size is 15MB.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const mediaType: "image" | "video" | "file" = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : "file";
      try {
        addMessage(chatId, mediaType === "image" ? "Image" : mediaType === "video" ? "Video" : file.name, mediaType, result, {
          fileName: file.name,
          fileSize: file.size,
        });
      } catch (err: any) {
        showError(err.message);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const startRecording = async () => {
    if (isInputMuted) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        clearInterval(recordingTimerRef.current);
        const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            addMessage(
              chatId,
              `Voice message (${formatDuration(recordingDuration)})`,
              "audio",
              e.target?.result as string,
            );
          } catch (err: any) {
            showError(err.message);
          }
        };
        reader.readAsDataURL(audioBlob);
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
    } catch (error: any) {
      showError("Could not access microphone. Open the app in a new tab to allow access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleCall = (type: "voice" | "video") => {
    if (!otherUser) return;
    try {
      startCall(otherUser.uid, type);
    } catch (err: any) {
      showError(err.message);
    }
  };

  const presence = otherUser
    ? isUserOnline(otherUser)
      ? "online"
      : `last seen ${format(new Date(otherUser.lastSeen || Date.now()), "h:mm a")}`
    : "";

  const wallpaper = currentUser.wallpaper;
  const wallpaperIsImage = !!wallpaper && wallpaper.startsWith("data:");

  return (
    <div className="flex w-full h-full relative overflow-hidden">
      <div
        className={`flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a] relative flex-1 transition-all ${showGroupInfo ? "hidden border-r dark:border-[#202c33] border-[#f0f2f5] lg:flex lg:w-[calc(100%-350px)]" : "w-full"} overflow-hidden`}
        style={
          wallpaper && !wallpaperIsImage ? { backgroundColor: wallpaper } : undefined
        }
      >
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={
            wallpaperIsImage
              ? {
                  backgroundImage: `url(${wallpaper})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.45,
                }
              : {
                  backgroundImage:
                    'url("https://www.transparenttextures.com/patterns/cubes.png")',
                  backgroundRepeat: "repeat",
                  opacity: 0.06,
                }
          }
        />

        {/* Header */}
        <div className="h-[60px] bg-white dark:bg-[#0b141a] px-4 flex items-center justify-between z-20 border-b border-[#f0f2f5] dark:border-[#202c33] shrink-0">
          {searchOpen ? (
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="text-[#54656f] dark:text-white"
              >
                <ArrowLeft size={24} />
              </button>
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in chat"
                className="flex-1 bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-2 outline-none text-[15px] text-[#111b21] dark:text-[#e9edef]"
              />
            </div>
          ) : (
            <>
              <div
                className="flex items-center flex-1 cursor-pointer min-w-0"
                onClick={() => setShowGroupInfo(true)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSidebarOpen(true);
                  }}
                  className="lg:hidden text-[#111b21] dark:text-white mr-3"
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="relative mr-3 shrink-0">
                  <img
                    src={chatAvatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover shadow-sm"
                  />
                  {otherUser && isUserOnline(otherUser) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25d366] rounded-full border-2 border-white dark:border-[#0b141a]" />
                  )}
                </div>
                <div className="flex-1 truncate">
                  <h3 className="text-[17px] font-medium text-[#111b21] dark:text-[#e9edef] leading-tight flex items-center gap-1">
                    {chatName}
                    {chatInfo?.type === "direct" && otherUser?.isVerified && (
                      <BadgeCheck size={16} className="text-white fill-[#1da1f2] shrink-0" />
                    )}
                  </h3>
                  <p className="text-[13px] text-[#667781] dark:text-[#8696a0] truncate">
                    {chatInfo?.type === "group"
                      ? chatInfo.members
                          .map((mid) => users.find((u) => u.uid === mid)?.displayName)
                          .filter(Boolean)
                          .join(", ")
                      : presence}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-5 text-[#54656f] dark:text-white shrink-0 relative">
                {chatInfo?.type === "direct" && systemSettings.callsEnabled !== false && (
                  <>
                    <button onClick={() => handleCall("video")} title="Video call">
                      <Video size={22} className="cursor-pointer hover:opacity-80" />
                    </button>
                    <button onClick={() => handleCall("voice")} title="Voice call">
                      <Phone size={20} className="cursor-pointer hover:opacity-80" />
                    </button>
                  </>
                )}
                {chatInfo?.type === "group" &&
                  systemSettings.callsEnabled !== false &&
                  (!chatInfo.onlyAdminsMessage || groupIsAdmin) && (
                    <button
                      onClick={() => {
                        try {
                          startGroupCall(chatId, "voice");
                        } catch (err: any) {
                          showError(err.message);
                        }
                      }}
                      title="Group voice call"
                    >
                      <Phone size={20} className="cursor-pointer hover:opacity-80" />
                    </button>
                  )}
                <button onClick={() => setHeaderMenuOpen(!headerMenuOpen)}>
                  <MoreVertical size={22} className="cursor-pointer hover:opacity-80" />
                </button>
                {headerMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-[#233138] shadow-xl rounded-2xl overflow-hidden z-50 py-2 border border-gray-100 dark:border-[#313d45] text-[#3b4a54] dark:text-[#e9edef]">
                    <button
                      onClick={() => {
                        setShowGroupInfo(true);
                        setHeaderMenuOpen(false);
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-[15px]"
                    >
                      <Info size={18} /> {chatInfo?.type === "group" ? "Group info" : "Contact info"}
                    </button>
                    <button
                      onClick={() => {
                        setSearchOpen(true);
                        setHeaderMenuOpen(false);
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-[15px]"
                    >
                      <Search size={18} /> Search
                    </button>
                    {chatInfo?.type === "direct" && otherUser && (
                      <button
                        onClick={() => {
                          setHeaderMenuOpen(false);
                          if (blockedByMe) {
                            toggleBlockUser(otherUser!.uid);
                            return;
                          }
                          setConfirmDialog({
                            isOpen: true,
                            title: "Block user",
                            message: `Are you sure you want to block ${otherUser!.displayName}? They will no longer be able to message or call you.`,
                            onConfirm: () => toggleBlockUser(otherUser!.uid),
                          });
                        }}
                        className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-[15px]"
                      >
                        <Ban size={18} /> {blockedByMe ? "Unblock user" : "Block user"}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setConfirmDialog({
                          isOpen: true,
                          title: "Clear chat",
                          message: "Delete all messages of this conversation?",
                          onConfirm: () => {
                            chatMessages.forEach((m) =>
                              useAppStore.getState().deleteMessage(m.id),
                            );
                          },
                        });
                        setHeaderMenuOpen(false);
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-[15px]"
                    >
                      <Trash2 size={18} /> Clear chat
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDialog({
                          isOpen: true,
                          title: chatInfo?.type === "group" ? "Exit group" : "Delete chat",
                          message:
                            chatInfo?.type === "group"
                              ? "Leave this group?"
                              : "Delete this conversation permanently?",
                          onConfirm: () => {
                            if (chatInfo?.type === "group") {
                              useAppStore.getState().leaveGroup(chatId, currentUser.uid);
                            } else {
                              useAppStore.getState().deleteChat(chatId);
                            }
                          },
                        });
                        setHeaderMenuOpen(false);
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-red-500 text-[15px]"
                    >
                      <LogOut size={18} />{" "}
                      {chatInfo?.type === "group" ? "Exit group" : "Delete chat"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {!systemSettings.chatEnabled && !currentUser.isAdmin && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-600 px-4 py-2 text-sm text-center font-medium z-10 shadow-sm border-b border-yellow-200 dark:border-yellow-800/50">
            {systemSettings.disabledMessage}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 z-10 flex flex-col gap-2 min-h-0">
          <div className="self-center bg-[#d1f4ff] dark:bg-[#182229] px-3 py-1 rounded-lg shadow-sm text-[11px] text-[#54656f] dark:text-[#8696a0] mb-2 uppercase">
            Started on {chatInfo ? format(new Date(chatInfo.createdAt), "PP") : ""}
          </div>
          {chatMessages.map((msg) => {
            const isMine = msg.senderId === currentUser.uid;
            const msgSender = users.find((u) => u.uid === msg.senderId);
            const repliedTo = msg.replyToId
              ? messages.find((m) => m.id === msg.replyToId)
              : null;

            if (msg.isSystem) {
              return (
                <div key={msg.id} className="self-center my-1">
                  <span className="bg-[#ffffff] dark:bg-[#182229] text-[12px] text-[#54656f] dark:text-[#8696a0] px-3 py-1 rounded-lg shadow-sm">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isDeleted = msg.deletedForEveryone;
            const startLongPress = () => {
              longPressTimer.current = setTimeout(() => setMsgMenuId(msg.id), 500);
            };
            const cancelLongPress = () => {
              if (longPressTimer.current) clearTimeout(longPressTimer.current);
            };

            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setMsgMenuId(msg.id);
                  }}
                  onTouchStart={startLongPress}
                  onTouchEnd={cancelLongPress}
                  onTouchMove={cancelLongPress}
                  className={`max-w-[85%] sm:max-w-[75%] p-1.5 pb-2 rounded-lg shadow-sm relative group transition-all select-none ${
                    isMine
                      ? "bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tr-none"
                      : "bg-white dark:bg-[#202c33] rounded-tl-none"
                  }`}
                >
                  {/* 3-dot message menu */}
                  <button
                    onClick={() => setActiveMsgId(activeMsgId === msg.id ? null : msg.id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-[#8696a0] p-0.5"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {msgMenuId === msg.id && (
                    <div className="absolute z-[70] top-6 right-0 w-56 bg-white dark:bg-[#233138] shadow-xl rounded-xl overflow-hidden py-1.5 border border-gray-100 dark:border-[#313d45] text-[14px] text-[#3b4a54] dark:text-[#e9edef]">
                      <div className="flex items-center justify-around px-2 py-2 border-b border-gray-100 dark:border-[#313d45]">
                        {REACTION_EMOJIS.map((emo) => (
                          <button
                            key={emo}
                            onClick={() => {
                              reactToMessage(msg.id, emo);
                              setMsgMenuId(null);
                            }}
                            className="text-xl hover:scale-125 transition-transform"
                          >
                            {emo}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          useAppStore.getState().deleteMessage(msg.id, false);
                          setMsgMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3"
                      >
                        <Trash2 size={16} /> Delete for me
                      </button>
                      {isMine && (
                        <button
                          onClick={() => {
                            useAppStore.getState().deleteMessage(msg.id, true);
                            setMsgMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-red-500"
                        >
                          <Trash2 size={16} /> Delete for everyone
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const reason = window.prompt("Report this message. Please describe the reason:");
                          if (reason && reason.trim()) {
                            addReport("message", msg.id, reason.trim());
                            alert("Report submitted. Thank you.");
                          }
                          setMsgMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-orange-500"
                      >
                        <Flag size={16} /> Report
                      </button>
                    </div>
                  )}

                  {activeMsgId === msg.id && (
                    <div className="absolute top-6 right-0 w-48 bg-white dark:bg-[#233138] shadow-xl rounded-xl overflow-hidden z-[60] py-1.5 border border-gray-100 dark:border-[#313d45] text-[14px] text-[#3b4a54] dark:text-[#e9edef]">
                      <button
                        onClick={() => {
                          setReplyTo(msg);
                          setActiveMsgId(null);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3"
                      >
                        <Reply size={16} /> Reply
                      </button>
                      <button
                        onClick={() => {
                          setForwardMsgId(msg.id);
                          setActiveMsgId(null);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3"
                      >
                        <Forward size={16} /> Forward
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(msg.text);
                          setActiveMsgId(null);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3"
                      >
                        <Copy size={16} /> Copy
                      </button>
                      <button
                        onClick={() => {
                          toggleStarMessage(msg.id);
                          setActiveMsgId(null);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3"
                      >
                        <Star size={16} /> {msg.starred ? "Unstar" : "Star"}
                      </button>
                      <button
                        onClick={() => {
                          setInfoMsg(msg);
                          setActiveMsgId(null);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3"
                      >
                        <Info size={16} /> Message info
                      </button>
                      <button
                        onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            title: "Delete Message",
                            message: "Delete this message permanently?",
                            onConfirm: () => useAppStore.getState().deleteMessage(msg.id),
                          });
                          setActiveMsgId(null);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-red-500"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}

                  {!isMine && chatInfo?.type === "group" && (
                    <p className="text-[13px] font-medium text-[#e542a3] mb-0.5 px-1 pt-0.5">
                      {msgSender?.displayName || "User"}
                    </p>
                  )}

                  {msg.forwarded && (
                    <div className="text-[11px] italic text-[#8696a0] px-1 flex items-center gap-1">
                      <Forward size={11} /> Forwarded
                    </div>
                  )}

                  {repliedTo && (
                    <div className="bg-black/5 dark:bg-black/25 border-l-4 border-[#25d366] rounded p-1.5 mb-1 mx-0.5">
                      <div className="text-[11px] font-semibold text-[#25d366]">
                        {repliedTo.senderId === currentUser.uid
                          ? "You"
                          : users.find((u) => u.uid === repliedTo.senderId)?.displayName}
                      </div>
                      <div className="text-[12px] text-[#54656f] dark:text-[#aebac1] truncate max-w-[220px]">
                        {repliedTo.text || "Media"}
                      </div>
                    </div>
                  )}

                  {isDeleted ? (
                    <div className="text-[13.5px] italic text-[#8696a0] px-1.5 py-1 flex items-center gap-1">
                      🚫 This message was deleted
                    </div>
                  ) : (
                  <>
                  {msg.mediaType === "image" && msg.mediaUrl && (
                    <div className="mb-1 rounded overflow-hidden">
                      <img
                        src={msg.mediaUrl}
                        alt="Attached"
                        className="w-[300px] max-w-full h-auto rounded-md object-cover"
                      />
                    </div>
                  )}

                  {msg.mediaType === "audio" && (
                    <div className="flex items-center gap-2 mb-1 min-w-[220px] px-1 py-1">
                      {/* Sender avatar at the start of every voice note */}
                      <img
                        src={msgSender?.photoURL}
                        alt={msgSender?.displayName}
                        className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/50 shadow-sm"
                      />
                      <audio controls src={msg.mediaUrl} className="w-full max-w-[220px] h-10" />
                    </div>
                  )}

                  {msg.mediaType === "video" && msg.mediaUrl && (
                    <div className="mb-1 rounded overflow-hidden">
                      <video src={msg.mediaUrl} controls className="w-[280px] max-w-full h-auto rounded-md" />
                    </div>
                  )}

                  {msg.mediaType === "file" && msg.mediaUrl && (
                    <a
                      href={msg.mediaUrl}
                      download={msg.fileName || "file"}
                      className="flex items-center gap-3 bg-black/5 dark:bg-black/25 rounded-lg p-3 mb-1 min-w-[220px] hover:opacity-90"
                    >
                      <FileText size={28} className="text-[#54656f] dark:text-[#aebac1] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-medium truncate text-[#111b21] dark:text-[#e9edef]">
                          {msg.fileName || "File"}
                        </div>
                        <div className="text-[11px] text-[#667781] dark:text-[#8696a0]">
                          {formatFileSize(msg.fileSize)}
                        </div>
                      </div>
                      <Download size={18} className="text-[#54656f] dark:text-[#aebac1] shrink-0" />
                    </a>
                  )}

                  <div className="text-[14.2px] text-[#111b21] dark:text-[#e9edef] px-1.5 break-words w-full">
                    {msg.text !== "Image" && msg.mediaType !== "file" ? msg.text : ""}
                    <span className="inline-block w-[70px] h-1" />
                  </div>
                  </>
                  )}

                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 px-1.5 mt-1">
                      {Object.entries(
                        Object.values(msg.reactions).reduce((acc: Record<string, number>, emo) => {
                          acc[emo] = (acc[emo] || 0) + 1;
                          return acc;
                        }, {}),
                      ).map(([emo, count]) => (
                        <button
                          key={emo}
                          onClick={() => reactToMessage(msg.id, emo)}
                          className="bg-white dark:bg-[#2a3942] border border-gray-200 dark:border-[#3b4a54] rounded-full px-1.5 py-0.5 text-[11px] flex items-center gap-0.5 shadow-sm"
                        >
                          <span>{emo}</span>
                          {count > 1 && <span className="text-[#667781] dark:text-[#8696a0]">{count}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  <div
                    className={`text-[11px] text-[#667781] dark:text-[#ffffff99] flex items-center justify-end px-1.5 ${msg.mediaType !== "none" ? "mt-1" : "absolute bottom-1 right-1.5"}`}
                  >
                    {msg.starred && <Star size={11} className="mr-1 fill-current" />}
                    {msg.createdAt ? format(new Date(msg.createdAt), "HH:mm") : "..."}
                    {isMine && <Ticks status={msg.status} />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {showEmojiPicker && (
          <div className="absolute bottom-[70px] left-4 z-50 shadow-xl border border-[#f0f2f5] dark:border-[#202c33] rounded-lg">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setText((prev) => prev + emojiData.emoji);
                setShowEmojiPicker(false);
              }}
              theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
            />
          </div>
        )}

        {replyTo && (
          <div className="bg-white dark:bg-[#0b141a] px-4 pt-2 z-10 shrink-0">
            <div className="bg-[#f0f2f5] dark:bg-[#202c33] border-l-4 border-[#25d366] rounded-lg p-2 flex items-center justify-between">
              <div className="truncate">
                <div className="text-[12px] font-semibold text-[#25d366]">
                  Replying to{" "}
                  {replyTo.senderId === currentUser.uid
                    ? "yourself"
                    : users.find((u) => u.uid === replyTo.senderId)?.displayName}
                </div>
                <div className="text-[13px] text-[#54656f] dark:text-[#aebac1] truncate">
                  {replyTo.text || "Media"}
                </div>
              </div>
              <button onClick={() => setReplyTo(null)} className="text-[#8696a0] p-1">
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {blockedByMe || blockedByThem ? (
          <div className="bg-white dark:bg-[#0b141a] py-4 text-center text-[13px] text-[#667781] dark:text-[#8696a0] shrink-0 z-10">
            {blockedByMe ? (
              <>
                You blocked this user.{" "}
                <button
                  onClick={() => otherUser && toggleBlockUser(otherUser.uid)}
                  className="text-[#25d366] font-semibold"
                >
                  Unblock
                </button>
              </>
            ) : (
              "You can't message this user."
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0b141a] px-2 py-2 flex items-center gap-2 z-10 w-full shrink-0 relative">
            <div className="flex-1 bg-[#f0f2f5] dark:bg-[#202c33] rounded-[24px] flex items-center px-2 py-1 min-h-[44px]">
              <input
                type="file"
                accept="image/*,video/*,.pdf,.doc,.docx,.zip,.txt,.xls,.xlsx,application/zip,application/x-zip-compressed,*/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              <div className="flex items-center gap-2 text-[#54656f] dark:text-[#aebac1]">
                <Smile
                  size={24}
                  className="cursor-pointer ml-1 hover:text-[#00a884] transition-colors"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                />
              </div>

              {isRecording ? (
                <div className="flex-1 flex items-center justify-between text-[#54656f] dark:text-[#aebac1]">
                  <div className="flex items-center gap-3 animate-pulse text-red-500 font-medium tracking-widest pl-2">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                    {formatDuration(recordingDuration)}
                  </div>
                  <button
                    onClick={cancelRecording}
                    className="text-red-500 hover:text-red-600 font-medium px-4"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex-1 mx-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isInputMuted}
                    placeholder={isInputMuted ? "Messaging is disabled" : "Message"}
                    className="w-full bg-transparent outline-none text-[16px] text-[#111b21] dark:text-[#e9edef] disabled:opacity-75 placeholder-[#8696a0]"
                  />
                </form>
              )}

              {!isRecording && (
                <div className="flex items-center gap-4 mr-2 text-[#54656f] dark:text-[#aebac1]">
                  <button
                    disabled={isInputMuted}
                    onClick={() => fileInputRef.current?.click()}
                    className="focus:outline-none disabled:opacity-50"
                  >
                    <Paperclip
                      size={22}
                      className="cursor-pointer hover:text-gray-800 dark:hover:text-gray-300 transform -rotate-45"
                    />
                  </button>
                  <button
                    disabled={isInputMuted}
                    onClick={() => fileInputRef.current?.click()}
                    className="focus:outline-none disabled:opacity-50"
                  >
                    <Camera size={22} className="cursor-pointer hover:text-gray-800 dark:hover:text-gray-300" />
                  </button>
                </div>
              )}
            </div>

            <div className="shrink-0 flex items-center justify-center">
              {text.trim() && !isInputMuted ? (
                <button
                  onClick={handleSend}
                  className="w-[44px] h-[44px] bg-[#25d366] rounded-full flex items-center justify-center text-white hover:bg-[#20c359] focus:outline-none shadow-sm transition-transform active:scale-95"
                >
                  <Send size={20} className="translate-x-0.5" />
                </button>
              ) : isRecording ? (
                <button
                  onClick={stopRecording}
                  className="w-[44px] h-[44px] bg-[#25d366] text-white rounded-full flex items-center justify-center animate-bounce shadow-sm focus:outline-none transition-transform active:scale-95"
                >
                  <Send size={20} className="translate-x-[2px]" />
                </button>
              ) : (
                <button
                  disabled={isInputMuted}
                  onClick={startRecording}
                  className="w-[44px] h-[44px] bg-[#25d366] text-white rounded-full flex items-center justify-center focus:outline-none hover:bg-[#20c359] shadow-sm transition-transform active:scale-95"
                >
                  <Mic size={22} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showGroupInfo && (
        <GroupInfo chatId={chatId} otherUser={otherUser} onClose={() => setShowGroupInfo(false)} />
      )}

      {/* Forward picker */}
      {forwardMsgId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-[#222e35] rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-[#313d45] flex items-center justify-between">
              <h3 className="font-bold text-[#111b21] dark:text-white">Forward to</h3>
              <button onClick={() => setForwardMsgId(null)} className="text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {chats
                .filter((c) => c.members.includes(currentUser.uid) && c.id !== chatId)
                .map((c) => {
                  const other =
                    c.type === "direct"
                      ? users.find((u) => u.uid === c.members.find((m) => m !== currentUser.uid))
                      : null;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        forwardMessage(forwardMsgId, c.id);
                        setForwardMsgId(null);
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-left"
                    >
                      <img
                        src={
                          c.type === "direct"
                            ? other?.photoURL
                            : c.avatarUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=8696a0&color=fff`
                        }
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-[#111b21] dark:text-[#e9edef] font-medium">
                        {c.type === "direct" ? other?.displayName : c.name}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Message info */}
      {infoMsg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-[#222e35] rounded-2xl max-w-xs w-full p-6 shadow-2xl">
            <h3 className="font-bold text-[#111b21] dark:text-white mb-4 flex items-center gap-2">
              <Info size={18} /> Message info
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div>Sent: {format(new Date(infoMsg.createdAt), "PPp")}</div>
              <div className="flex items-center gap-2">
                Status: <Ticks status={infoMsg.status} />
                <span className="capitalize">{infoMsg.status || "sent"}</span>
              </div>
              <div>
                From:{" "}
                {infoMsg.senderId === currentUser.uid
                  ? "You"
                  : users.find((u) => u.uid === infoMsg.senderId)?.displayName}
              </div>
            </div>
            <button
              onClick={() => setInfoMsg(null)}
              className="mt-6 w-full py-2 bg-[#25d366] text-[#0b141a] font-semibold rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {errorToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#111b21] text-white text-sm px-4 py-2 rounded-lg shadow-xl z-[9999]">
          {errorToast}
        </div>
      )}

      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-[#222e35] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 text-left">
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
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
