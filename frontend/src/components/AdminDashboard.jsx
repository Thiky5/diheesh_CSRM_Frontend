import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Check,
  X,
  Layers,
  Calendar,
  Activity,
  FileSpreadsheet,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Filter,
  RefreshCw,
  Search,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { adminService, auditService, resourceService } from '../services/api';
import UserFormModal from './UserFormModal';

export default function AdminDashboard({
  onAddResource,
  onEditResource,
  onDeleteResource,
  onRefreshResources,
}) {
  const [activeTab, setActiveTab] = useState('approvals');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // User CRUD modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Audit filter states
  const [auditUserId, setAuditUserId] = useState('');
  const [auditStartDate, setAuditStartDate] = useState('');
  const [auditEndDate, setAuditEndDate] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await adminService.getReports();
      setReports(res.data || null);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await adminService.getAllBookings();
      setAllBookings(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const params = {};
      if (auditUserId) params.userId = auditUserId;
      if (auditStartDate) params.startDate = auditStartDate + 'T00:00:00';
      if (auditEndDate) params.endDate = auditEndDate + 'T23:59:59';

      const res = await auditService.getLogs(params);
      setAuditLogs(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const reloadAll = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchReports(), fetchBookings(), fetchAuditLogs()]);
    setLoading(false);
  };

  useEffect(() => {
    reloadAll();
  }, []);

  const handleUpdateStatus = async (userId, newStatus) => {
    setErrorMessage(null);
    try {
      await adminService.updateUserStatus(userId, newStatus);
      setStatusMessage(`User account successfully ${newStatus.toLowerCase()}!`);
      setTimeout(() => setStatusMessage(null), 3500);
      fetchUsers();
      fetchReports();
    } catch (err) {
      setErrorMessage(err.message);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    setErrorMessage(null);
    try {
      await adminService.updateUserRole(userId, newRole);
      setStatusMessage(`User role updated to ${newRole}!`);
      setTimeout(() => setStatusMessage(null), 3500);
      fetchUsers();
    } catch (err) {
      setErrorMessage(err.message);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleDeleteUser = async (u) => {
    if (u.username === 'admin') {
      setErrorMessage('The primary administrator account cannot be deleted');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user @${u.username} (${u.fullName})?`)) return;
    setErrorMessage(null);
    try {
      await adminService.deleteUser(u.id);
      setStatusMessage(`User @${u.username} was permanently deleted.`);
      setTimeout(() => setStatusMessage(null), 3500);
      fetchUsers();
      fetchReports();
    } catch (err) {
      setErrorMessage(err.message);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const pendingUsers = users.filter((u) => u.status === 'PENDING');

  return (
    <div style={{ paddingBottom: '50px' }}>
      {/* Header */}
      <div
        style={{
          padding: '30px 0 20px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-admin">Master Console</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role-based Access & Compliance</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Admin Central Command</h1>
        </div>

        <button onClick={reloadAll} className="btn btn-secondary btn-sm" disabled={loading}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh Telemetry
        </button>
      </div>

      {statusMessage && (
        <div style={{ padding: '12px 18px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', fontSize: '0.88rem', fontWeight: 600, marginBottom: '20px' }}>
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: '12px 18px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', fontSize: '0.88rem', fontWeight: 600, marginBottom: '20px' }}>
          {errorMessage}
        </div>
      )}

      {/* Admin Subnav Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {[
          { id: 'approvals', label: `Pending Approvals (${pendingUsers.length})`, icon: ShieldCheck, badge: pendingUsers.length > 0 },
          { id: 'users', label: 'All User Accounts', icon: Users },
          { id: 'reports', label: 'Reports & Analytics', icon: TrendingUp },
          { id: 'audit', label: 'Audit Trail Logs', icon: Activity },
          { id: 'reservations', label: `Master Reservations (${allBookings.length})`, icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.86rem',
                fontWeight: 700,
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(217, 119, 6, 0.1))' : 'transparent',
                borderBottom: isActive ? '2px solid #f59e0b' : '2px solid transparent',
                color: isActive ? '#fbbf24' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              {tab.label}
              {tab.badge && (
                <span
                  style={{
                    background: '#f59e0b',
                    color: '#000',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {pendingUsers.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PENDING APPROVALS */}
      {activeTab === 'approvals' && (
        <section>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Pending Student & Faculty Accounts</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Review registration requests. Upon approval, automated confirmation notifications will dispatch to the user.
            </p>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <ShieldCheck size={48} color="#34d399" style={{ opacity: 0.8, marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>All Clear!</h3>
              <p style={{ fontSize: '0.85rem' }}>No student or faculty registrations are currently pending review.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pendingUsers.map((u) => (
                <div
                  key={u.id}
                  className="glass-panel"
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    borderLeft: '4px solid #f59e0b',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span>
                      <span className="badge badge-pending">PENDING APPROVAL</span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Registered: {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{u.fullName}</h3>
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px' }}>
                      <span>Username: <strong>@{u.username}</strong></span>
                      <span>Email: <strong>{u.email}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleUpdateStatus(u.id, 'APPROVED')}
                      className="btn btn-success"
                      style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                    >
                      <Check size={16} /> Approve Account
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(u.id, 'REJECTED')}
                      className="btn btn-danger"
                      style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: ALL USER ACCOUNTS */}
      {activeTab === 'users' && (
        <section className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Campus User Directory</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {users.length} registered accounts across Student, Faculty, and Admin roles
              </p>
            </div>
            <button
              onClick={() => {
                setUserToEdit(null);
                setIsUserModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} /> Add New User
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 18px' }}>User</th>
                  <th style={{ padding: '12px 18px' }}>Email</th>
                  <th style={{ padding: '12px 18px' }}>Role</th>
                  <th style={{ padding: '12px 18px' }}>Account Status</th>
                  <th style={{ padding: '12px 18px' }}>Joined Date</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="form-select"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto' }}
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="FACULTY">FACULTY</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`badge badge-${u.status.toLowerCase()}`}>{u.status}</span>
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        {/* Edit User Button */}
                        <button
                          onClick={() => {
                            setUserToEdit(u);
                            setIsUserModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Edit User Details"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Status Toggle Button */}
                        {u.username === 'admin' ? (
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, padding: '0 4px' }}>
                            Primary Admin
                          </span>
                        ) : u.status !== 'APPROVED' ? (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'APPROVED')}
                            className="btn btn-success btn-sm"
                            style={{ padding: '4px 8px' }}
                            title="Approve User"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'REJECTED')}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', color: '#f87171' }}
                            title="Revoke Access"
                          >
                            Revoke
                          </button>
                        )}

                        {/* Delete User Button */}
                        {u.username !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 8px' }}
                            title="Delete User"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: REPORTS & ANALYTICS */}
      {activeTab === 'reports' && (
        <section>
          {/* Key Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Campus Users</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {reports?.totalUsers || 0}
              </div>
              <span style={{ fontSize: '0.74rem', color: '#fbbf24' }}>
                {reports?.pendingUsers || 0} awaiting approval
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Resources</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                {reports?.totalResources || 0}
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Classrooms, labs, lockers & gear</span>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Bookings</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                {reports?.activeBookings || 0}
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Currently occupied or reserved</span>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Campus Utilization Rate</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#818cf8', marginTop: '4px' }}>
                {reports?.overallUtilizationRate || 0}%
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Resource capacity efficiency</span>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Conflicts Prevented</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                {reports?.conflictsPrevented || 0}
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Zero double-booking guarantee</span>
            </div>
          </div>

          {/* Daily Resource Utilization Report Table */}
          <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.01)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Daily Resource Utilization Report</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Aggregated SQL calculation of reservations and booked duration per campus asset today
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 18px' }}>Resource</th>
                    <th style={{ padding: '12px 18px' }}>Category</th>
                    <th style={{ padding: '12px 18px' }}>Today's Bookings</th>
                    <th style={{ padding: '12px 18px' }}>Minutes Booked</th>
                    <th style={{ padding: '12px 18px' }}>Utilization Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {reports?.dailyUtilization?.map((item, idx) => {
                    const minutes = Number(item.totalMinutesBooked || item.TOTALMINUTESBOOKED || 0);
                    const percent = Math.min(100, Math.round((minutes / 480) * 100)); // based on 8 hr day
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '14px 18px', fontWeight: 600 }}>
                          {item.resourceName || item.RESOURCENAME}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span className={`badge badge-${String(item.resourceType || item.RESOURCETYPE).toLowerCase()}`}>
                            {item.resourceType || item.RESOURCETYPE}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 700 }}>
                          {item.totalBookings || item.TOTALBOOKINGS || 0}
                        </td>
                        <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)' }}>
                          {minutes} mins ({(minutes / 60).toFixed(1)} hrs)
                        </td>
                        <td style={{ padding: '14px 18px', width: '220px' }}>
                          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${percent}%`,
                                height: '100%',
                                background: percent > 75 ? '#ef4444' : percent > 40 ? '#f59e0b' : '#10b981',
                                borderRadius: '4px',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{percent}% of day</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: AUDIT TRAIL LOGS */}
      {activeTab === 'audit' && (
        <section>
          {/* Audit Filters Bar */}
          <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>User ID:</span>
              <input
                type="number"
                placeholder="All Users"
                value={auditUserId}
                onChange={(e) => setAuditUserId(e.target.value)}
                className="form-input"
                style={{ width: '110px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>From:</span>
              <input
                type="date"
                value={auditStartDate}
                onChange={(e) => setAuditStartDate(e.target.value)}
                className="form-input"
                style={{ width: '140px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>To:</span>
              <input
                type="date"
                value={auditEndDate}
                onChange={(e) => setAuditEndDate(e.target.value)}
                className="form-input"
                style={{ width: '140px' }}
              />
            </div>

            <button onClick={fetchAuditLogs} className="btn btn-secondary btn-sm">
              <Filter size={14} /> Filter Audit Logs
            </button>
            <button
              onClick={() => {
                setAuditUserId('');
                setAuditStartDate('');
                setAuditEndDate('');
                setTimeout(fetchAuditLogs, 50);
              }}
              className="btn btn-icon btn-sm"
              title="Reset Filters"
            >
              Reset
            </button>
          </div>

          {/* Audit Logs Table */}
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.01)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>System Audit Trail ({auditLogs.length} events logged)</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Immutable security logs tracking user authentications, reservations, cancellations, and administrative status alterations
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 16px' }}>Timestamp</th>
                    <th style={{ padding: '12px 16px' }}>Operator</th>
                    <th style={{ padding: '12px 16px' }}>Action Trigger</th>
                    <th style={{ padding: '12px 16px' }}>Target Entity</th>
                    <th style={{ padding: '12px 16px' }}>Details & Context</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        @{log.username} {log.userId ? `(#${log.userId})` : ''}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.74rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background:
                              log.action.includes('CREATED')
                                ? 'rgba(16, 185, 129, 0.15)'
                                : log.action.includes('CANCEL') || log.action.includes('DELETE')
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(99, 102, 241, 0.15)',
                            color:
                              log.action.includes('CREATED')
                                ? '#34d399'
                                : log.action.includes('CANCEL') || log.action.includes('DELETE')
                                ? '#f87171'
                                : '#818cf8',
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {log.entityName} {log.entityId ? `#${log.entityId}` : ''}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-primary)', maxWidth: '400px' }}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 5: MASTER RESERVATIONS */}
      {activeTab === 'reservations' && (
        <section className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.01)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>All Campus Bookings</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Booking ID</th>
                  <th style={{ padding: '12px 16px' }}>Booked By</th>
                  <th style={{ padding: '12px 16px' }}>Resource</th>
                  <th style={{ padding: '12px 16px' }}>Time Slot</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      #{b.id}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{b.userName}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{b.userEmail}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{b.resourceName}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{b.resourceLocation}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                      {new Date(b.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {b.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* User Create / Edit Modal */}
      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        userToEdit={userToEdit}
        onSaveSuccess={() => {
          fetchUsers();
          fetchReports();
          setStatusMessage(userToEdit ? 'User updated successfully!' : 'User created successfully and approved for instant login!');
          setTimeout(() => setStatusMessage(null), 3500);
        }}
      />
    </div>
  );
}
