import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ArticleFeedItem } from '@/types/types';
import { Button } from '@/components/ui/button';
import { FeaturedCard } from './FeaturedCard';
import { FeaturedHero } from './FeaturedHero';

interface FeaturedSectionProps {
  articles: ArticleFeedItem[];
}

export function FeaturedSection({ articles }: FeaturedSectionProps) {
  if (!articles.length) {
    return null;
  }

  const [hero, ...rest] = articles;

  return (
    <section className="space-y-12">
      <div className="grid gap-6 lg:grid-cols-3">
        <FeaturedHero article={hero} className="lg:col-span-2" />
        <div className="grid gap-6">
          {rest.slice(0, 2).map((article) => (
            <FeaturedCard key={article.id} article={article} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {rest.slice(2).map((article) => (
          <FeaturedCard key={article.id} article={article} />
        ))}
      </div>

      <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm md:flex-row md:text-left">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Ready for more?</h2>
          <p className="text-sm text-slate-600">
            Jump into the live feed to browse every piece of legislation side by side.
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/feed">
            Open feed
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
