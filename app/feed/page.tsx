import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { getArticleFeed } from '@/services/articles';
import { MediaFeedClient } from '@/components/feed/MediaFeedClient';
import LoadingIndicator from '@/components/ui/LoadingIndicator';

interface FeedPageProps {
  searchParams?: {
    focus?: string;
  };
}

async function FeedContent({ focus }: { focus?: string }) {
  const supabase = await createClient();
  const { items } = await getArticleFeed(supabase, { limit: 24 });
  return <MediaFeedClient articles={items} initialFocus={focus} />;
}

export default function FeedPage({ searchParams }: FeedPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white/60">
          <LoadingIndicator size="large" />
        </div>
      }
    >
      {/* @ts-expect-error Async Server Component */}
      <FeedContent focus={searchParams?.focus} />
    </Suspense>
  );
}

