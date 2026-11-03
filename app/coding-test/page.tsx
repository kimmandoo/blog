import { connection } from 'next/server';
import type { Metadata } from 'next';
import { getSortedPostsDataByCategory } from '@/lib/posts';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { PsPostList } from '@/components/PostList';
import { createCodingTestPageMetadata } from '@/lib/metadata';
import { PostGraph } from '@/components/PostGraph';
import { getPostGraph } from '@/lib/postGraph';
import { layoutPostGraph } from '@/lib/postGraphLayout';

type CodingTestPageProps = {
  searchParams: Promise<{
    language?: string | string[];
    tag?: string | string[];
    q?: string | string[];
  }>;
};

export async function generateMetadata({ searchParams }: CodingTestPageProps): Promise<Metadata> {
  return createCodingTestPageMetadata(await searchParams);
}

export default async function CodingTestPage() {
  await connection();
  const graph = getPostGraph();

  return (
    <PsPostList
      initialPosts={getSortedPostsDataByCategory('PS')}
      profile={<ProfileSidebar />}
      graph={<PostGraph graph={graph} positions={layoutPostGraph(graph)} />}
    />
  );
}
