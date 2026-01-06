import { redirect } from 'next/navigation';

export async function generateStaticParams() {
  return [];
}

export default async function PSPost({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugString = slug.join('/');

  redirect(`/posts/${slugString}`);
}
