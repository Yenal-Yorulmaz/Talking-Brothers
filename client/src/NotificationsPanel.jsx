import React, { useEffect, useState } from 'react';
import API_BASE from './config';

const NotificationsPanel = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  const loadNotifications = async () => {
    if (!token) {
      setError('Please log in to view notifications');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Unable to load notifications');
      }

      const data = await res.json();
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error('Notifications load error:', err);
      setError(err.message || 'Unable to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        loadNotifications();
      }
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const renderMessage = (notification) => {
    if (notification.type === 'new_product') {
      return 'A new product was added in a category you follow.';
    }
    if (notification.type === 'new_experience') {
      return 'A new experience was added in a category you follow.';
    }
    return 'There is a new update for one of your followed categories.';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4">
      <div className="mt-20 w-full max-w-3xl rounded-3xl bg-gradient-to-br from-white via-blue-50 to-slate-100 shadow-2xl overflow-hidden border-2 border-blue-200">
        <div className="flex items-center justify-between px-8 py-6 border-b-2 border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div>
            <h2 className="text-2xl font-black text-white">🔔 Notifications</h2>
            <p className="text-sm text-blue-100 font-semibold">Updates from categories you follow</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllRead}
              className="rounded-full bg-white text-blue-600 px-6 py-2 text-sm font-bold hover:bg-blue-50 transition-all shadow-md transform hover:scale-105"
            >
              ✓ Mark all read
            </button>
            <button
              onClick={onClose}
              className="rounded-full bg-white text-blue-600 px-6 py-2 text-sm font-bold hover:bg-blue-50 transition-all shadow-md transform hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin mb-4">
                <svg className="w-10 h-10 text-blue-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              </div>
              <p className="text-slate-600 font-semibold">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-red-50 border-2 border-red-300 px-6 py-4 text-center text-red-700 font-semibold">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-slate-600 font-semibold">No new notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-2xl border-2 p-5 transition-all transform hover:scale-102 ${notification.is_read ? 'border-slate-200 bg-slate-50 shadow-sm' : 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`text-2xl ${notification.type === 'new_product' ? '' : '⭐'} ${notification.type === 'new_product' ? '📦' : ''}`}>
                        {notification.type === 'new_product' ? '📦' : '⭐'}
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold text-slate-900">{renderMessage(notification)}</p>
                        <p className="text-xs text-slate-600 mt-2 font-semibold">{new Date(notification.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase tracking-[0.2em] font-black px-3 py-1 rounded-full whitespace-nowrap ${notification.is_read ? 'bg-slate-300 text-slate-700' : 'bg-blue-600 text-white animate-pulse'}`}>
                      {notification.is_read ? '✓ Read' : '● New'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
