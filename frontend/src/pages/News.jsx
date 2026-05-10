import React from 'react';
import Navbar from '../components/Navbar';
import NewsSection from '../components/NewsSection';
import '../pages/News.css';
import newsImage from '../assets/RedDead.png';

const News = () => {
  const sections = [
    {
      title: 'New Game release',
      items: [
        {
          id: 'release-1',
          image: newsImage,
          title: 'Mythic Legends: Dawn of the Fallen',
          description: 'A brand new immersive RPG experience with expanded world events, cinematic set pieces, and a fresh campaign to explore.',
          tag: 'Release',
        },
      ],
    },
    {
      title: 'Upcoming Games',
      items: [
        {
          id: 'upcoming-1',
          image: newsImage,
          title: 'Shadow Frontier: Night Raid',
          description: 'Pre-order now to unlock exclusive skins and in-game bonuses before the official launch this summer.',
          tag: 'Upcoming',
        },
      ],
    },
    {
      title: 'Sale and Offers',
      items: [
        {
          id: 'offer-1',
          image: newsImage,
          title: 'Summer Sale: 40% off fan favorites',
          description: 'Limited-time offers on select titles, plus bonus items for Mythic Club members during the sale window.',
          tag: 'Offer',
        },
      ],
    },
  ];

  return (
    <div className="news-page">
      <Navbar />
      <main className="news-content">
        <section className="news-header">
          <div className="news-header-group">
            <h1 className="section-label">Mythic Games News</h1>
          </div>
          <button className="primary-btn">Add news</button>
        </section>

        <div className="news-grid">
          {sections.map((section) => (
            <NewsSection key={section.title} title={section.title} items={section.items} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default News;
