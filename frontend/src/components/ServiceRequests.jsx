import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Clock, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { serviceRequestService } from '../services/api';

export default function ServiceRequests({ user, resources }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [serviceType, setServiceType] = useState('Lab Assistance');
  const [resourceId, setResourceId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res =
        user?.role === 'ADMIN'
          ? await serviceRequestService.getAll()
          : await serviceRequestService.getMy();
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await serviceRequestService.create({
        serviceType,
        resourceId: resourceId ? Number(resourceId) : null,
        description,
      });
      setShowModal(false);
      setDescription('');
      setResourceId('');
      fetchRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const notes = prompt('Enter resolution or update notes for the user:');
    try {
      await serviceRequestService.updateStatus(id, newStatus, notes || 'Status updated by admin');
      fetchRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 0 20px 0', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '6px' }}>
            Campus Services & Assistance
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Request technical lab assistants, equipment calibration, locker lockouts, or safety assistance.
          </p>
        </div>

        {user?.role !== 'ADMIN' && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} /> Request Campus Service
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <HelpCircle size={48} style={{ opacity: 0.3, marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
            No Service Requests
          </h3>
          <p style={{ fontSize: '0.82rem' }}>Need technical assistance with a lab or equipment? Submit a request above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.map((req) => (
            <div
              key={req.id}
              className="glass-panel"
              style={{
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      background:
                        req.status === 'RESOLVED'
                          ? 'var(--success-bg)'
                          : req.status === 'IN_PROGRESS'
                          ? 'rgba(6, 182, 212, 0.15)'
                          : 'var(--warning-bg)',
                      color:
                        req.status === 'RESOLVED'
                          ? '#34d399'
                          : req.status === 'IN_PROGRESS'
                          ? '#38bdf8'
                          : '#fbbf24',
                    }}
                  >
                    {req.status}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Ticket #{req.id} • {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                  {user?.role === 'ADMIN' && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                      User: {req.userName}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
                  {req.serviceType}
                </h3>
                {req.resourceName && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                    Resource: {req.resourceName}
                  </p>
                )}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {req.description}
                </p>

                {req.adminNotes && (
                  <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)', fontSize: '0.8rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Admin Note: </strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{req.adminNotes}</span>
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              {user?.role === 'ADMIN' && req.status !== 'RESOLVED' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleUpdateStatus(req.id, 'IN_PROGRESS')}
                    className="btn btn-secondary btn-sm"
                  >
                    Set In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(req.id, 'RESOLVED')}
                    className="btn btn-success btn-sm"
                  >
                    Resolve Ticket
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Request Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Request Campus Service</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {error && (
                <div style={{ padding: '10px', background: 'var(--danger-bg)', color: '#f87171', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="form-select"
                >
                  <option value="Lab Assistance">Lab Technical Assistance / Demonstrator</option>
                  <option value="Equipment Setup">AV & Cinema Kit Pre-flight Setup</option>
                  <option value="Locker Maintenance">Smart Locker Bay Code Reset</option>
                  <option value="Special Permissions">Off-hours Access / Extended Time</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Associated Campus Resource (Optional)</label>
                <select
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  className="form-select"
                >
                  <option value="">General Campus Request (None)</option>
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Details / Requirements</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what help you need, required equipment, or urgency..."
                  className="form-textarea"
                />
              </div>

              <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
