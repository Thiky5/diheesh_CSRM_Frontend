import React from 'react';
import { X, CheckCheck, Bell, Mail, MessageSquare, AlertCircle } from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100vh',
          borderRadius: 0,
          background: '#0c1222',
          borderLeft: '1px solid var(--border-glow)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', background: 'var(--primary-glow)', borderRadius: 'var(--radius-md)', color: 'var(--primary-light)' }}>
              <Bell size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Notifications & Alerts</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Email, SMS & in-app updates</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close notifications">
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '12px 24px', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{notifications.length} alerts received</span>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={onMarkAllAsRead}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Bell size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '0.9rem' }}>No notifications yet</p>
              <p style={{ fontSize: '0.78rem' }}>Booking confirmations and admin alerts will appear here.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.isRead && onMarkAsRead(item.id)}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: item.isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(99, 102, 241, 0.08)',
                  border: item.isRead ? '1px solid var(--border-subtle)' : '1px solid rgba(99, 102, 241, 0.3)',
                  cursor: item.isRead ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                {!item.isRead && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      boxShadow: '0 0 8px var(--primary)',
                    }}
                  />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {item.channel === 'EMAIL' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(6, 182, 212, 0.12)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                      <Mail size={12} /> Email Dispatched
                    </span>
                  ) : item.channel === 'SMS' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.12)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                      <MessageSquare size={12} /> SMS Alert
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#c084fc', background: 'rgba(168, 85, 247, 0.12)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                      <AlertCircle size={12} /> System
                    </span>
                  )}
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {item.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
