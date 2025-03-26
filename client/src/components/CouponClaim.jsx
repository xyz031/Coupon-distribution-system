import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const CouponClaim = () => {
  const [coupon, setCoupon] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClaim = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/api/coupons/claim`, {
        withCredentials: true, // Ensures cookies are sent if needed
      });

      setCoupon(response.data.coupon);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to claim coupon. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="coupon-claim">
      <h2>Claim Your Coupon</h2>

      {coupon ? (
        <div className="coupon-display">
          <h3>Your Coupon Code:</h3>
          <p className="coupon-code">{coupon.code}</p>
          <p>Value: ${coupon.value}</p>
        </div>
      ) : (
        <button onClick={handleClaim} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Claim Coupon'}
        </button>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default CouponClaim;
