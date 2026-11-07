import type { Metadata } from 'next';
import { getSortedPostsDataByCategory } from '@/lib/posts';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { PsPostList } from '@/components/PostList';
import { createCodingTestPageMetadata } from '@/lib/metadata';
import { PostGraph } from '@/components/PostGraph';
import { getPostGraph } from '@/lib/postGraph';
import { layoutPostGraph } from '@/lib/postGraphLayout';

export function generateMetadata(): Metadata {
  return createCodingTestPageMetadata();
}

export default function CodingTestPage() {
  const graph = getPostGraph();

  return (
    <PsPostList
      initialPosts={getSortedPostsDataByCategory('PS')}
      profile={<ProfileSidebar />}
      graph={<PostGraph graph={graph} positions={layoutPostGraph(graph)} />}
    />
  );
}
