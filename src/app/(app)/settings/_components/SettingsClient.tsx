'use client';

import { useState, useTransition, useRef } from 'react';
import { updateProfile, updateProfileImage } from '@/lib/actions/settings.actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input }   from '@/components/ui/input';
import { Button }  from '@/components/ui/button';
import { Shield, User, Loader2, Camera } from 'lucide-react';
import { toast }   from 'sonner';
import { cn }      from '@/lib/utils';

interface UserData {
  id:     string;
  name:   string;
  email:  string;
  image:  string | null;
  role:   string;
}

const TABS = ['Profile', 'Notifications', 'Security', 'Appearance'] as const;
type Tab = typeof TABS[number];

const ROLE_CONFIG: Record<string, { label: string; icon: React.ReactNode; class: string }> = {
  admin:  { label: 'Admin',  icon: <Shield className="w-3 h-3" />, class: 'bg-violet-50 text-violet-600 border border-violet-200' },
  member: { label: 'Member', icon: <User   className="w-3 h-3" />, class: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
};

export default function SettingsClient({ user }: { user: UserData }) {
  const [activeTab,    setActiveTab]    = useState<Tab>('Profile');
  const [firstName,    setFirstName]    = useState(user.name.split(' ')[0] ?? '');
  const [lastName,     setLastName]     = useState(user.name.split(' ').slice(1).join(' ') ?? '');
  const [avatarUrl,    setAvatarUrl]    = useState(user.image ?? '');
  const [isPending,    startTransition] = useTransition();
  const [isUploading,  setIsUploading]  = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const role = ROLE_CONFIG[user.role?.toLowerCase()] ?? ROLE_CONFIG.member;

  // ── Upload to Cloudinary ──────────────────────────────────
  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return toast.error('Only JPG, PNG or WebP allowed');
    }
    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Image must be under 2MB');
    }

    setIsUploading(true);
    try {
      const cloudName  = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'devflow/avatars');

      const res  = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const url  = data.secure_url as string;

      setAvatarUrl(url);
      await updateProfileImage(url);
      toast.success('Photo updated!');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  }

  // ── Save name ─────────────────────────────────────────────
  function handleSave() {
    if (!firstName.trim()) return toast.error('First name is required');
    startTransition(async () => {
      try {
        await updateProfile({ firstName, lastName });
        toast.success('Profile updated!');
      } catch {
        toast.error('Failed to update profile');
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Tabs */}
      <div className="flex border-b px-6 pt-4 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors rounded-t-lg -mb-px',
              activeTab === tab
                ? 'text-gray-900 border-b-2 border-violet-600'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'Profile' && (
          <div className="space-y-6 max-w-lg">

            {/* Avatar upload */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16 rounded-2xl border border-gray-100">
                  <AvatarImage src={avatarUrl || undefined} className="object-cover" />
                  <AvatarFallback className="rounded-2xl text-lg font-bold bg-violet-100 text-violet-600">
                    {(firstName[0] ?? user.name[0] ?? '?').toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Upload button overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {isUploading
                    ? <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
                    : <Camera  className="w-3 h-3 text-gray-500" />
                  }
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Change Photo'}
                </button>
                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP. Max 2MB</p>
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="text-sm bg-gray-50 border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="text-sm bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Email</label>
              <Input
                value={user.email}
                disabled
                className="text-sm bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Role</label>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${role.class}`}>
                  {role.icon}
                  {role.label}
                </span>
                <span className="text-xs text-gray-400">Contact owner to change role</span>
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                disabled={isPending || isUploading}
                className="bg-violet-600 hover:bg-violet-700 text-white px-6"
              >
                {isPending
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />Saving...</>
                  : 'Save Changes'
                }
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'Notifications' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-gray-400">Notification preferences coming soon</p>
          </div>
        )}
        {activeTab === 'Security' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-gray-400">Security settings coming soon</p>
          </div>
        )}
        {activeTab === 'Appearance' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-gray-400">Appearance settings coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
