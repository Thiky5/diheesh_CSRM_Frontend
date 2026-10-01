import React from 'react';
import { Building2, Calendar, BookOpen, ShieldCheck, Bell, LogOut, User, HelpCircle, Layers, LogIn, UserPlus } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  unreadCount,
  onOpenNotifications,
}) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(7, 11, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '0 24px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <div
          onClick={() => setActiveTab('resources')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Building2 size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                CSRM
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary-light)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Campus v2.0
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1 }}>
              Smart Resource Management
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('resources')}
            className="btn btn-secondary btn-sm"
            style={{
              background: activeTab === 'resources' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderColor: activeTab === 'resources' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'resources' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            <Layers size={16} /> Campus Resources
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className="btn btn-secondary btn-sm"
            style={{
              background: activeTab === 'calendar' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderColor: activeTab === 'calendar' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'calendar' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            <Calendar size={16} /> Booking Calendar
          </button>

          {user && (
            <button
              onClick={() => setActiveTab('my-bookings')}
              className="btn btn-secondary btn-sm"
              style={{
                background: activeTab === 'my-bookings' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                borderColor: activeTab === 'my-bookings' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'my-bookings' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              <BookOpen size={16} /> My Reservations
            </button>
          )}

          {user && (user.role === 'STUDENT' || user.role === 'FACULTY') && (
            <button
              onClick={() => setActiveTab('services')}
              className="btn btn-secondary btn-sm"
              style={{
                background: activeTab === 'services' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                borderColor: activeTab === 'services' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'services' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              <HelpCircle size={16} /> Services Help
            </button>
          )}

          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('admin')}
              className="btn btn-secondary btn-sm"
              style={{
                background: activeTab === 'admin' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))' : 'transparent',
                borderColor: activeTab === 'admin' ? '#f59e0b' : 'transparent',
                color: activeTab === 'admin' ? '#fbbf24' : 'var(--text-secondary)',
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={16} color="#f59e0b" /> Admin Control
            </button>
          )}

          {!user && (
            <button
              onClick={() => setActiveTab('auth')}
              className="btn btn-secondary btn-sm"
              style={{
                background: activeTab === 'auth' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                borderColor: activeTab === 'auth' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'auth' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              <User size={16} /> Login & Register
            </button>
          )}
        </nav>

        {/* Right Section: Notification and User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Notifications Button */}
          {user && (
            <button
              onClick={onOpenNotifications}
              className="btn-icon"
              style={{ position: 'relative' }}
              title="Campus Notifications & Alerts"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '18px',
                    height: '18px',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    borderRadius: '50%',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px var(--primary)',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Auth / Profile Area */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.fullName || user.username}</span>
                <span className={`badge badge-${user.role.toLowerCase()}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="btn btn-secondary btn-sm"
                title="Sign out"
                style={{ padding: '6px 10px' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setActiveTab('auth')} className="btn btn-primary btn-sm">
                <LogIn size={15} /> Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
