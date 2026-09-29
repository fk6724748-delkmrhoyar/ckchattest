import React, { useRef, useState } from "react";
import { ArrowLeft, Camera, Check, X, BadgeCheck, KeyRound } from "lucide-react";
import { useAppStore } from "../lib/store";
import { UserProfile } from "../lib/types";

// Own profile screen (opened from three-dots -> Profile):
// - DP change with preview + Cancel/Save
// - change name, unique username (shows error), about
// - change password (current + new)
// - phone shown read-only, email NOT editable
export default function OwnProfileView({
  currentUser,
  onBack,
}: {
  currentUser: UserProfile;
  onBack: () => void;
}) {
  const { updateProfile, systemSettings } = useAppStore();
  const appName = systemSettings?.appName || "CK Chat";

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const profilePicRef = useRef<HTMLInputElement>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(currentUser.displayName);

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [usernameError, setUsernameError] = useState("");

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editBio, setEditBio] = useState(currentUser.bio || `Hey there! I am using ${appName}.`);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handlePickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const savePhoto = () => {
    if (photoPreview) updateProfile({ photoURL: photoPreview });
    setPhotoPreview(null);
  };

  const saveName = () => {
    updateProfile({ displayName: editName });
    setIsEditingName(false);
  };

  const saveUsername = () => {
    setUsernameError("");
    if (!editUsername.trim()) {
      setUsernameError("Username cannot be empty.");
      return;
    }
    try {
      updateProfile({ username: editUsername.trim() });
      setIsEditingUsername(false);
    } catch (err: any) {
      setUsernameError(err.message || "Username already exists.");
    }
  };

  const saveBio = () => {
    updateProfile({ bio: editBio });
    setIsEditingBio(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (currentUser.password && currentUser.password !== currentPassword) {
      setPasswordError("Current password is incorrect.");
      return;
    }
    if (!newPassword.trim() || newPassword.length < 4) {
      setPasswordError("New password must be at least 4 characters.");
      return;
    }
    updateProfile({ password: newPassword });
    setCurrentPassword("");
    setNewPassword("");
    setPasswordSuccess("Password updated successfully.");
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#0b141a] relative z-20 overflow-y-auto">
      <div className="h-[60px] bg-white dark:bg-[#0b141a] text-[#111b21] dark:text-white flex items-center px-4 shrink-0 shadow-sm relative z-20 border-b border-gray-100 dark:border-[#202c33]">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="font-bold hover:opacity-80">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-medium">Profile</h2>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-10 bg-[#f0f2f5] dark:bg-[#0b141a]">
        <div
          className="relative group rounded-full overflow-hidden w-[140px] h-[140px] cursor-pointer shadow-lg border-2 border-white dark:border-[#202c33]"
          onClick={() => profilePicRef.current?.click()}
        >
          <img src={photoPreview || currentUser.photoURL} alt="profile" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={28} className="mb-1" />
            <span className="text-[11px] text-center px-2 uppercase font-bold tracking-wider">Change Photo</span>
          </div>
          <input type="file" accept="image/*" className="hidden" ref={profilePicRef} onChange={handlePickPhoto} />
        </div>

        {photoPreview && (
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setPhotoPreview(null)}
              className="px-4 py-1.5 rounded-full text-[14px] font-medium border border-gray-300 dark:border-gray-600 text-[#54656f] dark:text-[#aebac1]"
            >
              Cancel
            </button>
            <button
              onClick={savePhoto}
              className="px-4 py-1.5 rounded-full text-[14px] font-medium bg-[#00a884] text-white"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="px-6 py-4 bg-white dark:bg-[#111b21] shadow-sm mb-3">
        <div className="text-[13px] text-[#667781] dark:text-[#aebac1] font-medium mb-1">Name</div>
        <div className="flex items-center justify-between text-[#111b21] dark:text-[#e9edef] pb-1">
          {isEditingName ? (
            <input
              type="text"
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="bg-transparent border-b-2 border-[#00a884] outline-none flex-1 font-medium py-1 text-[17px]"
            />
          ) : (
            <span className="font-medium text-[17px] truncate flex-1 flex py-1 items-center gap-1">
              {currentUser.displayName}
              {currentUser.isVerified && <BadgeCheck size={16} className="text-white fill-[#1da1f2] shrink-0" />}
            </span>
          )}
          {isEditingName ? (
            <button onClick={saveName} className="p-2">
              <Check size={20} className="text-[#00a884]" />
            </button>
          ) : (
            <button onClick={() => setIsEditingName(true)} className="p-2 text-[#8696a0] hover:text-[#00a884] text-sm font-medium">
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Username */}
      <div className="px-6 py-4 bg-white dark:bg-[#111b21] shadow-sm mb-3">
        <div className="text-[13px] text-[#667781] dark:text-[#aebac1] font-medium mb-1">Username</div>
        <div className="flex items-center justify-between text-[#111b21] dark:text-[#e9edef] pb-1">
          {isEditingUsername ? (
            <input
              type="text"
              autoFocus
              value={editUsername}
              onChange={(e) => {
                setEditUsername(e.target.value);
                setUsernameError("");
              }}
              className="bg-transparent border-b-2 border-[#00a884] outline-none flex-1 font-medium py-1 text-[17px]"
            />
          ) : (
            <span className="font-medium text-[17px] truncate flex-1 py-1">@{currentUser.username}</span>
          )}
          {isEditingUsername ? (
            <button onClick={saveUsername} className="p-2">
              <Check size={20} className="text-[#00a884]" />
            </button>
          ) : (
            <button
              onClick={() => {
                setEditUsername(currentUser.username);
                setIsEditingUsername(true);
              }}
              className="p-2 text-[#8696a0] hover:text-[#00a884] text-sm font-medium"
            >
              Edit
            </button>
          )}
        </div>
        {usernameError && <div className="text-[12px] text-red-500 mt-1">{usernameError}</div>}
      </div>

      {/* About */}
      <div className="px-6 py-4 bg-white dark:bg-[#111b21] shadow-sm mb-3">
        <div className="text-[13px] text-[#667781] dark:text-[#aebac1] font-medium mb-1">About</div>
        <div className="flex items-center justify-between text-[#111b21] dark:text-[#e9edef] pb-1">
          {isEditingBio ? (
            <input
              type="text"
              autoFocus
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="bg-transparent border-b-2 border-[#00a884] outline-none flex-1 py-1 text-[17px]"
            />
          ) : (
            <span className="text-[17px] truncate flex-1 py-1">{currentUser.bio || "Available"}</span>
          )}
          {isEditingBio ? (
            <button onClick={saveBio} className="p-2">
              <Check size={20} className="text-[#00a884]" />
            </button>
          ) : (
            <button onClick={() => setIsEditingBio(true)} className="p-2 text-[#8696a0] hover:text-[#00a884] text-sm font-medium">
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Phone (read-only) & Email (not editable) */}
      <div className="px-6 py-4 bg-white dark:bg-[#111b21] shadow-sm mb-3">
        <div className="text-[13px] text-[#667781] dark:text-[#aebac1] font-medium mb-1">Phone</div>
        <div className="text-[17px] text-[#111b21] dark:text-[#e9edef] py-1">{currentUser.phone || "Not set"}</div>
      </div>
      <div className="px-6 py-4 bg-white dark:bg-[#111b21] shadow-sm mb-3">
        <div className="text-[13px] text-[#667781] dark:text-[#aebac1] font-medium mb-1">Email</div>
        <div className="text-[17px] text-[#111b21] dark:text-[#e9edef] py-1">{currentUser.email}</div>
      </div>

      {/* Password */}
      <div className="px-6 py-4 bg-white dark:bg-[#111b21] shadow-sm mb-3">
        <button
          onClick={() => {
            setShowPasswordForm(!showPasswordForm);
            setPasswordError("");
            setPasswordSuccess("");
          }}
          className="flex items-center gap-2 text-[15px] font-medium text-[#111b21] dark:text-[#e9edef]"
        >
          <KeyRound size={18} className="text-[#00a884]" />
          Change password
        </button>
        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-3 flex flex-col gap-3">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-2 outline-none text-[15px] text-[#111b21] dark:text-[#e9edef]"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-2 outline-none text-[15px] text-[#111b21] dark:text-[#e9edef]"
            />
            {passwordError && <div className="text-[12px] text-red-500">{passwordError}</div>}
            {passwordSuccess && <div className="text-[12px] text-[#00a884]">{passwordSuccess}</div>}
            <button
              type="submit"
              className="self-start px-4 py-1.5 rounded-full text-[14px] font-medium bg-[#00a884] text-white"
            >
              Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
