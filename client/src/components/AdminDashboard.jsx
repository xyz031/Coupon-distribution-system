import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const [coupons, setCoupons] = useState([]);
  const [claimedCoupons, setClaimedCoupons] = useState([]); // Claimed Coupons History
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

      // Separate claimed and unclaimed coupons
      const allCoupons = response.data;
      setCoupons(allCoupons.filter((coupon) => !coupon.isClaimed));
      setClaimedCoupons(allCoupons.filter((coupon) => coupon.isClaimed));
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

      {/* Active Coupons List */}
      <div className="coupons-list">
        <h3>Available Coupons</h3>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Value</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length > 0 ? (
              coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td>{coupon.code}</td>
                  <td>${coupon.value}</td>
                  <td>{coupon.isActive ? 'Available' : 'Inactive'}</td>
                  <td>
                    <button
                      onClick={() => toggleCouponStatus(coupon._id, !coupon.isActive)}
                    >
                      {coupon.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No available coupons</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Coupon Claim History */}
      <div className="claim-history">
        <h3>Claimed Coupons History</h3>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Value</th>
              <th>Claimed At</th>
              <th>Claimed By (IP Address)</th>
            </tr>
          </thead>
          <tbody>
            {claimedCoupons.length > 0 ? (
              claimedCoupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td>{coupon.code}</td>
                  <td>${coupon.value}</td>
                  <td>{new Date(coupon.claimedAt).toLocaleString()}</td>
                  <td>{coupon.ipAddress || 'Unknown'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No claimed coupons</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
