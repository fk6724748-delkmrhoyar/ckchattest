import React, { useRef, useState } from "react";
import { useAppStore } from "../lib/store";
import { X, BadgeCheck, Upload } from "lucide-react";

export default function VerifyRequestModal({ onClose }: { onClose: () => void }) {
  const { systemSettings, submitVerifyRequest, currentUser } = useAppStore();
  const [targetType, setTargetType] = useState<"user" | "channel">("user");
  const [targetName, setTargetName] = useState(currentUser?.username || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [method, setMethod] = useState("EasyPaisa");
  const [trxId, setTrxId] = useState("");
  const [screenshot, setScreenshot] = useState<string>("");
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => setScreenshot(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  const submit = () => {
    if (!targetName.trim() || !trxId.trim()) return;
    submitVerifyRequest({ targetType, targetName, email, method, trxId, screenshot });
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#222e35] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-[#313d45]">
          <h3 className="font-bold text-[#111b21] dark:text-white flex items-center gap-2">
            <BadgeCheck size={20} className="text-white fill-[#1da1f2]" />
            Apply for verified badge
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="text-green-600 font-semibold mb-2">Request submitted</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The administrator will review your request shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2 bg-[#25d366] text-[#0b141a] rounded-lg font-semibold"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="p-5 overflow-y-auto space-y-3">
            <div className="bg-[#e7f8ef] dark:bg-[#182229] rounded-xl p-4 text-[13px] text-[#111b21] dark:text-[#aebac1] leading-relaxed">
              <div className="font-semibold mb-1">Payment methods</div>
              Price: {systemSettings.verifyPrice || "500 PKR"}
              <br />
              EasyPaisa: {systemSettings.easypaisa || "—"}
              <br />
              JazzCash: {systemSettings.jazzcash || "—"}
              <br />
              Binance: {systemSettings.binance || "—"}
              <br />
              Send the payment, then submit this form with the TRX ID and screenshot.
            </div>

            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as "user" | "channel")}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#313d45] bg-white dark:bg-[#2a3942] text-[#111b21] dark:text-[#e9edef]"
            >
              <option value="user">User blue tick</option>
              <option value="channel">Channel blue tick</option>
            </select>

            <input
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="Username or channel name"
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#313d45] bg-white dark:bg-[#2a3942] text-[#111b21] dark:text-[#e9edef]"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#313d45] bg-white dark:bg-[#2a3942] text-[#111b21] dark:text-[#e9edef]"
            />
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#313d45] bg-white dark:bg-[#2a3942] text-[#111b21] dark:text-[#e9edef]"
            >
              <option>EasyPaisa</option>
              <option>JazzCash</option>
              <option>Binance</option>
            </select>
            <input
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="TRX ID"
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#313d45] bg-white dark:bg-[#2a3942] text-[#111b21] dark:text-[#e9edef]"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full p-3 rounded-lg border border-dashed border-gray-300 dark:border-[#313d45] text-[#54656f] dark:text-[#aebac1] flex items-center justify-center gap-2 text-sm"
            >
              <Upload size={16} /> {screenshot ? "Screenshot attached" : "Upload payment screenshot"}
            </button>
            <input type="file" accept="image/*" hidden ref={fileRef} onChange={handleFile} />

            <button
              onClick={submit}
              className="w-full py-3 bg-[#25d366] text-[#0b141a] rounded-lg font-bold hover:bg-[#20c359] transition-colors"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
