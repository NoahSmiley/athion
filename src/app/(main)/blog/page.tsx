import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

function fmt(d: string) { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }

export default function BlogPage() {
  const posts = getAllPosts();
  return (
    <>
      <h1>Blog</h1>
      <p className="muted">Engineering decisions, product updates, and the ideas behind what we build.</p>
      {posts.length === 0 ? <p className="muted">No posts yet.</p> : (
        <table className="blog-list">
          <tbody>{posts.map((p) => (
            <tr key={p.slug}>
              <td className="muted" style={{ whiteSpace: "nowrap", verticalAlign: "top" }}>{fmt(p.date)}</td>
              <td><Link href={`/blog/${p.slug}`}><b>{p.title}</b></Link>{p.excerpt && <> &ndash; <span className="muted">{p.excerpt}</span></>}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </>
  );
}
