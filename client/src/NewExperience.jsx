import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import API_BASE from './config';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

const LocationMapPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState([40, 0]);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  const fetchAddress = async (lat, lng) => {
    setLoading(true);
    try {
      // Use Nominatim API (OpenStreetMap) for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data.address) {
        const { country, state, province, city, town, county } = data.address;
        
        // Build address in order: Country, City, Province
        const parts = [];
        
        // Add country
        if (country) parts.push(country);
        
        // Add city/town
        if (city) parts.push(city);
        else if (town) parts.push(town);
        else if (county) parts.push(county);
        
        // Add province/state
        if (state) parts.push(state);
        else if (province) parts.push(province);
        
        const displayAddress = parts.length > 0 ? parts.join(', ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setAddress(displayAddress);
        onLocationSelect(displayAddress);
      } else {
        const fallbackAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setAddress(fallbackAddress);
        onLocationSelect(fallbackAddress);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      const fallbackAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddress(fallbackAddress);
      onLocationSelect(fallbackAddress);
    } finally {
      setLoading(false);
    }
  };

  const MapClickHandler = () => {
    const map = useMap();
    useEffect(() => {
      const handleClick = (e) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        fetchAddress(lat, lng);
      };
      map.on('click', handleClick);
      return () => map.off('click', handleClick);
    }, [map]);
    return null;
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600 font-semibold">Click on the map to select your location</p>
      <MapContainer 
        center={position} 
        zoom={2} 
        style={{ height: '300px', borderRadius: '12px', border: '2px solid #e2e8f0' }}
        className="z-10"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <Marker position={position}>
          <Popup>
            Selected Location<br />{address}
          </Popup>
        </Marker>
        <MapClickHandler />
      </MapContainer>
      {address && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-slate-600">📍 Selected Location:</p>
          <p className="text-sm font-bold text-blue-700">{loading ? 'Loading address...' : address}</p>
        </div>
      )}
    </div>
  );
};

const NewExperience = ({ onClose, onSuccess, productName = '', initialCategoryName = '', initialTitle = '', productId = null }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: initialTitle,
    category_name: initialCategoryName || '',
    location: '',
    content: '',
    rating: 5,
    experience_image: null,
    purchase_date: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      title: initialTitle || prev.title,
      category_name: initialCategoryName || prev.category_name
    }));
  }, [initialTitle, initialCategoryName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to create an experience');
      return;
    }
    setLoading(true);

    try {
      const experienceData = {
        user_id: user.id,
        ...formData,
        ...(productId && { product_id: productId })
      };

      const response = await fetch(`${API_BASE}/experiences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(experienceData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || 'Could not create experience.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Error creating experience');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      setFormData(prev => ({
        ...prev,
        experience_image: base64String
      }));
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-white via-blue-50 to-slate-100 rounded-3xl p-10 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-200">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900">{productName ? '📝 Add Your Review' : '⭐ Share an Experience'}</h2>
            <p className="text-sm text-slate-600 font-medium mt-1">{productName ? 'Tell us what you think about this product' : 'Tell us about your amazing experience'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-4xl font-light transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {productName && (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-5 mb-6">
              <p className="text-xs uppercase font-bold text-orange-700 mb-2">📦 Product</p>
              <p className="text-base font-bold text-orange-900">{productName}</p>
              <p className="text-xs text-orange-700 mt-2">Your review will be connected to this product.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all shadow-sm font-semibold"
              placeholder={productName ? `Review title for ${productName}` : 'Brief title of your experience'}
            />
          </div>

          {productName && (
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Purchase Date *
              </label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all shadow-sm font-semibold"
              />
            </div>
          )}

          {!productName && (
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Category *
              </label>
              <select
                name="category_name"
                value={formData.category_name}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all shadow-sm font-semibold"
              >
                <option value="">Select a category</option>
                <option value="City">City</option>
                <option value="Cinema">Cinema</option>
                <option value="Theatre">Theatre</option>
                <option value="Workshop">Workshop</option>
                <option value="Cafe">Cafe</option>
                <option value="Restaurant">Restaurant</option>
              </select>
            </div>
          )}

          {!productName && (
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                📍 Location *
              </label>
              <LocationMapPicker onLocationSelect={(location) => setFormData(prev => ({...prev, location}))} />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleChange({ target: { name: 'rating', value: star } })}
                  className={`text-4xl transition-transform transform hover:scale-125 ${
                    star <= formData.rating ? 'text-yellow-400' : 'text-slate-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {!productName && (
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                🖼️ Experience Picture
              </label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all shadow-sm"
                  />
                  <p className="text-xs text-slate-600 mt-2">Optional - JPG, PNG up to 5MB</p>
                </div>
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-20 h-20 rounded-lg object-cover border-2 border-blue-200"
                  />
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">
              {productName ? '🖊️ Your Review' : 'Your Experience'} *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all shadow-sm font-semibold resize-none"
              rows={6}
              placeholder={productName ? 'Share your honest review. What did you like? What could be improved? How has it held up over time? Any recommendations?' : 'Share detailed thoughts about your experience, what you liked, what you didn\'t, recommendations, etc.'}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-md transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:shadow-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-wait transform hover:scale-105"
            >
              {loading ? '⏳ Submitting...' : productName ? '📝 Submit Review' : '✨ Publish Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewExperience;