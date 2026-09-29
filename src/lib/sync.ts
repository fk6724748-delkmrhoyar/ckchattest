import { useAppStore } from './store';

// Shared server sync: every visitor reads/writes the SAME data via api/state.php
const ARRAYS = ["users", "chats", "messages", "channels", "channelPosts", "calls", "verifyRequests", "groupInvites", "reports"] as const;
const KEYS = [...ARRAYS, 'systemSettings'] as const;
const idOf = (k: string, r: any) => (k === 'users' ? r.uid : r.id);

let applyingRemote = false;
let started = false;

export async function checkServerInstalled(): Promise<boolean | null> {
  try {
    const r = await fetch('/api/install', { cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json();
    return typeof j.installed === 'boolean' ? j.installed : null;
  } catch {
    return null; // no PHP server (local dev) -> fallback to browser mode
  }
}

async function pull() {
  try {
    const r = await fetch('/api/state', { cache: 'no-store' });
    if (!r.ok) return;
    const remote = await r.json();
    const patch: any = {};
    for (const k of KEYS) if (remote[k] !== undefined) patch[k] = remote[k];
    if (patch.systemSettings) patch.systemSettings = { ...patch.systemSettings, isInstalled: true };
    const cu = useAppStore.getState().currentUser;
    if (cu && patch.users) {
      const fresh = patch.users.find((u: any) => u.uid === cu.uid);
      patch.currentUser = fresh && !fresh.isBanned ? fresh : null;
    }
    applyingRemote = true;
    useAppStore.setState(patch);
    applyingRemote = false;
  } catch {}
}

export async function pushNow(state: any, deleted: Record<string, string[]> = {}) {
  const payload: any = {};
  for (const k of KEYS) payload[k] = state[k];
  await fetch('/api/state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: payload, deleted }),
  });
}

export function startSync() {
  if (started) return;
  started = true;
  let timer: any;
  let pendingDeleted: Record<string, Set<string>> = {};
  useAppStore.subscribe((next: any, prev: any) => {
    if (applyingRemote) return;
    let changed = false;
    for (const k of KEYS) {
      if (next[k] === prev[k]) continue;
      changed = true;
      if ((ARRAYS as readonly string[]).includes(k)) {
        const now = new Set((next[k] || []).map((r: any) => idOf(k, r)));
        for (const r of prev[k] || []) {
          const id = idOf(k, r);
          if (!now.has(id)) (pendingDeleted[k] ||= new Set()).add(id);
        }
      }
    }
    if (!changed) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      const del: Record<string, string[]> = {};
      for (const k in pendingDeleted) del[k] = [...pendingDeleted[k]];
      pendingDeleted = {};
      pushNow(useAppStore.getState(), del).then(pull).catch(() => {});
    }, 400);
  });
  pull();
  setInterval(pull, 3000);
}
