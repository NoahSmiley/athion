import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() { return getAllPosts().map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

function fmt(d: string) { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <p><Link href="/blog">&larr; Back to blog</Link></p>
      <p className="muted" style={{ fontSize: 11 }}>{post.category} &middot; {fmt(post.date)}</p>
      <h1>{post.title}</h1>
      <div className="prose prose-sm max-w-none"><MDXRemote source={post.content} /></div>
    </>
  );
}
