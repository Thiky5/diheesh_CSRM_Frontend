import React, { useState } from 'react';
import { X, Lock, User, Mail, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await authService.register({ username, password, fullName, email, role });
        setSuccessMsg(res.message || 'Registration submitted successfully!');
        if (res.data?.status === 'APPROVED') {
          // If approved instantly (e.g. admin registration), auto login
          setTimeout(() => {
            setIsRegister(false);
            setSuccessMsg(null);
          }, 2000);
        } else {
          // Student/faculty pending
          setTimeout(() => {
            setIsRegister(false);
          }, 3500);
        }
      } else {
        const res = await authService.login({ username, password });
        localStorage.setItem('csrm_token', res.data.token);
        localStorage.setItem('csrm_user', JSON.stringify(res.data));
        onLoginSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoUser, demoPass) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authService.login({ username: demoUser, password: demoPass });
      localStorage.setItem('csrm_token', res.data.token);
      localStorage.setItem('csrm_user', JSON.stringify(res.data));
      onLoginSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {isRegister ? 'Join Campus CSRM' : 'Sign in to CSRM'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {isRegister ? 'Create student or faculty account' : 'Access your campus resource portal'}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)' }}>
          <button
            onClick={() => { setIsRegister(false); setError(null); setSuccessMsg(null); }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              border: 'none',
              borderBottom: !isRegister ? '2px solid var(--primary)' : '2px solid transparent',
              color: !isRegister ? '#ffffff' : 'var(--text-muted)',
              fontWeight: !isRegister ? 700 : 500,
              cursor: 'pointer',
              fontSize: '0.88rem',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsRegister(true); setError(null); setSuccessMsg(null); }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              border: 'none',
              borderBottom: isRegister ? '2px solid var(--primary)' : '2px solid transparent',
              color: isRegister ? '#ffffff' : 'var(--text-muted)',
              fontWeight: isRegister ? 700 : 500,
              cursor: 'pointer',
              fontSize: '0.88rem',
            }}
          >
            Register Account
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <ShieldAlert size={18} color="#f87171" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.84rem', color: '#f87171' }}>{error}</p>
            </div>
          )}

          {successMsg && (
            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.84rem', color: '#34d399' }}>{successMsg}</p>
            </div>
          )}

          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Prof. David Miller or Jane Doe"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Campus Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campus.edu"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-select"
                >
                  <option value="STUDENT">Student (Lockers, Labs, Equipment)</option>
                  <option value="FACULTY">Faculty (Lectures, Labs, Research)</option>
                  <option value="ADMIN">Administrator (Full Campus Access)</option>
                </select>
                <p style={{ fontSize: '0.74rem', color: role === 'ADMIN' ? '#34d399' : 'var(--warning)', marginTop: '4px' }}>
                  {role === 'ADMIN'
                    ? '✓ Administrator accounts are instantly approved with full portal access.'
                    : '* New Student & Faculty accounts undergo Administrator review before login access.'}
                </p>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
          >
            {loading ? 'Processing...' : isRegister ? 'Submit Registration' : 'Log In'}
          </button>

          {/* Quick Demo Logins Section */}
          {!isRegister && (
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Sparkles size={14} color="#818cf8" />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Instant Demo Logins (Pre-configured):
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin', 'admin123')}
                  className="btn btn-secondary btn-sm"
                  style={{ flexDirection: 'column', padding: '8px 4px', fontSize: '0.74rem' }}
                >
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>Admin</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Eleanor Vance</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('faculty', 'faculty123')}
                  className="btn btn-secondary btn-sm"
                  style={{ flexDirection: 'column', padding: '8px 4px', fontSize: '0.74rem' }}
                >
                  <span style={{ color: '#c084fc', fontWeight: 700 }}>Faculty</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Oppenheim</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('student', 'student123')}
                  className="btn btn-secondary btn-sm"
                  style={{ flexDirection: 'column', padding: '8px 4px', fontSize: '0.74rem' }}
                >
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>Student</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Alex Rivera</span>
                </button>
              </div>

              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('sarah_connor', 'password123')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Test Pending User Login (Sarah Connor)
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
