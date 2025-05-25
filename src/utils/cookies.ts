export function getArticleCount(): number {
  const count = window?.localStorage.getItem("articleCount");
  return count ? parseInt(count, 10) : 0;
}

export function incrementArticleCount() {
  const currentCount = getArticleCount();
  window?.localStorage.setItem("articleCount", String(currentCount + 1));
  return currentCount + 1;
}

export function getLastModalShow(): string | null {
  return window?.localStorage.getItem("lastModalShow");
}

export function setLastModalShow() {
  const today = new Date().toISOString().split("T")[0];
  window?.localStorage.setItem("lastModalShow", today);
}
