import React, { useRef, useState } from "react";
import { X, Camera, Check, Search, Trash2, Repeat, BadgeCheck } from "lucide-react";
import { useAppStore } from "../lib/store";
import { Channel } from "../lib/types";

// Owner-only channel settings panel: edit name, username, description, DP;
// Transfer Ownership modal with username search; red Delete Channel button.
export default function ChannelSettings({
  channel,
  onClose,
}: {
  channel: Channel;
  onClose: () => void;
}) {
  const { users, currentUser, updateChannel, deleteChannel, transferChannelOwnership, setCurrentChannelId } =
    useAppStore();

  const [name, setName] = useState(channel.name);
  const [username, setUsername] = useState(channel.username || "");
  const [about, setAbout] = useState(channel.about || "");
  const avatarRef = useRef<HTMLInputElement>(null);

  const [showTransfer, setShowTransfer] = useState(false);
  const [transferSearch, setTransferSearch] = useState("");
  const [selectedNewOwner, setSelectedNewOwner] = useState<string | null>(null);
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateChannel(channel.id, { avatarUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const saveInfo = () => {
    updateChannel(channel.id, { name: name.trim() || channel.name, username: username.trim(), about });
  };

  const candidates = users
    .filter((u) => u.uid !== currentUser?.uid)
    .filter(
      (u) =>
        !transferSearch ||
        u.username.toLowerCase().includes(transferSearch.toLowerCase()) ||
        u.displayName.toLowerCase().includes(transferSearch.toLowerCase()),
    );

  const newOwnerUser = users.find((u) => u.uid === selectedNewOwner);

  return (
    <div className="w-full lg:w-[350px] h-full bg-white dark:bg-[#0b141a] flex flex-col shrink-0 border-l border-[#f0f2f5] dark:border-[#202c33] z-30 absolute lg:relative right-0">
      <div className="h-[60px] bg-[#f0f2f5] dark:bg-[#202c33] px-4 flex items-center gap-4 border-b border-[#f0f2f5] dark:border-[#202c33] shrink-0">
        <button onClick={onClose} className="text-[#54656f] dark:text-[#aebac1] hover:text-[#111b21] dark:hover:text-[#e9edef]">
          <X size={24} />
        </button>
        <h2 className="text-[16px] font-medium text-[#111b21] dark:text-[#e9edef]">Channel settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white dark:bg-[#111b21] p-6 flex flex-col items-center shadow-sm mb-2">
          <div className="relative group cursor-pointer" onClick={() => avatarRef.current?.click()}>
            <img
              src={
                channel.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=6a4cff&color=fff`
              }
              className="w-32 h-32 rounded-full object-cover shadow-md"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} />
            </div>
          </div>
          <input type="file" accept="image/*" hidden ref={avatarRef} onChange={handleAvatar} />
        </div>

        <div className="px-6 py-4 bg-white dark:bg-[#111b21] shadow-sm mb-2">
          <div className="text-[13px] text-[#00a884] font-medium mb-1">Channel name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border-b-2 border-[#00a884] outline-none py-1 text-[16px] text-[#111b21] dark:text-[#e9edef]"
          />
        </div>

        <div className="px-6 py-4 bg-white dark:bg-[#111b21] shadow-sm mb-2">
          <div className="text-[13px] text-[#00a884] font-medium mb-1">Username</div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            className="w-full bg-transparent border-b-2 border-[#00a884] outline-none py-1 text-[16px] text-[#111b21] dark:text-[#e9edef]"
          />
        </div>

        <div className="px-6 py-4 bg-white dark:bg-[#111b21] shadow-sm mb-2">
          <div className="text-[13px] text-[#00a884] font-medium mb-1">Description</div>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={3}
            className="w-full bg-transparent border border-[#00a884] rounded-md p-2 outline-none text-[15px] text-[#111b21] dark:text-[#e9edef]"
          />
        </div>

        <div className="px-6 pb-4">
          <button onClick={saveInfo} className="w-full py-2.5 rounded-lg bg-[#00a884] text-white font-medium text-sm">
            Save changes
          </button>
        </div>

        <div className="p-4 bg-white dark:bg-[#111b21] shadow-sm flex flex-col gap-2 mt-2">
          <button
            onClick={() => setShowTransfer(true)}
            className="w-full flex items-center justify-center gap-2 py-3 border border-[#00a884] text-[#00a884] rounded-lg hover:bg-[#00a884]/10 transition-colors font-medium text-sm"
          >
            <Repeat size={16} />
            Transfer Ownership
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm shadow-sm"
          >
            <Trash2 size={16} />
            Delete Channel
          </button>
        </div>
      </div>

      {/* Transfer ownership modal */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-[#222e35] rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-100 dark:border-gray-800">
            {!confirmTransfer ? (
              <>
                <h3 className="text-md font-bold text-gray-900 dark:text-white mb-3">Transfer Ownership</h3>
                <div className="bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg flex items-center px-3 py-1 mb-2">
                  <Search size={16} className="text-[#54656f] dark:text-[#8696a0] mr-2" />
                  <input
                    autoFocus
                    value={transferSearch}
                    onChange={(e) => setTransferSearch(e.target.value)}
                    placeholder="Search username..."
                    className="bg-transparent w-full py-2 outline-none text-sm text-[#111b21] dark:text-[#e9edef]"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {candidates.map((u) => (
                    <div
                      key={u.uid}
                      onClick={() => setSelectedNewOwner(u.uid)}
                      className={`flex items-center px-2 py-2 rounded-lg cursor-pointer ${
                        selectedNewOwner === u.uid ? "bg-[#00a884]/10" : "hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]"
                      }`}
                    >
                      <img src={u.photoURL} className="w-9 h-9 rounded-full mr-3 object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#111b21] dark:text-[#e9edef] truncate flex items-center gap-1">
                          {u.displayName}
                          {u.isVerified && <BadgeCheck size={13} className="text-white fill-[#1da1f2] shrink-0" />}
                        </div>
                        <div className="text-xs text-[#667781] truncate">@{u.username}</div>
                      </div>
                      {selectedNewOwner === u.uid && <Check size={18} className="text-[#00a884]" />}
                    </div>
                  ))}
                  {candidates.length === 0 && (
                    <div className="text-center text-xs text-gray-500 py-4">No users found.</div>
                  )}
                </div>
                <div className="flex gap-2 justify-end mt-3">
                  <button
                    onClick={() => {
                      setShowTransfer(false);
                      setSelectedNewOwner(null);
                      setTransferSearch("");
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!selectedNewOwner}
                    onClick={() => setConfirmTransfer(true)}
                    className="px-3.5 py-1.5 text-xs font-medium bg-[#00a884] text-white hover:opacity-90 rounded-lg shadow-sm transition-colors disabled:opacity-40"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-md font-bold text-gray-900 dark:text-white mb-2">Confirm Transfer</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                  Are you sure you want to transfer ownership of "{channel.name}" to{" "}
                  {newOwnerUser?.displayName || "this user"}? You will no longer be the owner.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setConfirmTransfer(false)}
                    className="px-3.5 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (selectedNewOwner) transferChannelOwnership(channel.id, selectedNewOwner);
                      setShowTransfer(false);
                      setConfirmTransfer(false);
                      setSelectedNewOwner(null);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium bg-red-500 text-white hover:bg-red-600 rounded-lg shadow-sm transition-colors"
                  >
                    Transfer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete channel confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-[#222e35] rounded-2xl max-w-xs w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 text-left">
            <h3 className="text-md font-bold text-gray-900 dark:text-white mb-2">Delete Channel</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to delete "{channel.name}" permanently? All posts will be gone forever.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteChannel(channel.id);
                  setCurrentChannelId(null);
                  onClose();
                }}
                className="px-3.5 py-1.5 text-xs font-medium bg-red-500 text-white hover:bg-red-600 rounded-lg shadow-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
