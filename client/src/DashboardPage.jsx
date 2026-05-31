import React, { useEffect, useMemo, useState } from 'react';
import API_BASE from './config';
import SearchUsers from './SearchUsers';
import FollowingList from './FollowingList';

// Helper function to fetch categories
const fetchCategoriesFromApi = async () => {
  const response = await fetch(`${API_BASE}/api/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
};

const DashboardPage = ({ user, onLoginClick, onOpenNotifications }) => {
  const [categories, setCategories] = useState([]);
  const [followedIds, setFollowedIds] = useState(new Set());
  const [updates, setUpdates] = useState([]);
  const [categoryUpdates, setCategoryUpdates] = useState([]);
  const [userFollowUpdates, setUserFollowUpdates] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingCategoryId, setSavingCategoryId] = useState(null);
  const [error, setError] = useState(null);
  const [refreshFollowing, setRefreshFollowing] = useState(0);

  const token = localStorage.getItem('token');

  const followedCategories = useMemo(
    () => categories.filter((category) => followedIds.has(category.id)),
    [categories, followedIds]
  );

  const categoryUpdateCounts = useMemo(() => {
    const counts = new Map();
    updates.forEach((update) => {
      counts.set(update.category_id, (counts.get(update.category_id) || 0) + 1);
    });
    return counts;
  }, [updates]);

  const loadDashboard = async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [categoriesData, followedRes, updatesRes, unreadRes] = await Promise.all([
        fetchCategoriesFromApi(),
        fetch(`${API_BASE}/api/categories/followed`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE}/api/dashboard/followed-updates`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE}/api/notifications/unread/${user.id}`),
      ]);

      if (!followedRes.ok || !updatesRes.ok || !unreadRes.ok) {
        throw new Error('Unable to load dashboard data');
      }

      const [followedData, updatesData, unreadData] = await Promise.all([
        followedRes.json(),
        updatesRes.json(),
        unreadRes.json(),
      ]);

      setCategories(categoriesData);
      setFollowedIds(new Set(followedData.map((item) => item.id)));
      setUpdates(updatesData);
      
      // Separate updates by source (category vs user follow)
      const categoryBased = updatesData.filter(update => !update.from_user_follow);
      const userBased = updatesData.filter(update => update.from_user_follow);
      
      setCategoryUpdates(categoryBased);
      setUserFollowUpdates(userBased);
      
      setUnreadCount(unreadData.unread_count || 0);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.message || 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const toggleFollow = async (categoryId) => {
    if (!user || !token) {
      onLoginClick();
      return;
    }

    const isFollowed = followedIds.has(categoryId);
    setSavingCategoryId(categoryId);

    try {
      const res = await fetch(`${API_BASE}/api/categories/${categoryId}/follow`, {
        method: isFollowed ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle conflict - already following
      if (res.status === 409) {
        console.log('Already following this category');
        setSavingCategoryId(null);
        return;
      }

      if (!res.ok) {
        throw new Error('Unable to update follow status');
      }

      const nextFollowed = new Set(followedIds);
      if (isFollowed) {
        nextFollowed.delete(categoryId);
      } else {
        nextFollowed.add(categoryId);
      }
      setFollowedIds(nextFollowed);

      const updatesRes = await fetch(`${API_BASE}/api/dashboard/followed-updates`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (updatesRes.ok) {
        const updatesData = await updatesRes.json();
        setUpdates(updatesData);
        
        // Separate updates by source (category vs user follow)
        const categoryBased = updatesData.filter(update => !update.from_user_follow);
        const userBased = updatesData.filter(update => update.from_user_follow);
        
        setCategoryUpdates(categoryBased);
        setUserFollowUpdates(userBased);
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
      setError(err.message || 'Unable to update follow status');
    } finally {
      setSavingCategoryId(null);
    }
  };

  if (!user) {
    return (
      <div className="p-12 min-h-screen">
        <div className="rounded-3xl border border-gradient-to-r from-blue-200 to-orange-200 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-12 text-center shadow-2xl">
          <div className="mb-4">
            <svg className="w-24 h-24 mx-auto text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-slate-600 mb-6 text-lg font-medium">Log in to follow categories and get notifications for new entries.</p>
          <button
            onClick={onLoginClick}
            className="rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 text-base font-semibold hover:shadow-xl shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Login to Start Following
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-12 space-y-8 min-h-screen">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-blue-200/50 bg-gradient-to-br from-blue-50 via-blue-25 to-white p-8 shadow-xl lg:col-span-2 transform hover:scale-102 transition-transform duration-300">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">📊 Dashboard</p>
          <h1 className="mt-4 text-4xl font-black bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">Category Follow Hub</h1>
          <p className="mt-4 text-base text-slate-700 leading-relaxed font-medium">
            Follow categories to receive updates in your notification button whenever a new experience or product is posted.
          </p>
        </div>

        <div className="rounded-3xl border border-orange-200/50 bg-gradient-to-br from-orange-50 via-orange-25 to-white p-8 shadow-xl transform hover:scale-102 transition-transform duration-300">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-600">🔔 Notification Summary</p>
          <p className="mt-4 text-5xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{unreadCount}</p>
          <p className="mt-2 text-sm text-slate-600 font-semibold">Unread category updates</p>
          <button
            onClick={onOpenNotifications}
            className="mt-6 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 text-sm font-bold hover:shadow-xl shadow-lg transition-all duration-200 transform hover:scale-105 w-full"
          >
            Open Notifications
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-300 bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 text-base text-red-700 font-semibold shadow-lg">
          ⚠️ {error}
        </div>
      )}

      <SearchUsers user={user} token={token} onUserFollowed={() => setRefreshFollowing(prev => prev + 1)} />

      <FollowingList user={user} token={token} refreshTrigger={refreshFollowing} />

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/50 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 shadow-xl lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900">🌟 Discover Categories</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">Tap to follow</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              </div>
              <span className="ml-4 text-slate-600 font-semibold">Loading categories...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => {
                const followed = followedIds.has(category.id);
                const busy = savingCategoryId === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleFollow(category.id)}
                    disabled={busy}
                    className={`rounded-full border-2 px-6 py-3 text-sm font-bold transition-all duration-200 transform hover:scale-110 ${
                      followed
                        ? 'border-blue-600 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 shadow-md'
                    } ${busy ? 'opacity-60 cursor-wait' : ''}`}
                  >
                    {followed ? '✓' : '+'} {category.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200/50 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 shadow-xl">
          <h2 className="text-2xl font-black text-slate-900">📌 Following</h2>
          {followedCategories.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500 font-medium">You are not following any category yet.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {followedCategories.map((category) => (
                <div key={category.id} className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 transform hover:scale-105 transition-transform shadow-sm hover:shadow-md">
                  <p className="text-sm font-bold text-blue-900">{category.name}</p>
                  <p className="text-xs text-blue-600 font-semibold mt-1">
                    {categoryUpdateCounts.get(category.id) || 0} recent updates
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/50 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">🎯 New In Your Followed Categories</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">Latest 50</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <span className="ml-4 text-slate-600 font-semibold">Loading updates...</span>
          </div>
        ) : categoryUpdates.length === 0 ? (
          <p className="text-base text-slate-500 font-medium py-8 text-center">No updates yet. Follow more categories to populate this feed.</p>
        ) : (
          <div className="space-y-3">
            {categoryUpdates.map((item) => (
              <div key={`${item.entry_type}-${item.entry_id}`} className="rounded-2xl border border-slate-200 bg-white p-5 transform hover:scale-102 transition-all shadow-sm hover:shadow-md hover:border-blue-300">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-slate-900">{item.entry_title}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      <span className={`font-bold ${item.entry_type === 'experience' ? 'text-blue-600' : 'text-orange-600'}`}>
                        {item.entry_type === 'experience' ? '⭐ Experience' : '📦 Product'}
                      </span>
                      {' in '}
                      <span className="text-slate-700 font-semibold">{item.category_name}</span>
                      {' by '}
                      <span className="text-slate-700 font-semibold">{item.author_name}</span>
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold">{new Date(item.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200/50 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">👥 New from Followed People</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">Latest Updates</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <span className="ml-4 text-slate-600 font-semibold">Loading updates...</span>
          </div>
        ) : userFollowUpdates.length === 0 ? (
          <p className="text-base text-slate-500 font-medium py-8 text-center">No updates yet. Follow more people to see their posts here!</p>
        ) : (
          <div className="space-y-3">
            {userFollowUpdates.map((item) => (
              <div key={`${item.entry_type}-${item.entry_id}`} className="rounded-2xl border border-slate-200 bg-white p-5 transform hover:scale-102 transition-all shadow-sm hover:shadow-md hover:border-purple-300">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-slate-900">{item.entry_title}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      <span className={`font-bold ${item.entry_type === 'experience' ? 'text-purple-600' : 'text-pink-600'}`}>
                        {item.entry_type === 'experience' ? '⭐ Experience' : '📦 Product'}
                      </span>
                      {' in '}
                      <span className="text-slate-700 font-semibold">{item.category_name}</span>
                      {' by '}
                      <span className="text-purple-700 font-bold">{item.author_name}</span>
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold">{new Date(item.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
