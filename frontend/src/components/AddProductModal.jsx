import React, { useState } from 'react';
import api from '../services/api';

const AddProductModal = ({ isOpen, onClose, onProductCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    image: '',
    stock: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Pre-validation
    if (Number(formData.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (Number(formData.stock) < 0) {
      setError('Stock cannot be negative');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        image: formData.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
        stock: Number(formData.stock),
      };

      const res = await api.post('/products', payload);
      setSuccess('Product successfully added to MongoDB catalogue!');
      setTimeout(() => {
        onProductCreated(res.data.product || res.data);
        onClose();
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create product.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📦 Create New Product (POST /products)</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form product-form">
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Wireless Gaming Mouse"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              rows="3"
              className="form-textarea"
              placeholder="Detailed description of features, materials, warranty..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label>Price (₹) * (&gt; 0)</label>
              <input
                type="number"
                name="price"
                placeholder="2499"
                min="0.01"
                step="any"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Stock Quantity * (&ge; 0)</label>
              <input
                type="number"
                name="stock"
                placeholder="20"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="filter-select"
                required
              >
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Books">Books</option>
                <option value="Home">Home</option>
              </select>
            </div>

            <div className="form-group">
              <label>Image URL *</label>
              <input
                type="url"
                name="image"
                placeholder="https://example.com/product.jpg"
                value={formData.image}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : '➕ Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
