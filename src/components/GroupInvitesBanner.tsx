import React from "react";
import { useAppStore } from "../lib/store";
import { UserProfile } from "../lib/types";
import { UserPlus, Check, X } from "lucide-react";

// WhatsApp-style banner/list of pending group invites for the current user,
// shown at the top of the chat list with Accept / Reject actions.
export default function GroupInvitesBanner({ currentUser }: { currentUser: UserProfile }) {
  const { groupInvites, chats, users, respondGroupInvite } = useAppStore();

  const pending = groupInvites.filter(
    (i) => i.userId === currentUser.uid && i.status === "pending",
  );

  if (pending.length === 0) return null;

  return (
    <div className="px-3 pt-2 flex flex-col gap-2">
      {pending.map((invite) => {
        const chat = chats.find((c) => c.id === invite.chatId);
        const inviter = users.find((u) => u.uid === invite.invitedBy);
        return (
          <div
            key={invite.id}
            className="flex items-center gap-3 bg-[#e7f9f1] dark:bg-[#0d2e26] border border-[#00a884]/30 rounded-xl p-3"
          >
            <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white shrink-0">
              <UserPlus size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium text-[#111b21] dark:text-[#e9edef] truncate">
                Invite to join {chat?.name || "a group"}
              </div>
              <div className="text-[12px] text-[#667781] dark:text-[#8696a0] truncate">
                by {inviter?.displayName || "someone"}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => respondGroupInvite(invite.id, true)}
                title="Accept"
                className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:opacity-90"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => respondGroupInvite(invite.id, false)}
                title="Reject"
                className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:opacity-90"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
