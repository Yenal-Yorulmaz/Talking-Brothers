import React, { useState, useEffect } from 'react';

const calculateUsageDuration = (purchaseDate) => {
  const purchase = new Date(purchaseDate);
  const today = new Date();
  
  const diffTime = Math.abs(today - purchase);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  
  const weeks = Math.floor(diffDays / 7);
  if (weeks === 1) return '1 week';
  if (weeks < 4) return `${weeks} weeks`;
  
  const months = Math.floor(diffDays / 30);
  if (months === 1) return '1 month';
  if (months < 12) return `${months} months`;
  
  const years = Math.floor(diffDays / 365);
  return years === 1 ? '1 year' : `${years} years`;
};

const ProductDetails = ({ productId, onClose }) => {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProductDetails = () => {
    fetch(`http://localhost:5000/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        setProductData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Product details error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center py-16">
            <div className="animate-spin mb-4">
              <svg className="w-12 h-12 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <p className="text-slate-600 font-semibold">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!productData) {
    return null;
  }

  const { product, experiences } = productData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-white via-green-50 to-slate-100 rounded-3xl p-10 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-green-200">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-slate-900">📦 Product Details & Reviews</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-4xl font-light transition-colors"
          >
            ×
          </button>
        </div>

        {/* Product Information */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl border-2 border-green-300 mb-8 shadow-lg">
          <div className="flex items-start gap-8">
            <div className="w-40 h-40 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-lg overflow-hidden flex-shrink-0">
              {product.product_image ? (
                <img src={product.product_image} alt={product.product_name} className="w-full h-full object-cover" />
              ) : (
                <span>{product.product_name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-green-600 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">📦 Product</span>
                <span className="bg-emerald-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">{product.category_name}</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-3">{product.product_name}</h3>
              <p className="text-slate-700 text-base mb-4 font-semibold">⏱️ Used for: <span className="text-green-700 font-black">{product.usage_duration}</span></p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-100 rounded-xl p-4 border-2 border-green-400">
                  <p className="text-green-800 text-base font-black mb-2">✅ Pros:</p>
                  <p className="text-slate-800 text-sm leading-relaxed font-semibold">{product.pros || "Not specified"}</p>
                </div>
                <div className="bg-red-100 rounded-xl p-4 border-2 border-red-400">
                  <p className="text-red-800 text-base font-black mb-2">❌ Cons:</p>
                  <p className="text-slate-800 text-sm leading-relaxed font-semibold">{product.cons || "Not specified"}</p>
                </div>
              </div>
              
              <p className="text-slate-800 text-base leading-relaxed font-semibold mb-6">{product.content || "No description available."}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-6">⭐ User Reviews ({experiences.length})</h3>
          
          {experiences.length > 0 ? (
            <div className="space-y-4">
              {experiences.map((experience) => (
                <div key={experience.id} className="bg-gradient-to-br from-blue-50 to-slate-100 p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all transform hover:scale-102">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full border-3 border-blue-300 overflow-hidden shrink-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                      {experience.avatar_url ? (
                        <img src={experience.avatar_url} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        'U'
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-900 text-base">{experience.username || `User #${experience.user_id}`}</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-lg ${i < experience.rating ? 'text-yellow-400' : 'text-slate-300'}`}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold mb-2">{new Date(experience.created_at).toLocaleDateString()} • ⏱️ Used for: <span className="text-green-700 font-bold">{calculateUsageDuration(experience.purchase_date)}</span></p>
                      <p className="font-bold text-slate-900 text-base mb-3">{experience.title}</p>
                    </div>
                  </div>
                  {experience.experience_image && (
                    <div className="mb-4 rounded-xl overflow-hidden border-2 border-blue-200">
                      <img src={experience.experience_image} alt="Review photo" className="w-full h-48 object-cover" />
                    </div>
                  )}
                  <p className="text-slate-800 text-sm leading-relaxed font-semibold">{experience.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
              <p className="text-slate-600 text-base font-bold">📝 No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product_name, product_image, usage_duration, pros, cons, content, category, onAddExperience, onViewDetails, user }) => (
  <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-green-200 group transform hover:scale-105 hover:-translate-y-2">
    <div className="aspect-16/10 rounded-2xl overflow-hidden mb-6 relative bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
      {product_image ? (
        <img src={product_image} alt={product_name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-green-500 to-emerald-600">
          <svg className="w-24 h-24 opacity-40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      )}
      <div className="absolute top-4 left-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full text-xs font-black shadow-lg">
        📦 PRODUCT
      </div>
    </div>
    <span className="text-green-700 text-[10px] font-black uppercase tracking-widest">{category}</span>
    <h3 className="text-2xl font-black mb-3 mt-2 text-slate-900">{product_name}</h3>
    <p className="text-slate-700 text-xs mb-4 font-bold">⏱️ Used for: <span className="text-green-700 font-black">{usage_duration}</span></p>

    <div className="mb-4 pb-4 border-b-2 border-green-200 space-y-2">
      <p className="text-green-700 text-xs font-bold line-clamp-1">✅ Pros: <span className="text-slate-800">{pros}</span></p>
      <p className="text-red-700 text-xs font-bold line-clamp-1">❌ Cons: <span className="text-slate-800">{cons}</span></p>
    </div>

    <p className="text-slate-700 text-sm line-clamp-3 mb-6 font-semibold">{content}</p>

    <div className="flex flex-col gap-3 pt-4 border-t-2 border-green-200">
      {user ? (
        <button
          type="button"
          onClick={onAddExperience}
          className="w-full rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 text-sm font-bold hover:shadow-lg shadow-md transition-all transform hover:scale-105"
        >
          ⭐ Add your review
        </button>
      ) : (
        <button
          type="button"
          onClick={() => alert('Please log in to add a review')}
          className="w-full rounded-full bg-slate-400 text-white py-3 text-sm font-bold cursor-not-allowed opacity-50"
        >
          Login to Add Review
        </button>
      )}
      <button className="w-full rounded-full border-2 border-green-400 text-green-700 py-3 text-sm font-bold hover:bg-green-50 hover:border-green-500 transition-all transform hover:scale-105 shadow-sm" onClick={onViewDetails}>
        👁️ View Details
      </button>
    </div>
  </div>
);

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

const ProductsPage = ({ refreshTrigger, onAddExperience, user }) => {
  const [products, setProducts] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const fetchProducts = () => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Data loading error:", err));
  };

  const filteredProducts = filterCategory === 'All'
    ? products
    : products.filter(product => product.category_name === filterCategory);

  return (
    <div className="p-12 min-h-screen">
      <header className="mb-16">
        <span className="text-green-600 text-xs font-black uppercase tracking-[0.3em]">📦 Product Reviews</span>
        <h1 className="text-5xl font-black mb-4 mt-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Find the Best Products</h1>
        <p className="text-slate-700 text-lg mb-8 font-semibold">Discover and review products from real users in your community</p>
        <div className="flex flex-wrap items-center gap-3 mt-12">
          {['All', ...productCategories].map((category) => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`px-5 py-3 rounded-full text-sm font-bold transition-all duration-200 transform hover:scale-105 shadow-md ${
                filterCategory === category
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-orange-400 hover:text-orange-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.length > 0 ? filteredProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            category={product.category_name} 
            product_name={product.product_name}
            product_image={product.product_image}
            usage_duration={product.usage_duration}
            pros={product.pros || "Not specified"}
            cons={product.cons || "Not specified"}
            content={product.content || "No description available."}
            onAddExperience={() => onAddExperience(product)}
            onViewDetails={() => setSelectedProductId(product.id)}
            user={user}
          />
        )) : (
          <div className="col-span-full py-16 text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-slate-600 text-lg font-semibold">No products found for this category.</p>
          </div>
        )}
      </div>

      {selectedProductId && (
        <ProductDetails 
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </div>
  );
};

export default ProductsPage;