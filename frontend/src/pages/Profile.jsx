import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineUserCircle,
  HiOutlineMail,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlinePencil,
  HiOutlineLockClosed,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api';

export default function Profile() {
  const { admin, updateAdmin } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(admin?.name || '');
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const initials = admin?.name
    ? admin.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  const handleNameSave = async () => {
    if (!name.trim()) return toast.error('Name cannot be empty');
    setSaving(true);
    try {
      const res = await updateProfile({ name: name.trim() });
      updateAdmin(res.data.token, res.data.admin);
      toast.success('Name updated successfully');
      setEditingName(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!currentPassword) return toast.error('Enter your current password');
    if (newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      const res = await updateProfile({ currentPassword, newPassword });
      updateAdmin(res.data.token, res.data.admin);
      toast.success('Password changed successfully');
      setChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-800">Profile</h1>
        <p className="text-sm text-primary-400 mt-1">Manage your account details</p>
      </div>

      {/* Profile card */}
      <div className="card p-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary-800 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{initials}</span>
          </div>
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-primary-200 rounded-lg px-3 py-1.5 text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
                <button onClick={handleNameSave} disabled={saving} className="px-3 py-1.5 bg-primary-800 text-white text-xs font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditingName(false); setName(admin?.name || ''); }} className="px-3 py-1.5 bg-primary-100 text-primary-600 text-xs font-medium rounded-lg hover:bg-primary-200">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-primary-800">{admin?.name || 'Admin User'}</h2>
                <button onClick={() => setEditingName(true)} className="p-1 text-primary-400 hover:text-primary-600 rounded-lg hover:bg-primary-100" title="Edit name">
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-sm text-primary-400 mt-0.5">{admin?.role || 'Administrator'}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span className="text-xs text-emerald-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
              <HiOutlineMail className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-primary-400 uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-primary-800">{admin?.email || 'admin@ifoa.com'}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
              <HiOutlineShieldCheck className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-primary-400 uppercase tracking-wider">Role</p>
              <p className="text-sm font-medium text-primary-800">{admin?.role || 'Administrator'}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
              <HiOutlineUserCircle className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-primary-400 uppercase tracking-wider">Organization</p>
              <p className="text-sm font-medium text-primary-800">{admin?.organization || 'IFOA - International Flight Operations Academy'}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
              <HiOutlineClock className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-primary-400 uppercase tracking-wider">Last Login</p>
              <p className="text-sm font-medium text-primary-800">
                {new Date(admin?.lastLogin || Date.now()).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
              <HiOutlineLockClosed className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-base font-bold text-primary-800">Change Password</h3>
          </div>
          {!changingPassword && (
            <button onClick={() => setChangingPassword(true)} className="px-4 py-2 bg-primary-800 text-white text-xs font-medium rounded-lg hover:bg-primary-700">
              Change Password
            </button>
          )}
        </div>
        {changingPassword && (
          <div className="space-y-3 mt-2">
            <div>
              <label className="block text-xs font-medium text-primary-500 mb-1">Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Enter current password" />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary-500 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary-500 mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Re-enter new password" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={handlePasswordSave} disabled={saving} className="px-4 py-2 bg-primary-800 text-white text-xs font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Update Password'}
              </button>
              <button onClick={() => { setChangingPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }} className="px-4 py-2 bg-primary-100 text-primary-600 text-xs font-medium rounded-lg hover:bg-primary-200">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Activity */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-primary-800 mb-4">System Information</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-primary-100">
            <span className="text-sm text-primary-500">Application Version</span>
            <span className="text-sm font-medium text-primary-800">1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-primary-100">
            <span className="text-sm text-primary-500">Database</span>
            <span className="text-sm font-medium text-primary-800">MongoDB</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-primary-100">
            <span className="text-sm text-primary-500">Certificate Engine</span>
            <span className="text-sm font-medium text-primary-800">PDFKit</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-primary-500">Environment</span>
            <span className="text-sm font-medium text-emerald-600">Production</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
