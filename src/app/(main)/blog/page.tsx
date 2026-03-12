import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { BlogList } from "./blog-list";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <BlogList>
      <section className="relative min-h-[50vh] flex items-center">
        <div className="mx-auto max-w-7xl px-6 pt-32 pb-12">
          <p className="overline mb-4">Blog</p>
          <h1 className="font-[590] text-5xl sm:text-6xl tracking-[-0.022em] leading-tight max-w-3xl">
            Thinking out loud.
          </h1>
          <p className="mt-6 text-lg text-foreground-muted max-w-lg leading-relaxed">
            Engineering decisions, product updates, and the ideas behind what we build.
          </p>
        </div>
      </section>

      <section className="pb-32 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-0 border-t border-border">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="group py-10 border-b border-border">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] uppercase tracking-widest text-accent">
                          {post.category}
                        </span>
                        <span className="text-[10px] text-foreground-muted">
                          {formatDate(post.date)}
                        </span>
                      </div>
                      <h2 className="font-[590] text-2xl sm:text-3xl tracking-[-0.012em] group-hover:text-accent transition-colors">
                        {post.title}
                      </h2>
                      <p className="mt-3 text-foreground-muted leading-relaxed max-w-2xl">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="sm:pt-8 shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs text-foreground-muted group-hover:text-accent transition-colors">
                        Read <ArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </BlogList>
  );
}
