export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

export function getArticleCount(): number {
  const count = getCookie('articleCount');
  return count ? parseInt(count, 10) : 0;
}

export function incrementArticleCount() {
  const currentCount = getArticleCount();
  setCookie('articleCount', (currentCount + 1).toString(), 1); // Reset after 1 day
  return currentCount + 1;
}

export function getLastModalShow(): string | null {
  return getCookie('lastModalShow');
}

export function setLastModalShow() {
  const today = new Date().toISOString().split('T')[0];
  setCookie('lastModalShow', today, 30); // Store for 30 days
}