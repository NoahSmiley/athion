import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
};

// Markdown files don't change between requests, so read+parse them once
// per server boot. Without this, every blog nav click re-reads every .mdx
// file from disk and runs gray-matter on it, making /blog visibly slower
// than /software etc.
let _all: BlogPost[] | null = null;
const _bySlug = new Map<string, BlogPost>();

export function getAllPosts(): BlogPost[] {
  if (_all) return _all;

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
    const { data, content } = matter(raw);

    return {
      slug,
      title: data.title,
      date: data.date,
      category: data.category,
      excerpt: data.excerpt,
      content,
    };
  });

  _all = posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  for (const p of _all) _bySlug.set(p.slug, p);
  return _all;
}

export function getPostBySlug(slug: string): BlogPost | null {
  // Warm the cache so individual post lookups stay O(1) on repeat hits.
  if (_all === null) getAllPosts();
  return _bySlug.get(slug) ?? null;
}
