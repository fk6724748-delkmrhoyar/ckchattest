import React, { useEffect, useRef, useState } from "react";
import { useAppStore } from "../lib/store";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  BadgeCheck,
  SwitchCamera,
  UserPlus,
  Search,
  X,
} from "lucide-react";
import { startIncomingRingtone, startRingback, stopRingtone } from "../lib/ringtone";

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export default function CallScreen() {
  const { activeCall, users, chats, currentUser, answerCall, endCall, addMemberToCall } = useAppStore();
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [cameraOn, setCameraOn] = useState(activeCall?.type === "video");
  const [frontCamera, setFrontCamera] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const peer = users.find((u) => u.uid === activeCall?.peerId);

  // Ringing -> answered (local demo signalling)
  useEffect(() => {
    if (!activeCall || activeCall.status !== "ringing") return;
    const t = setTimeout(() => answerCall(), 3500);
    return () => clearTimeout(t);
  }, [activeCall?.id, activeCall?.status]);

  // Ringtone / ringback while ringing, stop once answered/ended
  useEffect(() => {
    if (activeCall?.status === "ringing") {
      if (activeCall.incoming) startIncomingRingtone();
      else startRingback();
    } else {
      stopRingtone();
    }
    return () => stopRingtone();
  }, [activeCall?.id, activeCall?.status, activeCall?.incoming]);

  // Duration timer
  useEffect(() => {
    if (activeCall?.status !== "answered") return;
    const i = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(i);
  }, [activeCall?.status]);

  // Media (mic + camera)
  useEffect(() => {
    let cancelled = false;
    const open = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video:
            activeCall?.type === "video" && cameraOn
              ? { facingMode: frontCamera ? "user" : "environment" }
              : false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.warn("Media permission denied", err);
      }
    };
    if (activeCall) open();
    return () => {
      cancelled = true;
    };
  }, [activeCall?.id, cameraOn, frontCamera]);

  // Mute toggle
  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !muted));
  }, [muted]);

  const hangUp = () => {
    stopRingtone();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    endCall();
  };

  useEffect(() => {
    return () => {
      stopRingtone();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  if (!activeCall || !peer) return null;

  const isVideo = activeCall.type === "video";
  const ringing = activeCall.status === "ringing";
  const participantUsers = (activeCall.participants || [])
    .map((uid) => users.find((u) => u.uid === uid))
    .filter(Boolean) as typeof users;

  // Users I have a direct chat with, excluding peer / already-added participants / me
  const chatFriendIds = new Set(
    chats
      .filter((c) => c.type === "direct" && c.members.includes(currentUser?.uid || ""))
      .flatMap((c) => c.members)
      .filter((m) => m !== currentUser?.uid),
  );
  const addableUsers = users.filter(
    (u) =>
      chatFriendIds.has(u.uid) &&
      u.uid !== activeCall.peerId &&
      !(activeCall.participants || []).includes(u.uid) &&
      (!addSearch ||
        u.username.toLowerCase().includes(addSearch.toLowerCase()) ||
        u.displayName.toLowerCase().includes(addSearch.toLowerCase())),
  );

  return (
    <div className="fixed inset-0 z-[10000] bg-[#0b141a] text-white flex flex-col">
      {isVideo && cameraOn && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
      )}
      {(!isVideo || !cameraOn) && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#134d3b] via-[#0b141a] to-black" />
      )}

      <div className="relative z-10 flex flex-col items-center pt-16 flex-1 overflow-y-auto">
        {(!isVideo || !cameraOn) && (
          <img
            src={peer.photoURL}
            alt={peer.displayName}
            className="w-32 h-32 rounded-full object-cover shadow-2xl border-4 border-white/10 mb-6"
          />
        )}
        <h2 className="text-2xl font-medium flex items-center gap-1.5">
          {peer.displayName}
          {peer.isVerified && (
            <BadgeCheck size={20} className="text-white fill-[#1da1f2]" />
          )}
        </h2>
        <p className="text-white/70 mt-2 text-[15px]">
          {ringing
            ? `${activeCall.incoming ? "Incoming" : "Ringing…"} ${isVideo ? "Video call" : "Voice call"}`
            : formatDuration(elapsed)}
        </p>
        <p className="text-white/40 mt-1 text-[12px]">End-to-end encrypted</p>

        {participantUsers.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mt-6 px-6">
            {participantUsers.map((u) => (
              <div key={u!.uid} className="flex flex-col items-center gap-1">
                <img src={u!.photoURL} className="w-14 h-14 rounded-full object-cover border-2 border-white/20" />
                <span className="text-[12px] text-white/80">{u!.displayName}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isVideo && cameraOn && (
        <div className="absolute top-6 right-4 w-28 h-40 rounded-xl overflow-hidden border border-white/20 shadow-xl bg-black/50 z-10">
          <video
            autoPlay
            muted
            playsInline
            ref={(el) => {
              if (el && streamRef.current) el.srcObject = streamRef.current;
            }}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="relative z-10 pb-12 px-6">
        {activeCall.status === "answered" && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-full text-sm"
            >
              <UserPlus size={18} /> Add member
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-5">
          {ringing && activeCall.incoming ? (
            <>
              <button
                onClick={hangUp}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg"
                title="Decline"
              >
                <PhoneOff size={26} />
              </button>
              <button
                onClick={() => {
                  stopRingtone();
                  answerCall();
                }}
                className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center shadow-lg"
                title="Answer"
              >
                <Video size={26} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setMuted(!muted)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${muted ? "bg-white text-[#0b141a]" : "bg-white/15 hover:bg-white/25"}`}
                title={muted ? "Unmute" : "Mute"}
              >
                {muted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>

              <button
                onClick={() => setSpeaker(!speaker)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${speaker ? "bg-white/15 hover:bg-white/25" : "bg-white text-[#0b141a]"}`}
                title="Speaker"
              >
                {speaker ? <Volume2 size={24} /> : <VolumeX size={24} />}
              </button>

              {isVideo && (
                <>
                  <button
                    onClick={() => setCameraOn(!cameraOn)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${cameraOn ? "bg-white/15 hover:bg-white/25" : "bg-white text-[#0b141a]"}`}
                    title="Camera"
                  >
                    {cameraOn ? <Video size={24} /> : <VideoOff size={24} />}
                  </button>
                  <button
                    onClick={() => setFrontCamera(!frontCamera)}
                    className="w-14 h-14 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"
                    title="Switch camera"
                  >
                    <SwitchCamera size={24} />
                  </button>
                </>
              )}

              <button
                onClick={hangUp}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg transition-transform active:scale-95"
                title="End call"
              >
                <PhoneOff size={26} />
              </button>
            </>
          )}
        </div>
      </div>

      {showAddMember && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[10001]">
          <div className="bg-[#111b21] rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden max-h-[70vh] flex flex-col">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold">Add member to call</h3>
              <button onClick={() => setShowAddMember(false)} className="text-white/60">
                <X size={18} />
              </button>
            </div>
            <div className="p-3 border-b border-white/10 flex items-center gap-2 bg-white/5 mx-3 mt-3 rounded-lg px-3">
              <Search size={16} className="text-white/50" />
              <input
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                placeholder="Search your chats"
                className="bg-transparent outline-none text-sm py-2 flex-1 text-white placeholder-white/40"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {addableUsers.length === 0 && (
                <div className="text-center text-white/50 text-sm py-6">No users found</div>
              )}
              {addableUsers.map((u) => (
                <div
                  key={u.uid}
                  onClick={() => {
                    addMemberToCall(u.uid);
                    setShowAddMember(false);
                  }}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 cursor-pointer"
                >
                  <img src={u.photoURL} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-medium text-[15px]">{u.displayName}</div>
                    <div className="text-[12px] text-white/50">@{u.username}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
