import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Home = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState('');

  // Password change bonus state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    // Fetch customer profile from GET /customers/me
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/customers/me');
        setProfile(response.data);
        if (setUser) setUser(response.data);
      } catch (err) {
        // If 401 Unauthorized or any error, redirect to /login
        console.warn('Authentication check failed, redirecting to login:', err);
        if (setUser) setUser(null);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, setUser]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
      if (setUser) setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      if (setUser) setUser(null);
      navigate('/login');
    }
  };

  // Handle bonus password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });

    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setPwMsg({ type: 'error', text: 'Please fill in both fields.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    try {
      setPwLoading(true);
      const res = await api.patch('/customers/change-password', passwordForm);
      setPwMsg({ type: 'success', text: res.data.message || 'Password changed successfully!' });
      setPasswordForm({ oldPassword: '', newPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPwMsg({ type: '', text: '' });
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password.';
      setPwMsg({ type: 'error', text: msg });
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="home-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="banner-content">
          <h1>Welcome back, {profile.fullName}! 👋</h1>
          <p>You are logged into your secure ShopKart customer portal.</p>
        </div>
        <div className="banner-actions">
          <button onClick={() => setShowPasswordModal(true)} className="btn-secondary">
            🔑 Change Password
          </button>
          <button onClick={handleLogout} className="btn-danger">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Customer Profile Details Card */}
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar-circle">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3>{profile.fullName}</h3>
              <span className="badge-verified">Verified Customer</span>
            </div>
          </div>

          <hr className="divider" />

          <div className="details-list">
            <div className="detail-item">
              <span className="detail-label">Customer ID</span>
              <span className="detail-value id-code">{profile._id}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{profile.email}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Phone Number</span>
              <span className="detail-value">{profile.phone}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Account Created</span>
              <span className="detail-value">
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Recent'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Password (Bonus)</h3>
              <button className="close-btn" onClick={() => setShowPasswordModal(false)}>
                &times;
              </button>
            </div>

            {pwMsg.text && (
              <div className={`alert ${pwMsg.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                {pwMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="auth-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password (min 6 chars)"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={pwLoading}>
                  {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
