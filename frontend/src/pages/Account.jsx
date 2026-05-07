import React from 'react';
import Navbar from '../components/Navbar';

const Account = () => {
  return (
    <div className="account-page">
      <Navbar />
      <div style={{ padding: '40px', color: 'var(--text-primary)' }}>
        <h1>Account</h1>
        <p>Coming soon...</p>
      </div>
    </div>
  );
};

export default Account;