import React, { useRef, useState } from "react";
import { useAppStore } from "../lib/store";
import { UserProfile } from "../lib/types";
import {
  ArrowLeft,
  BadgeCheck,
  Send,
  ImagePlus,
  Trash2,
  Users,
  MoreVertical,
  Megaphone,
  Settings,
  Flag,
} from "lucide-react";
import ChannelSettings from "./ChannelSettings";
import { format } from "date-fns";

export default function ChannelView({
  currentUser,
  channelId,
}: {
  currentUser: UserProfile;
  channelId: string;
}) {
  const {
    channels,
    channelPosts,
    addChannelPost,
    deleteChannelPost,
    toggleFollowChannel,
    deleteChannel,
    updateChannel,
    reactToChannelPost,
    addReport,
    setSidebarOpen,
    setCurrentChannelId,
  } = useAppStore();

  const channel = channels.find((c) => c.id === channelId);
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [postMenuId, setPostMenuId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<any>(null);
  const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  if (!channel) return null;

  const isOwner = channel.ownerId === currentUser.uid || !!currentUser.isAdmin;
  const isFollowing = channel.followers.includes(currentUser.uid);
  const posts = channelPosts
    .filter((p) => p.channelId === channelId)
    .sort((a, b) => a.createdAt - b.createdAt);

  const handleMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      addChannelPost(channelId, "", "image", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isOwner) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      updateChannel(channelId, { avatarUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const avatar =
    channel.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=6a4cff&color=fff`;

  return (
    <div className="flex flex-col h-full w-full bg-[#efeae2] dark:bg-[#0b141a] relative" onClick={() => postMenuId && setPostMenuId(null)}>
      <div className="h-[60px] bg-white dark:bg-[#0b141a] px-4 flex items-center justify-between border-b border-[#f0f2f5] dark:border-[#202c33] shrink-0 z-20">
        <div className="flex items-center flex-1 min-w-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#111b21] dark:text-white mr-3"
          >
            <ArrowLeft size={24} />
          </button>
          <img
            src={avatar}
            onClick={() => isOwner && avatarRef.current?.click()}
            className={`w-10 h-10 rounded-full object-cover mr-3 shrink-0 ${isOwner ? "cursor-pointer" : ""}`}
          />
          <input
            type="file"
            accept="image/*"
            hidden
            ref={avatarRef}
            onChange={handleAvatar}
          />
          <div className="truncate">
            <h3 className="text-[17px] font-medium text-[#111b21] dark:text-[#e9edef] flex items-center gap-1">
              {channel.name}
              {channel.isVerified && (
                <BadgeCheck size={16} className="text-white fill-[#1da1f2] shrink-0" />
              )}
            </h3>
            <p className="text-[13px] text-[#667781] dark:text-[#8696a0] truncate flex items-center gap-1">
              <Users size={12} /> {channel.followers.length} followers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0 text-[#54656f] dark:text-white relative">
          <button
            onClick={() => toggleFollowChannel(channelId)}
            className={`px-3 py-1.5 rounded-full text-[13px] font-semibold ${isFollowing ? "bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1]" : "bg-[#25d366] text-[#0b141a]"}`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <MoreVertical size={22} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#233138] shadow-xl rounded-2xl overflow-hidden z-50 py-2 border border-gray-100 dark:border-[#313d45]">
              <div className="px-5 py-2 text-[12px] text-[#667781] dark:text-[#8696a0]">
                {channel.about || "No description"}
              </div>
              {isOwner && (
                <button
                  onClick={() => {
                    setShowSettings(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-[#3b4a54] dark:text-[#e9edef] text-[15px]"
                >
                  <Settings size={18} /> Channel settings
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => {
                    deleteChannel(channelId);
                    setCurrentChannelId(null);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-5 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-red-500 text-[15px]"
                >
                  <Trash2 size={18} /> Delete channel
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <div className="self-center bg-[#d1f4ff] dark:bg-[#182229] px-3 py-1 rounded-lg text-[11px] text-[#54656f] dark:text-[#8696a0] uppercase">
          Channel created {format(new Date(channel.createdAt), "PP")}
        </div>
        {posts.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-[#667781] dark:text-[#8696a0] gap-3">
            <Megaphone size={40} />
            <p className="text-sm max-w-xs">
              No updates yet. {isOwner ? "Share your first update below." : "Follow to get updates."}
            </p>
          </div>
        )}
        {posts.map((p) => {
          const startLongPress = () => {
            longPressTimer.current = setTimeout(() => setPostMenuId(p.id), 500);
          };
          const cancelLongPress = () => {
            if (longPressTimer.current) clearTimeout(longPressTimer.current);
          };
          const reactionCounts: Record<string, number> = {};
          Object.values(p.reactions || {}).forEach((emo) => {
            reactionCounts[emo] = (reactionCounts[emo] || 0) + 1;
          });
          return (
            <div
              key={p.id}
              onContextMenu={(e) => {
                e.preventDefault();
                setPostMenuId(p.id);
              }}
              onTouchStart={startLongPress}
              onTouchEnd={cancelLongPress}
              onTouchMove={cancelLongPress}
              className="self-start max-w-[85%] bg-white dark:bg-[#202c33] rounded-lg rounded-tl-none shadow-sm p-2 relative group select-none"
            >
              {p.mediaUrl && (
                <img src={p.mediaUrl} className="rounded-md mb-1 max-w-[300px]" />
              )}
              {p.text && (
                <div className="text-[14.2px] text-[#111b21] dark:text-[#e9edef] px-1 break-words">
                  {p.text}
                </div>
              )}
              {Object.keys(reactionCounts).length > 0 && (
                <div className="flex items-center gap-1 px-1 mt-1">
                  {Object.entries(reactionCounts).map(([emo, count]) => (
                    <span key={emo} className="text-[12px] bg-[#f0f2f5] dark:bg-[#182229] rounded-full px-1.5 py-0.5">
                      {emo} {count}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-[11px] text-[#667781] dark:text-[#ffffff99] text-right px-1 mt-1">
                {format(new Date(p.createdAt), "HH:mm")}
              </div>

              {postMenuId === p.id && (
                <div className="absolute z-[70] top-6 right-0 w-52 bg-white dark:bg-[#233138] shadow-xl rounded-xl overflow-hidden py-1.5 border border-gray-100 dark:border-[#313d45] text-[14px] text-[#3b4a54] dark:text-[#e9edef]">
                  <div className="flex items-center justify-around px-2 py-2 border-b border-gray-100 dark:border-[#313d45]">
                    {REACTION_EMOJIS.map((emo) => (
                      <button
                        key={emo}
                        onClick={() => {
                          reactToChannelPost(p.id, emo);
                          setPostMenuId(null);
                        }}
                        className="text-xl hover:scale-125 transition-transform"
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => {
                        deleteChannelPost(p.id);
                        setPostMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-red-500"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const reason = window.prompt("Report this post. Please describe the reason:");
                      if (reason && reason.trim()) {
                        addReport("channelPost", p.id, reason.trim());
                        alert("Report submitted. Thank you.");
                      }
                      setPostMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] flex items-center gap-3 text-orange-500"
                  >
                    <Flag size={16} /> Report
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isOwner ? (
        <div className="bg-white dark:bg-[#0b141a] px-2 py-2 flex items-center gap-2 shrink-0">
          <div className="flex-1 bg-[#f0f2f5] dark:bg-[#202c33] rounded-[24px] flex items-center px-3 py-1 min-h-[44px]">
            <button onClick={() => fileRef.current?.click()} className="text-[#54656f] dark:text-[#aebac1]">
              <ImagePlus size={22} />
            </button>
            <input type="file" accept="image/*" hidden ref={fileRef} onChange={handleMedia} />
            <form
              className="flex-1 mx-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!text.trim()) return;
                addChannelPost(channelId, text);
                setText("");
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share an update"
                className="w-full bg-transparent outline-none text-[16px] text-[#111b21] dark:text-[#e9edef] placeholder-[#8696a0]"
              />
            </form>
          </div>
          <button
            onClick={() => {
              if (!text.trim()) return;
              addChannelPost(channelId, text);
              setText("");
            }}
            className="w-[44px] h-[44px] bg-[#25d366] rounded-full flex items-center justify-center text-white shrink-0"
          >
            <Send size={20} className="translate-x-0.5" />
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0b141a] py-4 text-center text-[13px] text-[#667781] dark:text-[#8696a0] shrink-0">
          📢 Only the channel owner can post here
        </div>
      )}
      {isOwner && showSettings && (
        <ChannelSettings channel={channel} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
