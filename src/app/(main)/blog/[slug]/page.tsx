import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 pt-32 pb-20">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft size={14} />
        Back to blog
      </Link>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-[10px] uppercase tracking-widest text-accent">
          {post.category}
        </span>
        <span className="text-[10px] text-foreground-muted">
          {formatDate(post.date)}
        </span>
      </div>

      <h1 className="font-serif text-4xl sm:text-5xl tracking-[-0.02em] leading-tight">
        {post.title}
      </h1>

      <div className="mt-12 prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:tracking-[-0.02em] prose-a:text-accent prose-a:no-underline hover:prose-a:text-foreground prose-strong:text-foreground prose-code:text-accent prose-code:bg-background-elevated prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:text-xs prose-pre:bg-background-elevated prose-pre:border prose-pre:border-border prose-table:text-sm prose-th:text-foreground-muted prose-th:font-normal prose-th:text-xs prose-th:uppercase prose-th:tracking-wider">
        <MDXRemote source={post.content} />
      </div>
    </article>
  );
}
