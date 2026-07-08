export const newsStorageKey = 'mythic_news_v1';

export const defaultNewsArticles = [
  {
    id: 1,
    dateLabel: '10H AGO',
    title: 'Welcome to Mythic Games',
    excerpt: 'Discover new adventures, curated collections, and weekly deals.',
    image: '/src/assets/hero.png',
  },
  {
    id: 2,
    dateLabel: '2D AGO',
    title: 'Red Dead Sale',
    excerpt: 'Red Dead is on sale this weekend — saddle up and save big.',
    image: '/src/assets/RedDead.png',
  },
  {
    id: 3,
    dateLabel: '1W AGO',
    title: 'New Update Available',
    excerpt: 'Patch 1.2 brings performance improvements and fixes.',
    image: '/src/assets/GOW.png',
  },
];

export const createNewsId = (current = []) => {
  if (!Array.isArray(current) || !current.length) return 1;
  const max = current.reduce((m, it) => (typeof it.id === 'number' && it.id > m ? it.id : m), 0);
  return max + 1;
};

export default {
  newsStorageKey,
  defaultNewsArticles,
  createNewsId,
};
