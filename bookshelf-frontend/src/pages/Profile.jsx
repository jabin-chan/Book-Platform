import { useEffect, useState } from 'react';
import { KeyRound, Star, BookOpen, Bookmark, CalendarDays, Check, X } from 'lucide-react';
import api from '../api';

function getInitials(username) {
  return username ? username.slice(0, 2).toUpperCase() : '?';
}

function getAvatarColor(username) {
  const colors = ['#A3B899', '#D8C69B', '#F5E5C9', '#5C7A52'];
  if (!username) return colors[0];
  const sum = username.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return colors[sum % colors.length];
}

function StatCard({ icon, label, value }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 py-4 px-3 bg-[#FFFDF6]"
      style={{ border: '2.5px solid #4A3423', borderRadius: '18px 22px 16px 20px', boxShadow: '3px 3px 0 #4A3423' }}
    >
      <div style={{ color: '#5C7A52' }}>{icon}</div>
      <p className="text-lg font-bold text-[#4A3423]">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#4A3423]/60">{label}</p>
    </div>
  );
}

export default function Profile({ user }) {
  const [profile, setProfile] = useState(user);
  const [stats, setStats] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(res => setProfile(res.data)).catch(() => {});
    api.get('/auth/stats').then(res => setStats(res.data)).catch(() => setStats(null));
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword !== confirmPassword) {
      setPwError("New passwords don't match");
      return;
    }

    setSubmitting(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setPwSuccess('Password updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowPasswordForm(false), 1500);
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FBEDD1] flex items-center justify-center">
        <p className="text-[#4A3423]">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBEDD1] px-4 md:px-8 pt-8 pb-20">
      <div className="max-w-2xl mx-auto">

        <div
          className="bg-[#FFFDF4] p-6 mb-6 flex flex-col sm:flex-row items-center gap-5"
          style={{ border: '3px solid #4A3423', borderRadius: '28px 20px 30px 18px', boxShadow: '6px 6px 0 #4A3423' }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-[#33422F] flex-shrink-0"
            style={{ background: getAvatarColor(profile.username), border: '3px solid #4A3423' }}
          >
            {getInitials(profile.username)}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-xl font-bold text-[#4A3423]">{profile.username}</h1>
            <p className="text-sm text-[#4A3423]/60">{profile.email}</p>
            {profile.created_at && (
              <p className="flex items-center gap-1 justify-center sm:justify-start text-xs text-[#5C7A52] mt-1 font-medium">
                <CalendarDays size={12} />
                Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard icon={<Star size={18} />} label="Reviews" value={stats.review_count} />
            <StatCard icon={<Star size={18} />} label="Avg Given" value={stats.avg_rating_given ? Number(stats.avg_rating_given).toFixed(1) : '—'} />
            <StatCard icon={<BookOpen size={18} />} label="Reading" value={stats.shelf.currently_reading} />
            <StatCard icon={<Bookmark size={18} />} label="Finished" value={stats.shelf.finished} />
          </div>
        )}

        <div
          className="bg-[#FFFDF6] p-5"
          style={{ border: '2.5px solid #4A3423', borderRadius: '20px 26px 18px 24px', boxShadow: '4px 4px 0 #4A3423' }}
        >
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
            style={{ color: '#5C7A52' }}
          >
            <KeyRound size={14} />
            Change Password
          </button>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                required
                className="w-full px-3 py-2 text-xs text-[#4A3423] bg-[#FFFDF6] focus:outline-none"
                style={{ border: '2px solid #D8C69B', borderRadius: '12px' }}
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                required
                className="w-full px-3 py-2 text-xs text-[#4A3423] bg-[#FFFDF6] focus:outline-none"
                style={{ border: '2px solid #D8C69B', borderRadius: '12px' }}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full px-3 py-2 text-xs text-[#4A3423] bg-[#FFFDF6] focus:outline-none"
                style={{ border: '2px solid #D8C69B', borderRadius: '12px' }}
              />

              {pwError && <p className="text-xs text-red-500 flex items-center gap-1"><X size={12} />{pwError}</p>}
              {pwSuccess && <p className="text-xs flex items-center gap-1" style={{ color: '#5C7A52' }}><Check size={12} />{pwSuccess}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="text-xs font-semibold px-4 py-2 disabled:opacity-50 transition"
                style={{ background: '#A3B899', color: '#33422F', border: '2px solid #4A3423', borderRadius: '10px' }}
              >
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}