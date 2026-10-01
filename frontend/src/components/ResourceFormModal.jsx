import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Users, DollarSign, FileText } from 'lucide-react';
import { resourceService } from '../services/api';

export default function ResourceFormModal({
  isOpen,
  onClose,
  initialResource = null,
  onSuccess,
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState('CLASSROOM');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(30);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [description, setDescription] = useState('');
  const [availability, setAvailability] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialResource) {
      setName(initialResource.name || '');
      setType(initialResource.type || 'CLASSROOM');
      setLocation(initialResource.location || '');
      setCapacity(initialResource.capacity || 1);
      setHourlyRate(initialResource.hourlyRate || 0);
      setDescription(initialResource.description || '');
      setAvailability(initialResource.availability !== undefined ? initialResource.availability : true);
    } else {
      setName('');
      setType('CLASSROOM');
      setLocation('');
      setCapacity(30);
      setHourlyRate(0);
      setDescription('');
      setAvailability(true);
    }
    setError(null);
  }, [initialResource, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name,
        type,
        location,
        capacity: Number(capacity),
        hourlyRate: Number(hourlyRate),
        description,
        availability,
      };

      if (initialResource?.id) {
        await resourceService.update(initialResource.id, payload);
      } else {
        await resourceService.create(payload);
      }

      onSuccess();
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
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {initialResource ? 'Edit Resource' : 'Add New Campus Resource'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Configure specifications, capacity, and pricing
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: '#f87171', fontSize: '0.82rem' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Resource Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Physics Quantum Optics Lab"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Resource Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="form-select"
              >
                <option value="CLASSROOM">Classroom / Hall</option>
                <option value="LAB">Research / Computing Lab</option>
                <option value="LOCKER">Smart Locker Bay</option>
                <option value="EQUIPMENT">Specialized Equipment</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={availability ? 'true' : 'false'}
                onChange={(e) => setAvailability(e.target.value === 'true')}
                className="form-select"
              >
                <option value="true">Available for Booking</option>
                <option value="false">Under Maintenance</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location / Building & Room</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Science Quad 201"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Capacity (Users/Seats)</label>
              <input
                type="number"
                min="1"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hourly Rate ($)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Key Equipment</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hardware specs, projector, climate control, safety guidelines..."
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : initialResource ? 'Update Resource' : 'Create Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
