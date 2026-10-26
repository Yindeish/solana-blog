/** Shorten an address like 7xKX…9aBc. */
export function shortAddress(address?: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

/** Format a unix timestamp (seconds) into a readable date string. */
export function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Relative time, e.g. "3 days ago". */
export function timeAgo(unixSeconds: number): string {
  const now = Date.now();
  const then = unixSeconds * 1000;
  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 60) return "just now";
  if (min < 60) return `${min} min ago`;
  if (hr < 24) return `${hr} hr ago`;
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  return formatDate(unixSeconds);
}

/** Rough reading time from a body of text. */
export function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}
