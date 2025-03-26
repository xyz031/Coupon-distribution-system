import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', value: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch coupons from the backend
  const fetchCoupons = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('Unauthorized: Please log in again.');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/coupons/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch coupons');
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Add a new coupon
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem('adminToken');

    try {
      const response = await axios.post(
        `${API_URL}/api/coupons/admin`,
        newCoupon,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCoupons([response.data, ...coupons]);
      setNewCoupon({ code: '', value: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add coupon');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle coupon active/inactive status
  const toggleCouponStatus = async (id, isActive) => {
    const token = localStorage.getItem('adminToken');

    try {
      const response = await axios.patch(
        `${API_URL}/api/coupons/admin/${id}`,
        { isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCoupons(coupons.map((c) => (c._id === id ? response.data : c)));
    } catch (err) {
      setError('Failed to update coupon status');
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Coupon Management</h2>

      {/* Add Coupon Form */}
      <div className="add-coupon">
        <h3>Add New Coupon</h3>
        <form onSubmit={handleAddCoupon}>
          <input
            type="text"
            placeholder="Coupon Code"
            value={newCoupon.code}
            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Value"
            value={newCoupon.value}
            onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Coupon'}
          </button>
        </form>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Coupon List Table */}
      <div className="coupons-list">
        <h3>All Coupons</h3>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Value</th>
              <th>Status</th>
              <th>Claimed By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id}>
                <td>{coupon.code}</td>
                <td>${coupon.value}</td>
                <td>
                  {coupon.isClaimed
                    ? 'Claimed'
                    : coupon.isActive
                    ? 'Available'
                    : 'Inactive'}
                </td>
                <td>
                  {coupon.isClaimed ? (
                    <>
                      <div>IP: {coupon.ipAddress}</div>
                      <div>At: {new Date(coupon.claimedAt).toLocaleString()}</div>
                    </>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <button
                    onClick={() => toggleCouponStatus(coupon._id, !coupon.isActive)}
                    disabled={coupon.isClaimed}
                  >
                    {coupon.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
