import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCheck, X, Calendar, ArrowRightLeft, Activity, AlertCircle, Tent, Info } from 'lucide-react';

export function NotificationDrawer({ isOpen, onClose }) {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setNotifications(data.notifications || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load notifications:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, token]);

  const markAsRead = (id) => {
    fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      setNotifications(prev =>
        prev.map(n => n.notification_id === id ? { ...n, read_status: 1 } : n)
      );
    });
  };

  const markAllRead = () => {
    fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      setNotifications(prev => prev.map(n => ({ ...n, read_status: 1 })));
    });
  };

  if (!isOpen) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'appointment': return <Calendar size={18} color="#38BDF8" />;
      case 'referral': return <ArrowRightLeft size={18} color="#A78BFA" />;
      case 'screening': return <Activity size={18} color="#F87171" />;
      case 'complaint': return <AlertCircle size={18} color="#FBBF24" />;
      case 'camp': return <Tent size={18} color="#34D399" />;
      default: return <Info size={18} color="#94A3B8" />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '420px',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
          borderLeft: '1px solid var(--border-strong)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bell size={22} color="#2DD4BF" />
            <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>Notifications</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={markAllRead}
              className="btn btn-sm btn-outline"
              title="Mark all as read"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            >
              <CheckCheck size={14} /> Read All
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Loading updates...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Bell size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p>No notifications yet.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.notification_id}
                onClick={() => !n.read_status && markAsRead(n.notification_id)}
                style={{
                  background: n.read_status ? 'var(--color-bg-primary)' : 'var(--color-bg-elevated)',
                  borderLeft: n.read_status ? '3px solid transparent' : '3px solid #0D9488',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem',
                  cursor: n.read_status ? 'default' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <div style={{ marginTop: '2px' }}>{getTypeIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <h4 style={{ fontSize: '0.9rem', color: n.read_status ? 'var(--text-secondary)' : '#FFFFFF', fontWeight: 600 }}>
                        {n.title}
                      </h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {n.created_at ? n.created_at.substring(11, 16) : ''}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
