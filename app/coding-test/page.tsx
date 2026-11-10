import type { Metadata } from 'next';
import { getSortedPostsDataByCategory } from '@/lib/posts';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { PsPostList } from '@/components/PostList';
import { createCodingTestPageMetadata } from '@/lib/metadata';
import { PostGraph } from '@/components/PostGraph';
import { getPostGraph } from '@/lib/postGraph';
import { layoutPostGraph } from '@/lib/postGraphLayout';

export const metadata: Metadata = createCodingTestPageMetadata();

export default async function CodingTestPage() {
  const graph = getPostGraph();

  return (
    <PsPostList
      initialPosts={getSortedPostsDataByCategory('PS')}
      profile={<ProfileSidebar />}
      graph={<PostGraph graph={graph} positions={layoutPostGraph(graph)} />}
    />
  );
}
