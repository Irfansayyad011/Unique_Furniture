import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiUpload, FiX, FiArrowLeft, FiSave } from 'react-icons/fi';
import { createProduct, updateProduct, fetchProductById } from '../../api';
import { useAuth } from '../../context/AuthContext';
import './ProductForm.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImg = (img) => (!img ? null : img.startsWith('http') ? img : `${API_BASE}${img}`);

const CATEGORIES = ['sofa', 'bed', 'table', 'chair', 'wardrobe', 'other'];

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  category: 'sofa',
  inStock: 'true',
  featured: 'false',
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const dashboardUrl = user?.role === 'owner' ? '/owner/dashboard' : '/admin/dashboard';

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  // Load product for edit
  useEffect(() => {
    if (!isEdit) return;
    setFetchLoading(true);
    fetchProductById(id)
      .then(({ data }) => {
        const p = data.product;
        setForm({
          name: p.name,
          description: p.description,
          price: p.price,
          discountPrice: p.discountPrice || '',
          category: p.category,
          inStock: p.inStock ? 'true' : 'false',
          featured: p.featured ? 'true' : 'false',
        });
        setExistingImages(p.images || []);
      })
      .catch(() => navigate(dashboardUrl))
      .finally(() => setFetchLoading(false));
  }, [id, dashboardUrl]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.price || Number(form.price) <= 0) e.price = 'Valid price is required';
    if (form.discountPrice && Number(form.discountPrice) >= Number(form.price))
      e.discountPrice = 'Discount price must be less than original price';
    if (!form.category) e.category = 'Category is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length - removedImages.length + newFiles.length + files.length;
    if (totalImages > 6) {
      alert('Maximum 6 images allowed');
      return;
    }
    setNewFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeExistingImage = (img) => {
    setRemovedImages((prev) => [...prev, img]);
    setExistingImages((prev) => prev.filter((i) => i !== img));
  };

  const removeNewFile = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    newFiles.forEach((f) => formData.append('images', f));
    removedImages.forEach((img) => formData.append('removeImages', img));

    try {
      if (isEdit) {
        await updateProduct(id, formData);
      } else {
        await createProduct(formData);
      }
      navigate(dashboardUrl);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save product';
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <div className="pf-loading">Loading product...</div>
  );

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Edit Product' : 'Add Product'} — Unique Furniture</title>
      </Helmet>

      <div className="pf-page">
        <div className="pf-container">
          {/* Header */}
          <div className="pf-header">
            <Link to={dashboardUrl} className="pd-back">
              <FiArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="pf-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          </div>

          <form onSubmit={handleSubmit} className="pf-form" encType="multipart/form-data" noValidate>
            <div className="pf-layout">
              {/* Left — Main Info */}
              <div className="pf-section">
                <h3 className="pf-section-title">Product Details</h3>

                {errors.submit && (
                  <div className="pf-error-banner">{errors.submit}</div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="pf-name">Product Name *</label>
                  <input id="pf-name" name="name" className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                    placeholder="e.g. Royal Walnut Sofa Set" value={form.name} onChange={handleChange} />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="pf-description">Description *</label>
                  <textarea id="pf-description" name="description"
                    className={`form-textarea ${errors.description ? 'form-input--error' : ''}`}
                    placeholder="Detailed product description..."
                    rows={5} value={form.description} onChange={handleChange} />
                  {errors.description && <span className="form-error">{errors.description}</span>}
                </div>

                <div className="pf-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="pf-price">Price (₹) *</label>
                    <input id="pf-price" name="price" type="number" min="0"
                      className={`form-input ${errors.price ? 'form-input--error' : ''}`}
                      placeholder="e.g. 85000" value={form.price} onChange={handleChange} />
                    {errors.price && <span className="form-error">{errors.price}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="pf-discount">Discount Price (₹)</label>
                    <input id="pf-discount" name="discountPrice" type="number" min="0"
                      className={`form-input ${errors.discountPrice ? 'form-input--error' : ''}`}
                      placeholder="Optional" value={form.discountPrice} onChange={handleChange} />
                    {errors.discountPrice && <span className="form-error">{errors.discountPrice}</span>}
                  </div>
                </div>

                <div className="pf-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="pf-category">Category *</label>
                    <select id="pf-category" name="category" className="form-select" value={form.category} onChange={handleChange}>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="pf-stock">Stock Status</label>
                    <select id="pf-stock" name="inStock" className="form-select" value={form.inStock} onChange={handleChange}>
                      <option value="true">In Stock</option>
                      <option value="false">Out of Stock</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="pf-featured">Featured</label>
                  <select id="pf-featured" name="featured" className="form-select" value={form.featured} onChange={handleChange}>
                    <option value="false">No</option>
                    <option value="true">Yes — show on homepage</option>
                  </select>
                </div>
              </div>

              {/* Right — Images */}
              <div className="pf-section">
                <h3 className="pf-section-title">Product Images</h3>
                <p className="form-hint" style={{ marginBottom: '1rem' }}>
                  Upload up to 6 images (JPG, PNG, WebP). First image is the main display image.
                </p>

                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div className="pf-images">
                    {existingImages.map((img, i) => (
                      <div key={img} className="pf-img-thumb">
                        <img src={getImg(img)} alt={`Image ${i + 1}`} />
                        {i === 0 && <span className="pf-img-main">Main</span>}
                        <button type="button" className="pf-img-remove" onClick={() => removeExistingImage(img)}>
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New previews */}
                {previews.length > 0 && (
                  <div className="pf-images" style={{ marginTop: existingImages.length ? '0.75rem' : 0 }}>
                    {previews.map((src, i) => (
                      <div key={src} className="pf-img-thumb pf-img-thumb--new">
                        <img src={src} alt={`New ${i + 1}`} />
                        <span className="pf-img-new">New</span>
                        <button type="button" className="pf-img-remove" onClick={() => removeNewFile(i)}>
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                {existingImages.length + previews.length < 6 && (
                  <label className="pf-upload-zone" htmlFor="pf-file-input">
                    <FiUpload size={28} />
                    <span>Click to upload images</span>
                    <span className="pf-upload-hint">JPG, PNG, WebP — max 5MB each</span>
                    <input
                      id="pf-file-input"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="pf-footer">
              <Link to={dashboardUrl} className="btn btn-outline">Cancel</Link>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                id="pf-submit-btn"
              >
                <FiSave size={18} />
                {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
