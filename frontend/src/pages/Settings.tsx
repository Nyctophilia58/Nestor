import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import { useAuthStore } from "../store/authStore";

const isValidBDPhone = (phone: string) =>
  /^(?:\+?88)?01[3-9]\d{8}$/.test(phone)

const getPasswordStrength = (password: string) => {
  const rules = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /\d/.test(password) },
    { label: 'Special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]
  const score = rules.filter(r => r.met).length
  return { rules, score }
}

const Settings = () => {
  const { user, token, logout, setAuth } = useAuthStore();
  const navigate = useNavigate();

  const [openTile, setOpenTile] = useState<string | null>(null);

  // Personal Info
  const [name, setName] = useState(user?.name || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [savingInfo, setSavingInfo] = useState(false)

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false)

  // Role
  const [role, setRole] = useState(user?.role || "tenant")
  const [savingRole, setSavingRole] = useState(false)

  // Notifications
  const [notifications, setNotifications] = useState(true);

  if (!user) return <Navigate to="/login" replace />;

  const toggleTile = (title: string) =>
    setOpenTile(openTile === title ? null : title)

  // Save personal info
  const handleSaveInfo = async (e: FormEvent) => {
    e.preventDefault()
    if (phone && !isValidBDPhone(phone)) {
      toast.error('Enter a valid Bangladeshi phone number')
      return
    }
    setSavingInfo(true)
    try {
      const res = await api.put('/auth/profile', { name, phone })
      setAuth(res.data, token!)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSavingInfo(false)
    }
  }

  // Save role
  const handleSaveRole = async () => {
    if (role === user.role) return
    setSavingRole(true)
    try {
      const res = await api.patch('/auth/role', { role })
      setAuth(res.data, token!)
      toast.success('Account type updated!')
    } catch {
      toast.error('Failed to update account type')
    } finally {
      setSavingRole(false)
    }
  }

  // Change password
  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    const { score } = getPasswordStrength(newPassword)
    if (score < 5) {
      toast.error('Password does not meet all requirements')
      return
    }
    setSavingPassword(true)
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      toast.success("Password updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPassword(false)
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Delete your account?</p>
        <p className="text-xs text-gray-400">This cannot be undone.</p>
        <div className="flex gap-2 mt-1">
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                await api.delete("/auth/me")
                toast.success("Account deleted")
                logout()
                navigate("/", { replace: true })
              } catch (err) {
                toast.error(getErrorMessage(err))
              }
            }}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-500 text-white rounded text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    ))
  }

  const tiles = [
    {
      title: 'Personal Information',
      subtitle: 'Update your name and phone number',
      content: (
        <form onSubmit={handleSaveInfo} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </div>

          {/* Email — read only */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Email <span className="text-white/30 text-xs">(cannot be changed)</span>
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2.5 glass rounded-lg text-white/40 text-sm cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01700000000"
              className={`w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 ${
                phone && !isValidBDPhone(phone)
                  ? 'focus:ring-red-400/50 ring-1 ring-red-400/30'
                  : 'focus:ring-emerald-400/50'
              }`}
            />
            {phone && !isValidBDPhone(phone) && (
              <p className="text-red-400 text-xs mt-1">
                Enter a valid BD number (e.g. 01712345678)
              </p>
            )}
            {phone && isValidBDPhone(phone) && (
              <p className="text-emerald-400 text-xs mt-1">✓ Valid phone number</p>
            )}
          </div>

          <button
            type="submit"
            disabled={savingInfo}
            className="px-5 py-2.5 bg-emerald-500/80 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition disabled:opacity-50"
          >
            {savingInfo ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )
    },
    {
      title: 'Account Type',
      subtitle: user.role === 'admin' ? 'Admins cannot change their account type' : 'Switch between Tenant and Landlord',
      content: user.role === 'admin' ? (
        <p className="text-white/50 text-sm">Admins are locked to the admin role. This setting is not available.</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'tenant', label: '🔍 Tenant', desc: 'Looking for a property' },
              { value: 'landlord', label: '🏠 Landlord', desc: 'Listing a property' },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value as "tenant" | "landlord")}
                className={`p-3 rounded-xl border text-left transition ${
                  role === r.value
                    ? 'border-emerald-400 bg-emerald-500/15'
                    : 'glass border-white/10 hover:border-white/20'
                }`}
              >
                <p className="text-white text-sm font-medium">{r.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>
          {role !== user.role && (
            <p className="text-yellow-400 text-xs">
              ⚠️ Switching to {role} will change what you can do on the platform.
            </p>
          )}
          <button
            onClick={handleSaveRole}
            disabled={savingRole || role === user.role}
            className="px-5 py-2.5 bg-emerald-500/80 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition disabled:opacity-50"
          >
            {savingRole ? 'Saving...' : role === user.role ? 'No Changes' : 'Save Account Type'}
          </button>
        </div>
      )
    },
    {
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      content: (
        <div className="space-y-3">
          {[
            { label: 'Email notifications', desc: 'Receive updates about your listings and saved properties' },
            { label: 'New listing alerts', desc: 'Get notified when new properties match your search' },
            { label: 'Account activity', desc: 'Security alerts and account-related emails' },
          ].map((item) => (
            <label key={item.label} className="flex items-start justify-between gap-4 cursor-pointer">
              <div>
                <p className="text-white text-sm">{item.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
              </div>
              <div
                onClick={() => setNotifications(!notifications)}
                className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5 relative cursor-pointer ${
                  notifications ? 'bg-emerald-500' : 'bg-white/20'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  notifications ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </div>
            </label>
          ))}
        </div>
      )
    },
    {
      title: 'Change Password',
      subtitle: 'Update your account password',
      content: (
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
            {newPassword && (() => {
              const { rules, score } = getPasswordStrength(newPassword)
              const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][score]
              const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-400'][score]
              return (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? strengthColor : 'bg-white/10'}`} />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${score <= 1 ? 'text-red-400' : score === 2 ? 'text-orange-400' : score === 3 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                      {strengthLabel}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {rules.map((rule) => (
                      <p key={rule.label} className={`text-xs flex items-center gap-1 ${rule.met ? 'text-emerald-400' : 'text-white/30'}`}>
                        {rule.met ? '✓' : '○'} {rule.label}
                      </p>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 ${
                confirmPassword && confirmPassword !== newPassword
                  ? 'focus:ring-red-400/50 ring-1 ring-red-400/30'
                  : 'focus:ring-emerald-400/50'
              }`}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
            )}
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="px-5 py-2.5 bg-emerald-500/80 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition disabled:opacity-50"
          >
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )
    },
    {
      title: 'Delete Account',
      subtitle: 'Permanently delete your account and all data',
      content: (
        <div>
          <div className="p-4 bg-red-500/10 border border-red-400/20 rounded-xl mb-4">
            <p className="text-red-300 text-sm font-medium mb-1">⚠️ This action is irreversible</p>
            <p className="text-red-300/60 text-xs leading-relaxed">
              Deleting your account will permanently remove all your data, listings,
              and saved properties. This cannot be undone.
            </p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="px-5 py-2.5 bg-red-500/20 text-red-400 border border-red-400/30 text-sm font-medium rounded-lg hover:bg-red-500/30 transition"
          >
            Delete My Account
          </button>
        </div>
      )
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Account Settings</h1>
        <p className="text-white/40 text-sm mt-1">Manage your profile and preferences</p>
      </div>

      {/* User Info Card */}
      <div className="glass-light rounded-2xl p-5 flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-2xl flex-shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-white font-semibold">{user.name}</p>
          <p className="text-white/40 text-sm">{user.email}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
            user.role === 'admin'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
              : user.role === 'landlord'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
          }`}>
            {user.role}
          </span>
        </div>
      </div>

      {/* Accordion Tiles */}
      <div className="space-y-3">
        {tiles.map((item) => (
          <div key={item.title} className="glass-card rounded-xl overflow-hidden">
            <button
              onClick={() => toggleTile(item.title)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div>
                <p className="font-medium text-white text-sm">{item.title}</p>
                <p className="text-white/40 text-xs mt-0.5">{item.subtitle}</p>
              </div>
              <span className={`text-emerald-400 transition-transform flex-shrink-0 ml-4 ${
                openTile === item.title ? 'rotate-180' : ''
              }`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {openTile === item.title && (
              <div className="px-5 pb-5">
                <div className="w-full h-px bg-white/10 mb-4" />
                {item.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Settings;
