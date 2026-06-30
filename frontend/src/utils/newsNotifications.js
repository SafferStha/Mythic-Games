export const NEWS_SEEN_STORAGE_KEY = "mythic_news_last_seen_at";
export const NEWS_UPDATED_EVENT = "news-updated";

export function getNewsTimeValue(article) {
  const rawDate = article?.createdAt || article?.updatedAt;
  const time = rawDate ? new Date(rawDate).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function getLatestNewsTime(articles = []) {
  return articles.reduce(
    (latest, article) => Math.max(latest, getNewsTimeValue(article)),
    0,
  );
}

export function getLastSeenNewsTime() {
  const storedValue = window.localStorage.getItem(NEWS_SEEN_STORAGE_KEY);
  const time = storedValue ? new Date(storedValue).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function markNewsSeen(articles = [], notify = true) {
  const latestTime = getLatestNewsTime(articles);
  const seenTime = latestTime || Date.now();

  window.localStorage.setItem(
    NEWS_SEEN_STORAGE_KEY,
    new Date(seenTime).toISOString(),
  );

  if (notify) {
    window.dispatchEvent(new Event(NEWS_UPDATED_EVENT));
  }
}

export function countUnreadNews(articles = []) {
  const latestTime = getLatestNewsTime(articles);
  const lastSeenTime = getLastSeenNewsTime();

  if (!lastSeenTime) {
    if (latestTime) {
      window.localStorage.setItem(
        NEWS_SEEN_STORAGE_KEY,
        new Date(latestTime).toISOString(),
      );
    }
    return 0;
  }

  return articles.filter((article) => getNewsTimeValue(article) > lastSeenTime)
    .length;
}
