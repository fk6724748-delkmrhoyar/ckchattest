import React from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useAppStore } from "../lib/store";
import { UserProfile } from "../lib/types";

// Settings/Privacy screen: toggle "Group Invite Approval" for the current user.
export default function PrivacyView({
  currentUser,
  onBack,
}: {
  currentUser: UserProfile;
  onBack: () => void;
}) {
  const { updateProfile } = useAppStore();

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#0b141a] relative z-20 overflow-y-auto">
      <div className="h-[60px] bg-white dark:bg-[#0b141a] text-[#111b21] dark:text-white flex items-center px-4 shrink-0 shadow-sm relative z-20 border-b border-gray-100 dark:border-[#202c33]">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="font-bold hover:opacity-80">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-medium">Privacy</h2>
        </div>
      </div>

      <div className="px-6 py-4 bg-white dark:bg-[#111b21] shadow-sm mt-2 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} className="text-[#00a884] shrink-0 mt-0.5" />
          <div>
            <div className="text-[15px] font-medium text-[#111b21] dark:text-[#e9edef]">
              Group Invite Approval
            </div>
            <div className="text-[13px] text-[#667781] dark:text-[#8696a0] mt-0.5 leading-tight">
              When enabled, anyone adding you to a group must wait for your approval.
            </div>
          </div>
        </div>
        <button
          onClick={() => updateProfile({ groupInviteApproval: !currentUser.groupInviteApproval })}
          className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
            currentUser.groupInviteApproval ? "bg-[#00a884]" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              currentUser.groupInviteApproval ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
