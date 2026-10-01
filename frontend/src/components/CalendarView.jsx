import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User, CheckCircle2 } from 'lucide-react';
import { bookingService } from '../services/api';

export default function CalendarView({
  resources,
  selectedResource,
  onSelectResource,
  onBookSlot,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [resourceBookings, setResourceBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const activeResource =
    selectedResource || (resources.length > 0 ? resources[0] : null);
  const resourceUnavailable = activeResource?.availability === false;

  useEffect(() => {
    if (!activeResource) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await bookingService.getByResource(activeResource.id);
        setResourceBookings(res.data || []);
      } catch (err) {
        console.error('Failed to load bookings for calendar:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [activeResource]);

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate hourly blocks from 08:00 to 20:00
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  const isSlotBooked = (hour) => {
    const slotStart = new Date(currentDate);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(currentDate);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return resourceBookings.find((b) => {
      if (b.status === 'CANCELLED') return false;
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      return bStart < slotEnd && bEnd > slotStart;
    });
  };

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Header & Controls */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Resource Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
          <div style={{ padding: '10px', background: 'var(--primary-glow)', borderRadius: 'var(--radius-md)', color: 'var(--primary-light)' }}>
            <CalendarIcon size={24} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Select Campus Resource
            </label>
            <select
              value={activeResource?.id || ''}
              onChange={(e) => {
                const found = resources.find((r) => r.id === Number(e.target.value));
                if (found) onSelectResource(found);
              }}
              className="form-select"
              style={{ fontWeight: 600, minWidth: '240px' }}
            >
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.type} - {r.location})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handlePrevDay} className="btn btn-secondary btn-icon" title="Previous Day">
            <ChevronLeft size={18} />
          </button>
          <button onClick={handleToday} className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
            Today
          </button>
          <button onClick={handleNextDay} className="btn btn-secondary btn-icon" title="Next Day">
            <ChevronRight size={18} />
          </button>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, marginLeft: '8px', minWidth: '180px', textAlign: 'center' }}>
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Selected Resource info bar */}
      {activeResource && (
        <div
          style={{
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={`badge badge-${activeResource.type?.toLowerCase()}`}>
              {activeResource.type}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{activeResource.name}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• {activeResource.location}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }} /> Open Slot
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6366f1' }} /> Confirmed Booking
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} /> Pending Approval
            </span>
          </div>
        </div>
      )}

      {/* Hourly Timeline Grid */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.01)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Daily Time Slot Schedule (08:00 - 21:00)</h3>
          <p style={{ fontSize: '0.78rem', color: resourceUnavailable ? '#f87171' : 'var(--text-muted)' }}>
            {resourceUnavailable ? 'This resource is currently unavailable for booking.' : 'Click any available slot to book instant reservation'}
          </p>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading timeline...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {hours.map((hour) => {
              const booking = isSlotBooked(hour);
              const timeLabel = `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`;

              return (
                <div
                  key={hour}
                  style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    borderBottom: '1px solid var(--border-subtle)',
                    minHeight: '64px',
                    transition: 'background 0.15s ease',
                  }}
                >
                  {/* Time label column */}
                  <div
                    style={{
                      width: '140px',
                      padding: '14px 18px',
                      borderRight: '1px solid var(--border-subtle)',
                      background: 'rgba(255, 255, 255, 0.01)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={14} color="var(--text-muted)" />
                    {timeLabel}
                  </div>

                  {/* Slot content */}
                  <div style={{ flex: 1, padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                    {booking ? (
                      <div
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          borderRadius: 'var(--radius-md)',
                          background:
                            booking.status === 'CONFIRMED'
                              ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.18), rgba(99, 102, 241, 0.08))'
                              : 'rgba(245, 158, 11, 0.15)',
                          border:
                            booking.status === 'CONFIRMED'
                              ? '1px solid rgba(99, 102, 241, 0.4)'
                              : '1px solid rgba(245, 158, 11, 0.4)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                              {booking.purpose || 'Reserved Slot'}
                            </span>
                            <span className={`badge badge-${booking.status.toLowerCase()}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                              {booking.status}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <User size={12} /> Booked by: {booking.userName}
                            </span>
                            {booking.notes && (
                              <span>• {booking.notes}</span>
                            )}
                          </div>
                        </div>

                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ) : resourceUnavailable ? (
                      <div
                        style={{
                          width: '100%',
                          minHeight: '44px',
                          padding: '0 16px',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(239, 68, 68, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          color: '#f87171',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                        }}
                      >
                        Resource unavailable
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          const slotDate = new Date(currentDate);
                          slotDate.setHours(hour, 0, 0, 0);
                          const slotEndDate = new Date(currentDate);
                          slotEndDate.setHours(hour + 1, 0, 0, 0);

                          onBookSlot(activeResource, slotDate, slotEndDate);
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          minHeight: '44px',
                          background: 'rgba(16, 185, 129, 0.03)',
                          border: '1px dashed rgba(16, 185, 129, 0.25)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 16px',
                          color: '#34d399',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.03)';
                          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.25)';
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                          <CheckCircle2 size={15} /> Available Slot — Click to Reserve
                        </span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>+ Book this slot</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
