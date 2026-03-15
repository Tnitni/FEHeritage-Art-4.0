/**
 * Map API response (events/news) sang dạng UI dùng trong Events-News pages.
 * API events: id, title, thumbnail_url, content, duration, location, tag, start_date, end_date, status, faqs
 * API news: id, content, status, tag, thumbnail_url, created_date, images
 */

function formatApiDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/** Map một event từ API -> shape UI (imageUrl, description, date, tags, faq, ...) */
export function mapEventFromApi(raw) {
  if (!raw) return null;
  const tagStr = raw.tag || "";
  const tags = typeof tagStr === "string" ? tagStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const faqs = Array.isArray(raw.faqs) ? raw.faqs : [];
  const faq = faqs.map((f) => ({
    question: f.question ?? f.question_text ?? "",
    answer: f.answer ?? f.answer_text ?? "",
  })).filter((f) => f.question || f.answer);
  return {
    id: raw.id,
    title: raw.title ?? "",
    description: raw.content ?? "",
    content: raw.content ?? "",
    date: formatApiDate(raw.start_date) || formatApiDate(raw.end_date) || "",
    start_date: raw.start_date,
    end_date: raw.end_date,
    duration: raw.duration ?? "",
    location: raw.location ?? "",
    imageUrl: raw.thumbnail_url ?? null,
    thumbnail_url: raw.thumbnail_url,
    tags,
    tag: raw.tag,
    status: raw.status,
    faq,
    faqs: raw.faqs,
    shortIntro: raw.short_intro ?? raw.shortIntro,
    theme: raw.theme,
    timeline: raw.timeline,
    rules: raw.rules,
    requirements: raw.requirements,
    criteria: raw.criteria,
    judges: raw.judges,
    prizes: raw.prizes,
  };
}

/** Map một news từ API -> shape UI (title, description, date, imageUrl, ...) */
export function mapNewsFromApi(raw) {
  if (!raw) return null;
  const content = raw.content ?? "";
  const title = raw.title ?? (content.slice(0, 100) || "Tin tức");
  return {
    id: raw.id,
    title,
    description: content.slice(0, 200),
    content: raw.content ?? "",
    date: formatApiDate(raw.created_date) || "",
    created_date: raw.created_date,
    imageUrl: raw.thumbnail_url ?? (Array.isArray(raw.images) && raw.images[0] ? raw.images[0].url ?? raw.images[0] : null),
    thumbnail_url: raw.thumbnail_url,
    images: raw.images ?? [],
    tag: raw.tag,
    category: raw.tag || raw.category || "Nổi bật",
    status: raw.status,
  };
}
