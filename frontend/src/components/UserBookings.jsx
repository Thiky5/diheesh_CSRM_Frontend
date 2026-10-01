import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, MapPin, Edit3, XCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { bookingService } from '../services/api';

export default function UserBookings({
  bookings,
  onModifyBooking,
  onRefresh,
  loading,
}) {
  const [filter, setFilter] = useState('UPCOMING');
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState(null);

  const now = new Date();

  const filteredBookings = bookings.filter((b) => {
    const end = new Date(b.endTime);
    if (filter === 'UPCOMING') return end >= now && b.status !== 'CANCELLED';
    if (filter === 'PAST') return end < now && b.status !== 'CANCELLED';
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? The slot will immediately be freed for other campus members.')) {
      return;
    }

    setCancellingId(id);
    setCancelError(null);
    try {
      await bookingService.cancel(id);
      onRefresh();
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ padding: '30px 0 20px 0' }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '6px' }}>
          My Campus Reservations
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Track upcoming lab sessions, modify reservation times, or cancel booked equipment.
        </p>
      </div>

      {cancelError && (
        <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '16px', color: '#f87171', fontSize: '0.84rem' }}>
          {cancelError}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { id: 'UPCOMING', label: 'Upcoming Bookings' },
          { id: 'PAST', label: 'Past & Completed' },
          { id: 'CANCELLED', label: 'Cancelled' },
          { id: 'ALL', label: 'All History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.84rem',
              fontWeight: 600,
              border: '1px solid',
              borderColor: filter === tab.id ? 'var(--primary)' : 'var(--border-subtle)',
              background: filter === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
              color: filter === tab.id ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading your reservations...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
            No Reservations Found
          </h3>
          <p style={{ fontSize: '0.82rem' }}>You have no bookings matching the selected filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="glass-panel"
              style={{
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                borderLeft: b.status === 'CONFIRMED' ? '4px solid var(--primary)' : b.status === 'CANCELLED' ? '4px solid var(--danger)' : '4px solid var(--warning)',
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span className={`badge badge-${b.resourceType?.toLowerCase()}`}>
                    {b.resourceType}
                  </span>
                  <span className={`badge badge-${b.status.toLowerCase()}`}>
                    {b.status}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Ref #{b.id}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
                  {b.resourceName}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> {b.resourceLocation}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} />
                    {new Date(b.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
                    <Clock size={14} />
                    {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {b.purpose && (
                  <p style={{ marginTop: '10px', fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                    <strong>Purpose:</strong> {b.purpose}
                  </p>
                )}
                {b.notes && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Notes: {b.notes}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              {b.status !== 'CANCELLED' && new Date(b.endTime) >= now && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => onModifyBooking(b)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Edit3 size={15} /> Modify Time
                  </button>
                  <button
                    onClick={() => handleCancel(b.id)}
                    disabled={cancellingId === b.id}
                    className="btn btn-danger btn-sm"
                  >
                    <XCircle size={15} /> {cancellingId === b.id ? 'Cancelling...' : 'Cancel'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
