import React, { useState } from 'react';
import {
  Lock,
  User,
  Mail,
  Building2,
  CheckCircle2,
  ShieldAlert,
  X,
  ArrowLeft,
} from 'lucide-react';
import { authService } from '../services/api';

export default function AuthPage({ onLoginSuccess, initialMode = 'login', onNavigateResources }) {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await authService.register({ username, password, fullName, email, role });
        setSuccessMsg(
          res.message ||
            'Registration successful! Your account is pending administrator approval before you can log in.'
        );
        setIsRegister(false);
        setPassword('');
        setFullName('');
        setEmail('');
      } else {
        const res = await authService.login({ username, password });
        localStorage.setItem('csrm_token', res.data.token);
        localStorage.setItem('csrm_user', JSON.stringify(res.data));
        onLoginSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '40px auto 80px auto', padding: '0 16px' }}>
      {/* Back to Resources button */}
      <div style={{ marginBottom: '16px' }}>
        <button
          type="button"
          onClick={onNavigateResources}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <ArrowLeft size={16} />
          Back to Campus Resources
        </button>
      </div>

      {/* Main Simple Auth Card */}
      <div
        className="glass-panel"
        style={{
          padding: '32px 28px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
        }}
      >
        {/* Simple Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <Building2 size={24} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0' }}>
            CSRM Portal
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
            {isRegister
              ? 'Create your student or faculty account'
              : 'Sign in to reserve campus facilities'}
          </p>
        </div>

        {/* Demo admin credentials */}
        {!isRegister && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Admin demo credentials: <strong>admin</strong> / <strong>admin123</strong>
            </p>
          </div>
        )}

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '22px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
              setSuccessMsg(null);
            }}
            style={{
              flex: 1,
              padding: '9px 12px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: !isRegister ? 'var(--primary)' : 'transparent',
              color: !isRegister ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: !isRegister ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
              setSuccessMsg(null);
            }}
            style={{
              flex: 1,
              padding: '9px 12px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: isRegister ? 'var(--primary)' : 'transparent',
              color: isRegister ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: isRegister ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Register
          </button>
        </div>

        {/* Error Alert with Dismiss X */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={16} color="#f87171" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#f87171', lineHeight: 1.4 }}>
                  {error}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f87171',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                }}
                title="Clear error"
              >
                <X size={15} />
              </button>
            </div>

          </div>
        )}

        {/* Success Alert with Dismiss X */}
        {successMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--success-bg)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#34d399', lineHeight: 1.4 }}>
                {successMsg}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMsg(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#34d399',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
              }}
              title="Clear message"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isRegister && (
            <>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="simple-fullname" style={{ fontSize: '0.8rem' }}>
                  Full Name
                </label>
                <input
                  id="simple-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. John Doe"
                  className="form-input"
                  style={{ padding: '10px 12px', fontSize: '0.88rem' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="simple-email" style={{ fontSize: '0.8rem' }}>
                  Campus Email
                </label>
                <input
                  id="simple-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="username@campus.edu"
                  className="form-input"
                  style={{ padding: '10px 12px', fontSize: '0.88rem' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="simple-role" style={{ fontSize: '0.8rem' }}>
                  Role
                </label>
                <select
                  id="simple-role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    if (error) setError(null);
                  }}
                  className="form-select"
                  style={{ padding: '10px 12px', fontSize: '0.88rem' }}
                >
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="ADMIN">Administrator (Full Access)</option>
                </select>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: role === 'ADMIN' ? '#34d399' : '#fbbf24' }}>
                  {role === 'ADMIN'
                    ? '✓ Administrator accounts are instantly approved with full portal access.'
                    : '* Student & Faculty accounts require administrator approval before first login.'}
                </p>
              </div>
            </>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="simple-username" style={{ fontSize: '0.8rem' }}>
              Username
            </label>
            <input
              id="simple-username"
              type="text"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter username"
              className="form-input"
              style={{ padding: '10px 12px', fontSize: '0.88rem' }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="simple-password" style={{ fontSize: '0.8rem' }}>
              Password
            </label>
            <input
              id="simple-password"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="••••••••"
              className="form-input"
              style={{ padding: '10px 12px', fontSize: '0.88rem' }}
            />
          </div>

          <button
            id="simple-auth-submit"
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '11px',
              marginTop: '6px',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            {loading ? 'Please wait...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        {/* Footer switch */}
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                  setSuccessMsg(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-light)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                  setSuccessMsg(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-light)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Register here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
