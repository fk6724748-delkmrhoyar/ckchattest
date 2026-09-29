import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { Button } from './ui/Button';
import { Database, CheckCircle } from 'lucide-react';

import { pushNow } from '../lib/sync';

export default function InstallScreen({ serverMode = false, onInstalled }: { serverMode?: boolean; onInstalled?: () => void }) {
  const [error, setError] = useState('');
  const installSystem = useAppStore(state => state.installSystem);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [dbInfo, setDbInfo] = useState({ host: 'localhost', user: 'root', pass: '', name: '' });
  const [adminInfo, setAdminInfo] = useState({ username: '', email: '', displayName: '', pass: '' });

  const handleDbSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!dbInfo.host.trim() || !dbInfo.name.trim() || !dbInfo.user.trim()) return setError('Please fill all database fields.');
    setStep(2);
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!adminInfo.username.trim() || !adminInfo.displayName.trim() || !adminInfo.email.trim() || adminInfo.pass.length < 6)
      return setError('Please fill all admin fields (password min 6 characters).');
    setLoading(true);
    try {
      if (serverMode) {
        const r = await fetch('/api/install', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ db: dbInfo, admin: adminInfo }) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j.ok) { setLoading(false); if (r.status === 403) window.location.reload(); return setError(j.error || 'Installation failed'); }
      }
      installSystem(adminInfo);
      if (serverMode) await pushNow(useAppStore.getState());
      setLoading(false);
      onInstalled?.();
      window.location.hash = '#/admin';
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Installation failed');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f0f2f5] items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-xl overflow-hidden border border-[#00a884]/20">
        <div className="bg-[#00a884] p-6 text-white text-center">
           <Database className="w-12 h-12 mx-auto mb-3" />
           <h1 className="text-2xl font-bold">CK Chat Installation</h1>
           <p className="text-white/80 mt-1">Set up your database and admin profile</p>
        </div>

        <div className="p-8">
          {error && <div className="mb-4 rounded bg-red-50 border border-red-200 text-red-600 text-sm p-3">{error}</div>}
          {step === 1 ? (
            <form onSubmit={handleDbSimulate} className="flex flex-col gap-5">
               <div className="text-[#54656f] font-medium border-b pb-2 mb-2">Step 1: Database Setup</div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-sm text-[#54656f] mb-1 block">Database Host</label>
                   <input required type="text" value={dbInfo.host} onChange={e => setDbInfo({...dbInfo, host: e.target.value})} className="w-full bg-[#f0f2f5] rounded py-2 px-3 outline-none text-sm focus:border-[#00a884] border" />
                 </div>
                 <div>
                   <label className="text-sm text-[#54656f] mb-1 block">Database Name</label>
                   <input required type="text" value={dbInfo.name} onChange={e => setDbInfo({...dbInfo, name: e.target.value})} className="w-full bg-[#f0f2f5] rounded py-2 px-3 outline-none text-sm focus:border-[#00a884] border" />
                 </div>
                 <div>
                   <label className="text-sm text-[#54656f] mb-1 block">Database User</label>
                   <input required type="text" value={dbInfo.user} onChange={e => setDbInfo({...dbInfo, user: e.target.value})} className="w-full bg-[#f0f2f5] rounded py-2 px-3 outline-none text-sm focus:border-[#00a884] border" />
                 </div>
                 <div>
                   <label className="text-sm text-[#54656f] mb-1 block">Database Password</label>
                   <input type="password" value={dbInfo.pass} onChange={e => setDbInfo({...dbInfo, pass: e.target.value})} className="w-full bg-[#f0f2f5] rounded py-2 px-3 outline-none text-sm focus:border-[#00a884] border" />
                 </div>
               </div>

               <Button type="submit" disabled={loading} className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white mt-4 font-bold">
                 {loading ? 'Connecting to Database and Creating Tables...' : 'Next: Setup Admin'}
               </Button>
            </form>
          ) : (
            <form onSubmit={handleFinish} className="flex flex-col gap-5">
               <div className="text-[#54656f] font-medium border-b pb-2 mb-2 flex items-center justify-between">
                 <span>Step 2: Admin Profile</span>
                 <span className="text-[#00a884] flex items-center text-xs"><CheckCircle size={14} className="mr-1"/> Database Connected</span>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-sm text-[#54656f] mb-1 block">Admin Username</label>
                   <input required type="text" value={adminInfo.username} onChange={e => setAdminInfo({...adminInfo, username: e.target.value})} className="w-full bg-[#f0f2f5] rounded py-2 px-3 outline-none text-sm focus:border-[#00a884] border" />
                 </div>
                 <div>
                   <label className="text-sm text-[#54656f] mb-1 block">Admin Display Name</label>
                   <input required type="text" value={adminInfo.displayName} onChange={e => setAdminInfo({...adminInfo, displayName: e.target.value})} className="w-full bg-[#f0f2f5] rounded py-2 px-3 outline-none text-sm focus:border-[#00a884] border" />
                 </div>
                 <div className="col-span-2">
                   <label className="text-sm text-[#54656f] mb-1 block">Admin Email</label>
                   <input required type="email" value={adminInfo.email} onChange={e => setAdminInfo({...adminInfo, email: e.target.value})} className="w-full bg-[#f0f2f5] rounded py-2 px-3 outline-none text-sm focus:border-[#00a884] border" />
                 </div>
                 <div className="col-span-2">
                   <label className="text-sm text-[#54656f] mb-1 block">Admin Password</label>
                   <input required type="password" value={adminInfo.pass} onChange={e => setAdminInfo({...adminInfo, pass: e.target.value})} className="w-full bg-[#f0f2f5] rounded py-2 px-3 outline-none text-sm focus:border-[#00a884] border" />
                   <p className="text-xs text-gray-500 mt-1">You will use these credentials to log in to the /admin route.</p>
                 </div>
               </div>

               <Button type="submit" disabled={loading} className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white mt-4 font-bold">
                 {loading ? 'Finalizing Setup...' : 'Complete Installation'}
               </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
