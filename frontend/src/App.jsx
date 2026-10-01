import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ResourceCatalog from './components/ResourceCatalog';
import CalendarView from './components/CalendarView';
import UserBookings from './components/UserBookings';
import ServiceRequests from './components/ServiceRequests';
import AdminDashboard from './components/AdminDashboard';
import BookingModal from './components/BookingModal';
import ResourceFormModal from './components/ResourceFormModal';
import AuthModal from './components/AuthModal';
import AuthPage from './components/AuthPage';
import NotificationDrawer from './components/NotificationDrawer';

import {
  resourceService,
  bookingService,
  notificationService,
} from './services/api';

export default function App() {
  // Current user state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('csrm_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState(() => {
    if (!user) return 'auth';
    return user.role === 'ADMIN' ? 'admin' : 'resources';
  });
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [resources, setResources] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingResources, setLoadingResources] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [existingBooking, setExistingBooking] = useState(null);
  const [bookingSlot, setBookingSlot] = useState(null);

  const [isResourceFormOpen, setIsResourceFormOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Toast / Status banner
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Resources
  const fetchResources = async (startTime = null, endTime = null) => {
    setLoadingResources(true);
    try {
      let res;
      if (startTime && endTime) {
        res = await resourceService.getAvailable(startTime, endTime);
      } else {
        res = await resourceService.getAll();
      }
      setResources(res.data || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoadingResources(false);
    }
  };

  // Fetch User Bookings
  const fetchUserBookings = async () => {
    if (!user) return;
    setLoadingBookings(true);
    try {
      const res = await bookingService.getMyBookings();
      setUserBookings(res.data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Fetch Notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const [notifsRes, countRes] = await Promise.all([
        notificationService.getMyNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifsRes.data || []);
      setUnreadCount(countRes.data?.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserBookings();
      fetchNotifications();
    } else {
      setUserBookings([]);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Auth Handlers
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    showToast(`Welcome back, ${userData.fullName}! Logged in as ${userData.role}.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('csrm_token');
    localStorage.removeItem('csrm_user');
    setUser(null);
    setActiveTab('auth');
    showToast('You have been signed out.');
  };

  // Booking Handlers
  const handleOpenBooking = (resource, slotStart = null, slotEnd = null) => {
    if (!user) {
      setAuthMode('login');
      setActiveTab('auth');
      showToast('Please sign in or create an account to reserve campus resources.');
      return;
    }
    setSelectedResource(resource);
    setExistingBooking(null);
    setBookingSlot(slotStart && slotEnd ? { startTime: slotStart, endTime: slotEnd } : null);
    setIsBookingOpen(true);
  };

  const handleModifyBooking = (booking) => {
    const res = resources.find((r) => r.id === booking.resourceId) || {
      id: booking.resourceId,
      name: booking.resourceName,
      type: booking.resourceType,
      location: booking.resourceLocation,
      capacity: 1,
      hourlyRate: 0,
    };
    setSelectedResource(res);
    setExistingBooking(booking);
    setBookingSlot(null);
    setIsBookingOpen(true);
  };

  const handleBookingSuccess = () => {
    showToast('Reservation successfully recorded! Email/SMS alerts dispatched.');
    fetchUserBookings();
    fetchNotifications();
  };

  // Admin Resource Handlers
  const handleAddResource = () => {
    setResourceToEdit(null);
    setIsResourceFormOpen(true);
  };

  const handleEditResource = (resource) => {
    setResourceToEdit(resource);
    setIsResourceFormOpen(true);
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to remove this campus resource from the directory?')) {
      return;
    }
    try {
      await resourceService.delete(id);
      showToast('Campus resource removed successfully.');
      fetchResources();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <aside
          aria-label="System notification"
          style={{
            position: 'fixed',
            top: '84px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            border: '1px solid var(--border-glow)',
            boxShadow: 'var(--shadow-glow)',
            color: '#ffffff',
            fontSize: '0.86rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.2s',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
          {toastMessage}
        </aside>
      )}

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => {
          setAuthMode('login');
          setActiveTab('auth');
        }}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
        {activeTab === 'auth' && (
          <AuthPage
            initialMode={authMode}
            onLoginSuccess={(userData) => {
              handleLoginSuccess(userData);
              setActiveTab(userData.role === 'ADMIN' ? 'admin' : 'resources');
            }}
            onNavigateResources={() => setActiveTab('resources')}
          />
        )}

        {activeTab === 'resources' && (
          <ResourceCatalog
            resources={resources}
            user={user}
            onBookResource={handleOpenBooking}
            onViewSchedule={(r) => {
              setSelectedResource(r);
              setActiveTab('calendar');
            }}
            onAddNewResource={handleAddResource}
            onEditResource={handleEditResource}
            onDeleteResource={handleDeleteResource}
            onFilterAvailable={(start, end) => fetchResources(start, end)}
            onNavigateAuth={(mode) => {
              setAuthMode(mode || 'login');
              setActiveTab('auth');
            }}
            loading={loadingResources}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            resources={resources}
            selectedResource={selectedResource}
            onSelectResource={(r) => setSelectedResource(r)}
            onBookSlot={(res, start, end) => {
              handleOpenBooking(res, start, end);
            }}
          />
        )}

        {activeTab === 'my-bookings' && (
          <UserBookings
            bookings={userBookings}
            onModifyBooking={handleModifyBooking}
            onRefresh={() => {
              fetchUserBookings();
              fetchNotifications();
            }}
            loading={loadingBookings}
          />
        )}

        {activeTab === 'services' && (
          <ServiceRequests user={user} resources={resources} />
        )}

        {activeTab === 'admin' && user?.role === 'ADMIN' && (
          <AdminDashboard
            onAddResource={handleAddResource}
            onEditResource={handleEditResource}
            onDeleteResource={handleDeleteResource}
            onRefreshResources={fetchResources}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '24px',
          background: 'rgba(7, 11, 20, 0.95)',
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            <strong>CSRM Campus Smart Resource Management System</strong> • Conflict-Free Architecture
          </div>
          <div>
            Spring Boot 4 / REST API • MySQL 8.0 • React 19 • JWT Authentication
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        resource={selectedResource}
        existingBooking={existingBooking}
        initialSlot={bookingSlot}
        onBookingSuccess={handleBookingSuccess}
      />

      <ResourceFormModal
        isOpen={isResourceFormOpen}
        onClose={() => setIsResourceFormOpen(false)}
        initialResource={resourceToEdit}
        onSuccess={() => {
          showToast('Resource saved successfully.');
          fetchResources();
        }}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={async (id) => {
          await notificationService.markAsRead(id);
          fetchNotifications();
        }}
        onMarkAllAsRead={async () => {
          await notificationService.markAllAsRead();
          fetchNotifications();
        }}
      />
    </div>
  );
}
