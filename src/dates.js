// Reading a start date out of a human-written range, so content.js can keep
// writing dates the way a resume writes them — "Sep 2025 – May 2026", or
// "May – Aug 2025" where only the end carries a year — and the lists still sort
// themselves. Nothing in content.js has to be kept in chronological order by
// hand, which is the kind of thing that silently goes wrong after an edit.
const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

export function startOf(dates = "") {
  const parts = dates.split(/[–—-]/);
  const year = (parts.join(" ").match(/\b(19|20)\d{2}\b/g) || []).slice(-1)[0];
  const head = parts[0].toLowerCase();
  const own = head.match(/\b(19|20)\d{2}\b/);
  const m = MONTHS.findIndex((x) => head.includes(x));
  return Number(own ? own[0] : year || 0) * 12 + (m < 0 ? 0 : m);
}

// Whatever is still running comes first, newest start first within it, then the
// finished things the same way. Sorting on start date alone put a job that began
// in May and is still going underneath a team that began in September and ended.
const ongoing = (d = "") => (/present|current|now/i.test(d) ? 1 : 0);
export const byRecency = (a, b) =>
  ongoing(b.dates) - ongoing(a.dates) || startOf(b.dates) - startOf(a.dates);
