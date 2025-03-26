import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AdminClaimHistory = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClaimHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/coupons/admin/claim-history`, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('adminToken')}` 
          }
        });
        setClaims(response.data);
      } catch (err) {
        setError('Failed to load claim history. Please try again.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClaimHistory();
  }, []);

  return (
    <div className="claim-history">
      <h2>Coupon Claim History</h2>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : claims.length === 0 ? (
        <p>No claims yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Value</th>
              <th>Claimed At</th>
              <th>IP Address</th>
              <th>Browser/Device</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim, index) => (
              <tr key={index}>
                <td>{claim.couponCode}</td>
                <td>${claim.value}</td>
                <td>{new Date(claim.claimedAt).toLocaleString()}</td>
                <td>{claim.ipAddress}</td>
                <td className="user-agent" title={claim.userAgent}>
                  {claim.userAgent.length > 30 
                    ? `${claim.userAgent.substring(0, 30)}...` 
                    : claim.userAgent}
                </td>
                <td>{claim.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminClaimHistory;
