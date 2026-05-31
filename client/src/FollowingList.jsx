import React, { useEffect, useState } from 'react';
import API_BASE from './config';

const FollowingList = ({ user, token, refreshTrigger }) => {
  const [followedUsers, setFollowedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState(null);

  if (!user || !token) {
    return null;
  }

  useEffect(() => {
    loadFollowedUsers();
  }, [user, token, refreshTrigger]);

  const loadFollowedUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/users/followed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load followed users');
      }

      const data = await response.json();
      setFollowedUsers(data);
    } catch (error) {
      console.error('Error loading followed users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId) => {
    setUnfollowingId(userId);
    try {
      const response = await fetch(`${API_BASE}/api/users/${userId}/follow`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to unfollow user');
      }

      setFollowedUsers(followedUsers.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setUnfollowingId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gradient-to-r from-blue-200 to-orange-200 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">👥 People You're Following</h3>
        <p className="text-center text-slate-500 py-4">Loading...</p>
      </div>
    );
  }

  if (followedUsers.length === 0) {
    return (
      <div className="rounded-lg border border-gradient-to-r from-blue-200 to-orange-200 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">👥 People You're Following</h3>
        <p className="text-center text-slate-500 py-4">You're not following anyone yet. Use the search above to find and follow people!</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gradient-to-r from-blue-200 to-orange-200 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6 shadow-lg mb-6">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">👥 People You're Following ({followedUsers.length})</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {followedUsers.map((user) => (
          <div
            key={user.id}
            className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover border border-gray-200 mb-2"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold mb-2">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="font-medium text-slate-700 text-sm text-center mb-2 truncate w-full">
              {user.username}
            </p>
            <button
              onClick={() => handleUnfollow(user.id)}
              disabled={unfollowingId === user.id}
              className="text-xs px-2 py-1 bg-gray-300 hover:bg-gray-400 text-slate-700 rounded-full transition-all disabled:opacity-75"
            >
              {unfollowingId === user.id ? '...' : 'Unfollow'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowingList;
