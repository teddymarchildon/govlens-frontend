import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { getFeaturedArticles } from '@/services/articles';
import { FeaturedLandingClient } from '@/components/media/FeaturedLandingClient';
import LoadingIndicator from '@/components/ui/LoadingIndicator';

async function FeaturedLanding() {
  const supabase = await createClient();
  try {
    const articles = await getFeaturedArticles(supabase, { limit: 9 });
    return <FeaturedLandingClient articles={articles} />;
  } catch (error) {
    console.error('Error loading featured articles', error);
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
        <h2 className="text-lg font-semibold text-red-800">We hit a snag.</h2>
        <p className="mt-2 text-sm text-red-600">
          Featured legislation is unavailable right now. Please refresh to try again.
        </p>
      </div>
    );
  }
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 py-6">
      <header className="space-y-4">
        <p className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Live coverage · Updated daily
        </p>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            What&apos;s moving in Washington right now
          </h1>
          <p className="max-w-2xl text-base text-slate-600 md:text-lg">
            Explore the bills, laws, executive actions, and court cases shaping U.S. policy.
            Jump into the feed for a continuous reading experience or dive into the full text of
            any legislation.
          </p>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="flex h-60 items-center justify-center rounded-2xl border border-slate-200 bg-white/60">
            <LoadingIndicator size="large" />
          </div>
        }
      >
        {/* @ts-expect-error Async Server Component */}
        <FeaturedLanding />
      </Suspense>
    </div>
  );
}
