const cache = new Map();

export function getCache(key) {
  const item = cache.get(key);

  if (!item) {
    return null;
  }

  if (Date.now() > item.expires) {
    cache.delete(key);
    return null;
  }

  return item.data;
}

export function setCache(key, data, ttlMs) {
  cache.set(key, {
    data,
    expires: Date.now() + ttlMs,
  });
}