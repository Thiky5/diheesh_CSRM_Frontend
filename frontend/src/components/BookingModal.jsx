import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertTriangle, CheckCircle, FileText, Sparkles } from 'lucide-react';
import { bookingService } from '../services/api';

export default function BookingModal({
  isOpen,
  onClose,
  resource,
  existingBooking = null,
  initialSlot = null,
  onBookingSuccess,
}) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictStatus, setConflictStatus] = useState(null); // { hasConflict: boolean, message: string }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize dates
  useEffect(() => {
    const toLocalISO = (date) => {
      const offset = date.getTimezoneOffset();
      const local = new Date(date.getTime() - offset * 60000);
      return local.toISOString().slice(0, 16);
    };

    if (existingBooking) {
      setStartTime(existingBooking.startTime ? existingBooking.startTime.slice(0, 16) : '');
      setEndTime(existingBooking.endTime ? existingBooking.endTime.slice(0, 16) : '');
      setPurpose(existingBooking.purpose || '');
      setNotes(existingBooking.notes || '');
    } else if (initialSlot) {
      setStartTime(toLocalISO(initialSlot.startTime));
      setEndTime(toLocalISO(initialSlot.endTime));
      setPurpose('');
      setNotes('');
    } else {
      // Default to next rounded hour today
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);
      const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      setStartTime(toLocalISO(now));
      setEndTime(toLocalISO(end));
      setPurpose('');
      setNotes('');
    }
    setConflictStatus(null);
    setError(null);
  }, [existingBooking, initialSlot, resource, isOpen]);

  // Live conflict check when start or end time changes
  useEffect(() => {
    if (!startTime || !endTime || !resource) return;

    const startD = new Date(startTime);
    const endD = new Date(endTime);

    if (startD >= endD) {
      setConflictStatus({
        hasConflict: true,
        message: 'End time must be after start time',
      });
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingConflict(true);
      try {
        const res = await bookingService.checkConflict({
          resourceId: resource.id,
          startTime: startTime + ':00',
          endTime: endTime + ':00',
          excludeBookingId: existingBooking ? existingBooking.id : null,
        });

        if (res.data?.hasConflict) {
          setConflictStatus({
            hasConflict: true,
            message: 'Conflict detected: An overlapping reservation already exists during this window!',
          });
        } else {
          setConflictStatus({
            hasConflict: false,
            message: 'Slot is open! No booking overlaps detected.',
          });
        }
      } catch (err) {
        setConflictStatus({
          hasConflict: true,
          message: err.message,
        });
      } finally {
        setCheckingConflict(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [startTime, endTime, resource, existingBooking]);

  if (!isOpen || !resource) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (conflictStatus?.hasConflict) {
      setError('Please choose a time slot without conflicts.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        resourceId: resource.id,
        startTime: startTime + ':00',
        endTime: endTime + ':00',
        purpose,
        notes,
      };

      if (existingBooking) {
        await bookingService.modify(existingBooking.id, payload);
      } else {
        await bookingService.create(payload);
      }

      onBookingSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {existingBooking ? 'Modify Reservation' : 'Reserve Campus Resource'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {resource.name} • {resource.location}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Resource summary pill */}
        <div
          style={{
            margin: '16px 24px 0 24px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span className={`badge badge-${resource.type?.toLowerCase()}`} style={{ marginRight: '8px' }}>
              {resource.type}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Capacity: {resource.capacity}</span>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            ${resource.hourlyRate}/hr
          </span>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.82rem', color: '#f87171' }}>{error}</p>
            </div>
          )}

          {/* Time pickers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> Start Time
                </span>
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> End Time
                </span>
              </label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Conflict status banner */}
          {conflictStatus && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: conflictStatus.hasConflict ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                border: conflictStatus.hasConflict ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'fadeIn 0.2s',
              }}
            >
              {conflictStatus.hasConflict ? (
                <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0 }} />
              ) : (
                <CheckCircle size={18} color="#34d399" style={{ flexShrink: 0 }} />
              )}
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: conflictStatus.hasConflict ? '#f87171' : '#34d399',
                }}
              >
                {checkingConflict ? 'Validating against campus schedule...' : conflictStatus.message}
              </span>
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Purpose / Class / Event</label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. AI Lab Experiment, Midterm Lecture, Drone Flight..."
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Special Notes / Equipment Needs (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need projector remote, locker PIN, audio cables..."
              className="form-textarea"
              rows={2}
            />
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || checkingConflict || conflictStatus?.hasConflict}
              className="btn btn-primary"
            >
              {submitting ? 'Confirming...' : existingBooking ? 'Save Changes' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
