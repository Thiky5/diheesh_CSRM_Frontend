import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Shield, UserCheck } from 'lucide-react';
import { adminService } from '../services/api';

export default function UserFormModal({ isOpen, onClose, userToEdit, onSaveSuccess }) {
  const isEditing = Boolean(userToEdit);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [status, setStatus] = useState('APPROVED');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userToEdit) {
      setFullName(userToEdit.fullName || '');
      setUsername(userToEdit.username || '');
      setEmail(userToEdit.email || '');
      setPassword('');
      setRole(userToEdit.role || 'STUDENT');
      setStatus(userToEdit.status || 'APPROVED');
    } else {
      setFullName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('STUDENT');
      setStatus('APPROVED');
    }
    setError(null);
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEditing) {
        await adminService.updateUser(userToEdit.id, {
          fullName,
          email,
          role,
          status,
          password: password ? password : null,
        });
      } else {
        await adminService.createUser({
          fullName,
          username,
          email,
          password,
          role,
          status,
        });
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed. Please verify the details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {isEditing ? `Edit User: @${userToEdit.username}` : 'Add New Campus User'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {isEditing
                ? 'Update account details, role assignment, or reset password'
                : 'Directly provision a new account with instant login access'}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              fontSize: '0.84rem',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="user-fullname">Full Name</label>
            <input
              id="user-fullname"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Arthur Clark"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="user-username">Username</label>
              <input
                id="user-username"
                type="text"
                required
                disabled={isEditing}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="form-input"
                style={{ opacity: isEditing ? 0.65 : 1 }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="user-email">Campus Email</label>
              <input
                id="user-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@campus.edu"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="user-password">
              {isEditing ? 'New Password (leave empty to keep unchanged)' : 'Initial Password'}
            </label>
            <input
              id="user-password"
              type="password"
              required={!isEditing}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditing ? '••••••••' : 'Enter initial password'}
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="user-role">Role</label>
              <select
                id="user-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-select"
              >
                <option value="STUDENT">STUDENT</option>
                <option value="FACULTY">FACULTY</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="user-status">Status</label>
              <select
                id="user-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-select"
              >
                <option value="APPROVED">APPROVED (Active)</option>
                <option value="PENDING">PENDING (Approval Req.)</option>
                <option value="REJECTED">REJECTED (Blocked)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
