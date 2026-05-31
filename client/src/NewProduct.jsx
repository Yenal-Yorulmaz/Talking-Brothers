import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import API_BASE from './config';

const productCategories = [
  'Fashion & Apparel',
  'Electronics',
  'Home & Living',
  'Beauty & Personal Care',
  'Mother & Baby',
  'Sports & Outdoors',
  'Shoes & Bags',
  'Accessories',
  'Toys & Hobbies',
  'Health & Wellness',
  'Grocery / Supermarket',
  'Pet Supplies',
  'Books & Stationery',
  'Automotive',
  'Garden & DIY',
  'Office Supplies'
];

const NewProduct = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    product_name: '',
    product_code: '',
    category: '',
    purchase_date: '',
    pros: '',
    cons: '',
    content: '',
    rating: 5,
    product_image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to create a product');
      return;
    }
    setLoading(true);

    try {
      const productData = {
        user_id: user.id,
        category_name: formData.category,
        product_name: formData.product_name,
        product_code: formData.product_code,
        purchase_date: formData.purchase_date,
        pros: formData.pros,
        cons: formData.cons,
        content: formData.content,
        rating: formData.rating,
        product_image: formData.product_image
      };

      console.log('=== PRODUCT SUBMISSION DEBUG ===');
      console.log('formData.rating:', formData.rating);
      console.log('typeof formData.rating:', typeof formData.rating);
      console.log('productData.rating:', productData.rating);
      console.log('typeof productData.rating:', typeof productData.rating);
      console.log('Full productData object:', productData);
      console.log('JSON.stringify result:', JSON.stringify(productData));
      console.log('=== END DEBUG ===' );

      const response = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorBody = await response.json().catch(() => null);
        
        // Handle duplicate product code (409 Conflict)
        if (response.status === 409) {
          throw new Error(errorBody?.error || 'You already have a product with this product code');
        }
        
        throw new Error(errorBody?.error || 'Could not create product.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Error creating product');
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
        product_image: base64String
      }));
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-white via-orange-50 to-slate-100 rounded-3xl p-10 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-orange-200">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900">📦 Share a Product Review</h2>
            <p className="text-sm text-slate-600 font-medium mt-1">Help others with your honest feedback</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-4xl font-light transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">
              Product Name *
            </label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white transition-all shadow-sm font-semibold"
              placeholder="e.g., Sony WH-1000XM5 Headphones"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">
              Product Code *
            </label>
            <input
              type="text"
              name="product_code"
              value={formData.product_code}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white transition-all shadow-sm font-semibold"
              placeholder="e.g., SKU-12345 or UPC code"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">
              📸 Product Picture
            </label>
            <div className="flex gap-3 items-start">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1 px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white transition-all shadow-sm font-semibold cursor-pointer"
              />
              {imagePreview && (
                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-orange-200 flex-shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">Optional - JPG, PNG up to 5MB</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white transition-all shadow-sm font-semibold"
            >
              <option value="">Select a category</option>
              {productCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

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
              className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white transition-all shadow-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">
              ⭐ Your Rating *
            </label>
            <div className="flex gap-3 items-center">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className={`text-3xl transition-transform transform hover:scale-125 ${
                      star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-600 ml-3 bg-orange-100 px-3 py-1 rounded-full">
                {formData.rating} / 5
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-green-700 mb-3">
                ✅ Pros *
              </label>
              <textarea
                name="pros"
                value={formData.pros}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50 transition-all shadow-sm resize-none font-semibold"
                rows={4}
                placeholder="What did you like about this product?"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-red-700 mb-3">
                ❌ Cons *
              </label>
              <textarea
                name="cons"
                value={formData.cons}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50 transition-all shadow-sm resize-none font-semibold"
                rows={4}
                placeholder="What could be improved?"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">
              Detailed Review *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white transition-all shadow-sm font-semibold resize-none"
              rows={6}
              placeholder="Share your detailed thoughts, personal experience, value for money, recommendations, etc."
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-wait transform hover:scale-105"
            >
              {loading ? '⏳ Publishing...' : '✨ Publish Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProduct;