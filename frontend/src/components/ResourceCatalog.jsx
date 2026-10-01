import React, { useState } from 'react';
import { Search, Filter, Calendar, MapPin, Users, DollarSign, Plus, Edit2, Trash2, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export default function ResourceCatalog({
  resources,
  user,
  onBookResource,
  onViewSchedule,
  onAddNewResource,
  onEditResource,
  onDeleteResource,
  onFilterAvailable,
  onNavigateAuth,
  loading,
}) {
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStartTime, setFilterStartTime] = useState('');
  const [filterEndTime, setFilterEndTime] = useState('');
  const [isFilteringTime, setIsFilteringTime] = useState(false);

  const categories = [
    { id: 'ALL', label: 'All Resources' },
    { id: 'CLASSROOM', label: 'Classrooms' },
    { id: 'LAB', label: 'Laboratories' },
    { id: 'LOCKER', label: 'Smart Lockers' },
    { id: 'EQUIPMENT', label: 'AV & Research Equipment' },
  ];

  const handleApplyTimeFilter = () => {
    if (filterDate && filterStartTime && filterEndTime) {
      const start = new Date(`${filterDate}T${filterStartTime}:00`);
      const end = new Date(`${filterDate}T${filterEndTime}:00`);
      setIsFilteringTime(true);
      onFilterAvailable(start, end);
    }
  };

  const handleClearTimeFilter = () => {
    setFilterDate('');
    setFilterStartTime('');
    setFilterEndTime('');
    setIsFilteringTime(false);
    onFilterAvailable(null, null);
  };

  const filteredResources = resources.filter((r) => {
    const matchesType = selectedType === 'ALL' || r.type === selectedType;
    const matchesSearch =
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Hero Header */}
      <section
        style={{
          padding: '40px 0 24px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#818cf8', background: 'rgba(99, 102, 241, 0.12)', padding: '3px 10px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(99, 102, 241, 0.25)', fontWeight: 600 }}>
              <Sparkles size={13} /> Campus Shared Infrastructure
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Campus Smart Resource Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '620px' }}>
            Real-time conflict-free reservation platform for smart lockers, advanced computing labs, lecture amphitheaters, and media equipment.
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <button
            onClick={onAddNewResource}
            className="btn btn-primary"
            style={{ padding: '12px 20px', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }}
          >
            <Plus size={18} /> Add New Campus Resource
          </button>
        )}

        {!user && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onNavigateAuth?.('login')}
              className="btn btn-primary"
              style={{ padding: '12px 20px' }}
            >
              Sign In to Reserve
            </button>
            <button
              onClick={() => onNavigateAuth?.('register')}
              className="btn btn-secondary"
              style={{ padding: '12px 18px' }}
            >
              Create Account
            </button>
          </div>
        )}
      </section>

      {/* Search & Filter Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '20px',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by resource name, building, equipment type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '42px' }}
            />
          </div>

          {/* Time Filter Inputs */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="form-input"
              style={{ width: '150px' }}
              title="Filter by reservation date"
            />
            <input
              type="time"
              value={filterStartTime}
              onChange={(e) => setFilterStartTime(e.target.value)}
              className="form-input"
              style={{ width: '110px' }}
              title="Slot start time"
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>to</span>
            <input
              type="time"
              value={filterEndTime}
              onChange={(e) => setFilterEndTime(e.target.value)}
              className="form-input"
              style={{ width: '110px' }}
              title="Slot end time"
            />
            <button
              onClick={handleApplyTimeFilter}
              disabled={!filterDate || !filterStartTime || !filterEndTime}
              className="btn btn-secondary btn-sm"
              style={{ padding: '9px 14px' }}
            >
              <Filter size={14} /> Find Free Slots
            </button>
            {isFilteringTime && (
              <button
                onClick={handleClearTimeFilter}
                className="btn btn-icon btn-sm"
                title="Reset availability filter"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: selectedType === cat.id ? 'var(--primary)' : 'var(--border-subtle)',
                background: selectedType === cat.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                color: selectedType === cat.id ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Resource Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <p>Loading campus resources...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
            No Resources Found
          </h3>
          <p style={{ fontSize: '0.85rem' }}>
            No campus resources match the current filter criteria or slot availability.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredResources.map((item) => (
            <article
              key={item.id}
              className="glass-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Card Header Top Accent */}
              <div
                style={{
                  height: '4px',
                  background:
                    item.type === 'CLASSROOM'
                      ? 'linear-gradient(90deg, #6366f1, #a855f7)'
                      : item.type === 'LAB'
                      ? 'linear-gradient(90deg, #06b6d4, #3b82f6)'
                      : item.type === 'LOCKER'
                      ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                      : 'linear-gradient(90deg, #f59e0b, #ec4899)',
                }}
              />

              <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span className={`badge badge-${item.type?.toLowerCase()}`}>
                    {item.type}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.availability ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#34d399', fontWeight: 600 }}>
                        <CheckCircle2 size={13} /> Active
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#f87171', fontWeight: 600 }}>
                        <XCircle size={13} /> Maintenance
                      </span>
                    )}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.12rem', fontWeight: 700, marginBottom: '6px', lineHeight: 1.3 }}>
                  {item.name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '14px' }}>
                  <MapPin size={14} style={{ flexShrink: 0 }} />
                  <span>{item.location}</span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: '18px', flex: 1 }}>
                  {item.description}
                </p>

                {/* Specs row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '18px',
                    fontSize: '0.82rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={15} color="var(--primary-light)" />
                    <span>Capacity: <strong>{item.capacity}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DollarSign size={15} color="#34d399" />
                    <span>Rate: <strong>${item.hourlyRate}/hr</strong></span>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => onBookResource(item)}
                    disabled={!item.availability}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '10px 14px', fontSize: '0.84rem' }}
                  >
                    Reserve Resource
                  </button>

                  <button
                    onClick={() => onViewSchedule(item)}
                    className="btn btn-secondary btn-icon"
                    title="View calendar & availability timeline"
                  >
                    <Calendar size={17} />
                  </button>

                  {user?.role === 'ADMIN' && (
                    <>
                      <button
                        onClick={() => onEditResource(item)}
                        className="btn btn-secondary btn-icon"
                        title="Edit Resource"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteResource(item.id)}
                        className="btn btn-secondary btn-icon"
                        style={{ color: '#f87171' }}
                        title="Remove Resource"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
