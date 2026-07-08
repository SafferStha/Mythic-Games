import React from 'react';
import Navbar from '../components/Navbar';
import AdminNewsList from '../components/AdminNewsList';
import './ManageNews.css';

const ManageNews = () => {
  return (
    <div className="manage-news-page">
      <Navbar />
      <main className="container">
        <AdminNewsList />
      </main>
    </div>
  );
};

export default ManageNews;
