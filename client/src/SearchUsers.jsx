import React, { useState, useEffect, useCallback } from 'react';
import API_BASE from './config';

const SearchUsers = ({ user, token, onUserFollowed }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [savingUserId, setSavingUserId] = useState(null);

  if (!user || !token) {
    return null;
  }

  const performSearch = useCallback(async (term) => {
    try {
      setIsLoading(true);
      console.log('Searching for:', term, 'with API_BASE:', API_BASE);
      const response = await fetch(`${API_BASE}/api/users/search?q=${encodeURIComponent(term)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Search response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Search failed:', response.status, errorText);
        throw new Error(`Search failed: ${response.status}`);
      }

      const results = await response.json();
      console.log('Search results:', results);
      setSearchResults(results);
      
      // Update following status
      const followingSet = new Set();
      results.forEach(result => {
        if (result.is_followed) {
          followingSet.add(result.id);
        }
      });
      setFollowingIds(followingSet);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, performSearch]);

  const toggleFollow = async (userId) => {
    const isFollowed = followingIds.has(userId);
    setSavingUserId(userId);

    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/follow`, {
        method: isFollowed ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Unable to update follow status');
      }

      const nextFollowing = new Set(followingIds);
      if (isFollowed) {
        nextFollowing.delete(userId);
      } else {
        nextFollowing.add(userId);
      }
      setFollowingIds(nextFollowing);

      // Update search results to reflect new follow status
      const updatedResults = searchResults.map(result => 
        result.id === userId ? { ...result, is_followed: !isFollowed } : result
      );
      setSearchResults(updatedResults);

      // Notify parent component
      if (onUserFollowed) {
        onUserFollowed();
      }
    } catch (error) {
      console.error('Follow toggle error:', error);
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="mb-6">
      <div className="rounded-lg border border-gradient-to-r from-blue-200 to-orange-200 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-700">
            🔍 Find & Follow People
          </h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isExpanded ? 'Close' : 'Expand'}
          </button>
        </div>

        {isExpanded && (
          <>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search for people by username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            {isLoading && <p className="text-center text-slate-500 py-4">Searching...</p>}

            {searchResults.length === 0 && searchTerm.length > 0 && !isLoading && (
              <p className="text-center text-slate-500 py-4">No users found. Try another search term.</p>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-3">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {result.avatar_url ? (
                        <img
                          src={result.avatar_url}
                          alt={result.username}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          {result.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-slate-700">{result.username}</span>
                    </div>

                    <button
                      onClick={() => toggleFollow(result.id)}
                      disabled={savingUserId === result.id}
                      className={`px-4 py-1.5 rounded-full font-medium text-sm transition-all ${
                        result.is_followed || followingIds.has(result.id)
                          ? 'bg-gray-300 hover:bg-gray-400 text-slate-700'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                      } ${savingUserId === result.id ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {savingUserId === result.id ? 'Loading...' : result.is_followed || followingIds.has(result.id) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchUsers;
