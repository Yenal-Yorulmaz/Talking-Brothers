import React, { useState, useEffect, useRef } from 'react';
import NewExperience from './NewExperience';
import NotificationBadge from './NotificationBadge';
import NotificationsPanel from './NotificationsPanel';
import LoginPage from './LoginPage';
import NewProduct from './NewProduct';
import ProductsPage from './ProductsPage';
import DashboardPage from './DashboardPage';
import { useAuth } from './AuthContext';
import API_BASE from './config';

// --- BİLEŞENLER (COMPONENTS) ---

// 1. Ortak Navigasyon Barı (image_5.png referanslı)
const Header = ({ activePage, setActivePage, onAddExperience, onAddProduct, onAvatarClick, user, onLogout, onNotificationClick }) => {
  const navLinks = ['Dashboard', 'Experiences', 'Products', 'Profile'];
  return (
    <header className="bg-gradient-to-r from-white via-blue-50 to-white border-b border-blue-100 shadow-lg sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-lg transform hover:scale-110 transition-transform">X</div>
          <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">Xplora</span>
        </div>
        
        <div className="flex items-center gap-8">
          {navLinks.map(link => (
            <button 
              key={link} 
              onClick={() => setActivePage(link)}
              className={`pb-2 text-sm font-semibold transition-all duration-200 ${activePage === link ? 'text-transparent bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text border-b-3 border-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
            >
              {link}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <button
                onClick={onAddExperience}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 transform hover:scale-105"
              >
                + NEW EXPERIENCE
              </button>
              <button
                onClick={onAddProduct}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-orange-200 transition-all duration-200 transform hover:scale-105"
              >
                + NEW PRODUCT
              </button>
            </>
          )}
          {user && (
            <div className="relative">
              <button
                onClick={onNotificationClick}
                className="relative w-11 h-11 rounded-full border-2 border-blue-200 hover:border-blue-500 transition-all bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center hover:shadow-lg shadow-md"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8c0-3.31-2.69-6-6-6S6 4.69 6 8c0 7-3 8-3 8h18s-3-1-3-8" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <NotificationBadge userId={user.id} />
              </button>
            </div>
          )}
          <div className="relative">
            <button
              onClick={onAvatarClick}
              className="w-11 h-11 rounded-full border-2 border-blue-200 overflow-hidden hover:border-blue-500 transition-all flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 shadow-md hover:shadow-lg"
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="User" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </button>
            {user && (
              <button
                onClick={onLogout}
                className="absolute top-12 right-0 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 shadow-xl hover:shadow-2xl transition-all"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

// 2. Experience Details Modal
const ExperienceDetails = ({ experience, onClose }) => {
  if (!experience) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-white via-blue-50 to-slate-100 rounded-3xl p-10 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-200">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-slate-900">⭐ Experience Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-4xl font-light transition-colors"
          >
            ×
          </button>
        </div>

        {/* Experience Information */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border-2 border-blue-300 mb-8 shadow-lg">
          <div className="flex items-start gap-8">
            <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-lg">
              {experience.title.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-600 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">⭐ Experience</span>
                <span className="bg-indigo-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">{experience.category_name}</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">{experience.title}</h3>
              
              <div className="flex items-center gap-3 mb-4 text-2xl font-black text-yellow-500">
                <span>{'★'.repeat(experience.rating)}{'☆'.repeat(5 - experience.rating)}</span>
                <span className="text-slate-900 ml-2">{experience.rating}/5</span>
              </div>

              {experience.location && (
                <p className="text-slate-800 text-base mb-4 font-bold">📍 Location: <span className="text-blue-700">{experience.location}</span></p>
              )}

              <p className="text-slate-800 text-base leading-relaxed mb-6 font-semibold">{experience.content}</p>

              {experience.username && (
                <div className="flex items-center gap-3 pt-6 border-t-2 border-blue-300">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {experience.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{experience.username}</p>
                    <p className="text-xs text-slate-600 font-semibold">{new Date(experience.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Experience Card
const ExperienceCard = ({ experience, onViewDetails }) => (
  <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-blue-200 group cursor-pointer transform hover:scale-105 hover:-translate-y-2" onClick={onViewDetails}>
    <div className="aspect-16/10 rounded-2xl overflow-hidden mb-6 relative shadow-md">
      <img src={experience.experience_image || `https://source.unsplash.com/random/600x400?${experience.category_name}`} alt={experience.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
      <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-xs font-black shadow-lg">
        ⭐ EXPERIENCE
      </div>
      <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-black text-blue-600 shadow-lg">
        {'★'.repeat(experience.rating)}{'☆'.repeat(5 - experience.rating)}
      </span>
    </div>
    <span className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">{experience.category_name}</span>
    <h3 className="text-2xl font-black mb-3 mt-2 text-slate-900">{experience.title}</h3>
    <p className="text-slate-700 text-sm leading-relaxed mb-6 line-clamp-3 font-semibold">{experience.content}</p>
    <div className="flex justify-between items-center pt-6 border-t-2 border-blue-200">
      <span className="font-black text-xl text-blue-700 bg-blue-100 px-4 py-2 rounded-full">{experience.rating}/5</span>
      <button className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center hover:shadow-lg text-white font-bold text-lg transition-all shadow-md transform hover:scale-110" onClick={(e) => { e.stopPropagation(); onViewDetails(); }}>
        →
      </button>
    </div>
  </div>
);

// --- PAGES ---

// 4. Explore Page
const ExperiencesPage = ({ refreshTrigger }) => {
  const [experiences, setExperiences] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [selectedExperienceId, setSelectedExperienceId] = useState(null);

  const experienceCategories = ['City', 'Cinema', 'Theatre', 'Workshop', 'Cafe', 'Restaurant'];

  const fetchExperiences = () => {
    fetch(`${API_BASE}/experiences`)
      .then(res => res.json())
      .then(data => {
        // Filter to only include actual experiences (with valid experience categories)
        const filteredExperiences = data.filter(exp => 
          experienceCategories.includes(exp.category_name)
        );
        setExperiences(filteredExperiences);
      })
      .catch(err => console.error("Data loading error:", err));
  };

  const fetchCategories = () => {
    // Hardcoded categories to match the add experience form
    setCategories(['All', ...experienceCategories]);
  };

  useEffect(() => {
    fetchExperiences();
    fetchCategories();
  }, [refreshTrigger]);

  const filterCategories = categories;
  const filteredExperiences = filterCategory === 'All'
    ? experiences
    : experiences.filter(exp => exp.category_name === filterCategory);

  const selectedExperience = experiences.find(exp => exp.id === selectedExperienceId);

  return (
    <>
      <div className="p-12 min-h-screen">
        <header className="mb-16">
          <span className="text-blue-600 text-xs font-black uppercase tracking-[0.3em]">⭐ Personal Experiences</span>
          <h1 className="text-5xl font-black mb-4 mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Discover Reality</h1>
          <p className="text-slate-700 text-lg mb-8 font-semibold">Share and explore authentic experiences from around the world</p>
          <div className="flex flex-wrap items-center gap-3 mt-12">
            {filterCategories.map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-5 py-3 rounded-full text-sm font-bold transition-all duration-200 transform hover:scale-105 shadow-md ${
                  filterCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExperiences.length > 0 ? filteredExperiences.map((exp) => (
            <ExperienceCard 
              key={exp.id}
              experience={exp}
              onViewDetails={() => setSelectedExperienceId(exp.id)}
            />
          )) : (
            <div className="col-span-full py-16 text-center">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-slate-600 text-lg font-semibold">No experiences found for this category.</p>
            </div>
          )}
        </div>
      </div>

      {selectedExperience && (
        <ExperienceDetails 
          experience={selectedExperience}
          onClose={() => setSelectedExperienceId(null)}
        />
      )}
    </>
  );
};

// 2. Profile Page
const ProfilePage = ({ user, setUser, onLoginClick }) => {
  const [filterType, setFilterType] = useState('All');
  const [experiences, setExperiences] = useState([]);
  const [products, setProducts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [selectedExperienceId, setSelectedExperienceId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState(user?.bio || '');
  const [savingBio, setSavingBio] = useState(false);
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);



  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleBannerClick = () => {
    bannerInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64String = reader.result;

          const response = await fetch(`${API_BASE}/users/${user.id}/avatar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ file: base64String })
          });

          if (response.ok) {
            // Update user state immediately with new avatar
            const updatedUser = { ...user, avatar_url: base64String };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            alert('Profile picture updated successfully!');
          } else {
            alert('Failed to upload profile picture');
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert('Error uploading profile picture');
        } finally {
          setUploading(false);
          // Reset file input
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        alert('Error reading file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File processing error:', error);
      alert('Error processing file');
      setUploading(false);
    }
  };

  const handleBannerFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB max for banner)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64String = reader.result;

          const response = await fetch(`${API_BASE}/users/${user.id}/banner`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ file: base64String })
          });

          if (response.ok) {
            // Update user state immediately with new banner
            const updatedUser = { ...user, banner_url: base64String };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            alert('Banner updated successfully!');
          } else {
            alert('Failed to upload banner');
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert('Error uploading banner');
        } finally {
          setUploading(false);
          // Reset file input
          if (bannerInputRef.current) bannerInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        alert('Error reading file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File processing error:', error);
      alert('Error processing file');
      setUploading(false);
    }
  };

  const handleSaveBio = async () => {
    if (!bioText.trim()) {
      alert('Bio cannot be empty');
      return;
    }

    setSavingBio(true);
    try {
      const response = await fetch(`${API_BASE}/users/${user.id}/bio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ bio: bioText.trim() })
      });

      if (response.ok) {
        const updatedUser = { ...user, bio: bioText.trim() };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setEditingBio(false);
        alert('Bio updated successfully!');
      } else {
        alert('Failed to update bio');
      }
    } catch (error) {
      console.error('Bio update error:', error);
      alert('Error updating bio');
    } finally {
      setSavingBio(false);
    }
  };

  const handleCancelBio = () => {
    setBioText(user?.bio || '');
    setEditingBio(false);
  };

  useEffect(() => {
    if (!user) return;
    
    // Fetch all experiences and filter by user (exclude reviews which have product_id)
    fetch(`${API_BASE}/experiences`)
      .then(res => res.json())
      .then(data => {
        const userExperiences = data.filter(exp => exp.user_id === user.id && !exp.product_id);
        setExperiences(userExperiences);
      })
      .catch(err => {
        console.error("Data fetch error:", err);
        setExperiences([]); // Set empty array on error
      });

    // Fetch all products and filter by user
    fetch(`${API_BASE}/products`)
      .then(res => res.json())
      .then(data => {
        const userProducts = data.filter(prod => prod.user_id === user.id);
        setProducts(userProducts);
      })
      .catch(err => {
        console.error("Products fetch error:", err);
        setProducts([]); // Set empty array on error
      });

    // Fetch follower count
    fetch(`${API_BASE}/users/${user.id}/followers`)
      .then(res => res.json())
      .then(data => {
        setFollowers(data.count || 0);
      })
      .catch(err => {
        console.error("Followers fetch error:", err);
        setFollowers(0);
      });

    // Fetch following count
    fetch(`${API_BASE}/users/${user.id}/following`)
      .then(res => res.json())
      .then(data => {
        setFollowing(data.count || 0);
      })
      .catch(err => {
        console.error("Following fetch error:", err);
        setFollowing(0);
      });
  }, [user]);

  // Update bioText when user bio changes
  useEffect(() => {
    if (user?.bio) {
      setBioText(user.bio);
    }
  }, [user?.bio]);

  if (!user) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-400 mb-4">Please log in to view your profile</p>
        <button 
          onClick={onLoginClick}
          className="bg-brand-blue text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="pb-12">
        {/* Cover Section / Banner */}
        <div className="relative h-64 bg-linear-to-r from-brand-blue to-blue-600 rounded-b-3xl overflow-hidden mb-16 group cursor-pointer">
          {user.banner_url ? (
            <img src={user.banner_url} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full">
              <svg className="w-full h-full opacity-10" viewBox="0 0 1200 400">
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
                <rect width="1200" height="400" fill="url(#grid)" />
              </svg>
            </div>
          )}
          <button
            onClick={handleBannerClick}
            className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
            disabled={uploading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {uploading ? 'Uploading...' : 'Change Banner'}
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* Profile Header */}
        <div className="max-w-7xl mx-auto px-6 -mt-16 mb-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8">
            <div className="relative group flex-shrink-0">
            <div 
              className="w-40 h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden relative cursor-pointer flex-shrink-0 hover:shadow-3xl transition-shadow"
              onClick={handleProfilePictureClick}
            >
              {user.avatar_url ? (
                <img 
                  key={user.avatar_url}
                  src={user.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                  <div className="animate-spin">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <button
              onClick={handleProfilePictureClick}
              className="absolute -bottom-2 -right-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 disabled:opacity-50"
              disabled={uploading}
              title="Upload profile picture"
            >
              {uploading ? (
                <div className="animate-spin">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                </div>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          </div>
          <div className="pb-4 flex-grow">
            <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-brand-blue to-blue-600 bg-clip-text text-transparent">{user.username}</h1>
            <p className="text-gray-500 text-lg mb-8 flex items-center gap-2"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>{user.email}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <span className="text-3xl font-bold text-brand-blue block">{experiences.length + products.length}</span>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Contributions</span>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <span className="text-3xl font-bold text-brand-orange block">{followers}</span>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Followers</span>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <span className="text-3xl font-bold text-brand-orange block">{following}</span>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Following</span>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                {user.created_at ? (
                  <>
                    <span className="text-3xl font-bold text-brand-blue block">
                      {(() => {
                        const created = new Date(user.created_at);
                        const now = new Date();
                        const yearsAgo = Math.floor((now - created) / (1000 * 60 * 60 * 24 * 365));
                          return yearsAgo > 0 ? `${yearsAgo} ${yearsAgo === 1 ? 'year' : 'years'}` : 'New';
                        })()}
                      </span>
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Member</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-brand-blue block">-</span>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Member</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-shadow">📍 Member</span>
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-shadow">✅ Active User</span>
            </div>
          </div>
        </div>

        {/* About Me Section */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">About Me</h2>
              </div>
              {!editingBio && (
                <button
                  onClick={() => setEditingBio(true)}
                  className="bg-blue-50 text-brand-blue hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              )}
            </div>
            {editingBio ? (
              <div className="space-y-4">
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  maxLength={500}
                  placeholder="Write something about yourself..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none text-gray-700"
                  rows="5"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{bioText.length}/500</span>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelBio}
                      className="px-5 py-2 border-2 border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition-colors"
                      disabled={savingBio}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveBio}
                      className="px-5 py-2 bg-gradient-to-r from-brand-blue to-blue-600 text-white rounded-lg hover:shadow-lg font-semibold transition-all disabled:opacity-50"
                      disabled={savingBio}
                    >
                      {savingBio ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                {user.bio || <span className="text-gray-400 italic">No bio yet. Click edit to add one!</span>}
              </p>
            )}
          </div>
        </div>

        {/* Filter Section */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex gap-4 border-b-2 border-gray-200">
            {['All', 'Experiences', 'Products'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`py-4 px-4 font-bold transition-all relative ${
                  filterType === type
                    ? 'text-brand-blue'
                    : 'text-gray-500 hover:text-gray-700'
                } ${filterType === type ? 'after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-1 after:bg-gradient-to-r after:from-brand-blue after:to-blue-600 after:rounded-full' : ''}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-6">
          {(filterType === 'All' || filterType === 'Experiences') && experiences.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3"><span className="w-8 h-8 bg-brand-blue rounded-lg"></span>My Experiences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {experiences.map(exp => (
                  <div key={exp.id} className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-blue-200 group cursor-pointer transform hover:scale-105 hover:-translate-y-2">
                    <div className="aspect-16/10 rounded-2xl overflow-hidden mb-6 relative shadow-md bg-gradient-to-br from-blue-400 to-indigo-600">
                      {exp.experience_image ? (
                        <img src={exp.experience_image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-3xl font-black opacity-40">
                          {exp.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-xs font-black shadow-lg">
                        ⭐ EXPERIENCE
                      </div>
                      <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-black text-blue-600 shadow-lg">
                        {'★'.repeat(exp.rating || 0)}{'☆'.repeat(5 - (exp.rating || 0))}
                      </span>
                    </div>
                    <span className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">{exp.category_name || exp.category || 'Experience'}</span>
                    <h3 className="text-2xl font-black mb-3 mt-2 text-slate-900">{exp.title}</h3>
                    <p className="text-slate-700 text-sm leading-relaxed mb-6 line-clamp-3 font-semibold">{exp.description || exp.content}</p>
                    <div className="flex justify-between items-center pt-6 border-t-2 border-blue-200">
                      <span className="font-black text-xl text-blue-700 bg-blue-100 px-4 py-2 rounded-full">{exp.rating || 0}/5</span>
                      <button className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center hover:shadow-lg text-white font-bold text-lg transition-all shadow-md transform hover:scale-110">
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(filterType === 'All' || filterType === 'Products') && products.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3"><span className="w-8 h-8 bg-brand-orange rounded-lg"></span>My Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map(prod => (
                  <div key={prod.id} className="bg-gradient-to-br from-green-50 via-white to-emerald-50 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-green-200 group transform hover:scale-105 hover:-translate-y-2">
                    <div className="aspect-16/10 rounded-2xl overflow-hidden mb-6 relative bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                      {prod.product_image ? (
                        <img src={prod.product_image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-3xl font-black opacity-40">
                          {prod.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full text-xs font-black shadow-lg">
                        📦 PRODUCT
                      </div>
                      <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-black text-green-600 shadow-lg">
                        {'★'.repeat(prod.rating || 0)}{'☆'.repeat(5 - (prod.rating || 0))}
                      </span>
                    </div>
                    <span className="text-green-700 text-[10px] font-black uppercase tracking-[0.2em]">{prod.category || 'Product'}</span>
                    <h3 className="text-2xl font-black mb-3 mt-2 text-slate-900">{prod.name}</h3>
                    <p className="text-slate-700 text-xs mb-4 font-bold">⏱️ Used for: <span className="text-green-700 font-black">{prod.usage_duration || 'Recently purchased'}</span></p>
                    
                    <div className="mb-4 pb-4 border-b-2 border-green-200 space-y-2">
                      <p className="text-green-700 text-xs font-bold line-clamp-1">✅ Pros: <span className="text-slate-800">{prod.pros || 'Great product'}</span></p>
                      <p className="text-red-700 text-xs font-bold line-clamp-1">❌ Cons: <span className="text-slate-800">{prod.cons || 'None'}</span></p>
                    </div>

                    <p className="text-slate-700 text-sm line-clamp-3 mb-6 font-semibold">{prod.description || prod.content}</p>

                    <div className="flex flex-col gap-3 pt-4 border-t-2 border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xl text-green-700 bg-green-100 px-4 py-2 rounded-full">{prod.rating || 0}/5</span>
                        <button className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center hover:shadow-lg text-white font-bold text-lg transition-all shadow-md transform hover:scale-110">
                          →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {experiences.length === 0 && products.length === 0 && (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-lg font-semibold mb-2">No content yet</p>
              <p className="text-gray-400 text-sm">Start by creating an experience or product to showcase your work!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

// --- MAIN APP ---

function App() {
  const { user, setUser, logout } = useAuth();
  
  console.log('App render - user:', user);
  const [activePage, setActivePage] = useState('Experiences');
  const [showNewExperience, setShowNewExperience] = useState(false);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedProductForExperience, setSelectedProductForExperience] = useState(null);

  const handleAddExperience = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setSelectedProductForExperience(null);
    setShowNewExperience(true);
  };

  const handleAddProduct = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setShowNewProduct(true);
  };

  const handleAddProductExperience = (product) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setSelectedProductForExperience(product);
    setShowNewExperience(true);
  };

  const handleAvatarClick = () => {
    if (user) {
      // If logged in, go to profile
      setActivePage('Profile');
    } else {
      // If not logged in, show login modal
      setShowLogin(true);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleNotificationClick = () => {
    setShowNotifications((prev) => !prev);
  };

  const handleExperienceSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleProductSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header 
        activePage={activePage} 
        setActivePage={setActivePage}
        onAddExperience={handleAddExperience}
        onAddProduct={handleAddProduct}
        onAvatarClick={handleAvatarClick}
        onNotificationClick={handleNotificationClick}
        user={user}
        onLogout={handleLogout}
      />
      <main className="max-w-7xl mx-auto">
        {activePage === 'Experiences' && <ExperiencesPage refreshTrigger={refreshTrigger} />}
        {activePage === 'Profile' && <ProfilePage user={user} setUser={setUser} onLoginClick={() => setShowLogin(true)} />}
        {activePage === 'Dashboard' && (
          <DashboardPage
            user={user}
            onLoginClick={() => setShowLogin(true)}
            onOpenNotifications={() => setShowNotifications(true)}
          />
        )}
        {activePage === 'Products' && <ProductsPage refreshTrigger={refreshTrigger} onAddExperience={handleAddProductExperience} user={user} />}
      </main>
      
      {showNewExperience && (
        <NewExperience 
          onClose={() => {
            setShowNewExperience(false);
            setSelectedProductForExperience(null);
          }}
          onSuccess={handleExperienceSuccess}
          productName={selectedProductForExperience?.product_name}
          initialCategoryName={selectedProductForExperience?.category_name}
          initialTitle={selectedProductForExperience ? `My experience with this product` : ''}
          productId={selectedProductForExperience?.id}
        />
      )}

      {showNewProduct && (
        <NewProduct 
          onClose={() => setShowNewProduct(false)}
          onSuccess={handleProductSuccess}
        />
      )}

      {showLogin && (
        <LoginPage 
          onClose={() => setShowLogin(false)}
        />
      )}

      {showNotifications && (
        <NotificationsPanel
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}

export default App;
