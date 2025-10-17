'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowUpRight,
  CalendarDays,
  Clock,
  FileText,
  Gavel,
  Landmark,
  LucideIcon,
  Scale,
  ScrollText,
  User,
} from 'lucide-react';
import { ArticleFeedItem, ArticlePrimaryItemType } from '@/types/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TYPE_ICONS: Record<ArticlePrimaryItemType, LucideIcon> = {
  bill: ScrollText,
  law: Gavel,
  agency_document: FileText,
  executive_order: Landmark,
  cluster: Scale,
};

const PREVIEW_PARAGRAPHS = 3;

const formatDate = (value: string) => {
  try {
    return format(new Date(value), 'MMM d, yyyy');
  } catch {
    return '';
  }
};

const cleanMarkdown = (value: string) =>
  value
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[[^\]]+]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~\-]+/g, '')
    .replace(/\r/g, '');

interface ArticlePanelProps {
  article: ArticleFeedItem;
  isActive?: boolean;
}

export function ArticlePanel({ article, isActive = false }: ArticlePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = TYPE_ICONS[article.primaryItemType] ?? ScrollText;
  const dek = article.dek ?? article.summary ?? article.excerpt ?? '';

  const panelTags = useMemo(
    () => article.tags.filter((tag) => tag !== article.typeLabel),
    [article.tags, article.typeLabel],
  );

  const paragraphs = useMemo(() => {
    const source = article.bodyMarkdown ?? article.summary ?? article.excerpt ?? '';
    if (!source) return [];
    return cleanMarkdown(source)
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [article.bodyMarkdown, article.summary, article.excerpt]);

  const displayedParagraphs = expanded
    ? paragraphs
    : paragraphs.slice(0, PREVIEW_PARAGRAPHS);

  const hasMore = paragraphs.length > PREVIEW_PARAGRAPHS;

  return (
    <Card
      className={[
        'relative border border-slate-200 bg-white transition hover:border-slate-300',
        isActive ? 'ring-2 ring-indigo-500' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CardHeader className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            {article.typeLabel}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            {article.readingTime ? (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span>{article.readingTime} min read</span>
              </div>
            ) : null}
            {article.author ? (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" aria-hidden="true" />
                <span>{article.author}</span>
              </div>
            ) : null}
          </div>
        </div>

        <CardTitle className="text-2xl font-semibold leading-tight text-slate-900">
          {article.title}
        </CardTitle>

        {dek && <p className="text-base text-slate-600">{dek}</p>}

        <div className="flex flex-wrap items-center gap-2">
          {panelTags.slice(0, 4).map((tag) => (
            <Badge key={`${article.id}-${tag}`} variant="outline" className="border-slate-200 text-slate-600">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 py-6">
        {displayedParagraphs.length > 0 && (
          <div className="space-y-4">
            {displayedParagraphs.map((paragraph, index) => (
              <p key={`${article.id}-paragraph-${index}`} className="max-w-4xl text-base leading-relaxed text-slate-700">
                {paragraph}
              </p>
            ))}
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="px-0 text-slate-700 hover:text-slate-900"
                onClick={() => setExpanded((prev) => !prev)}
              >
                {expanded ? 'Show less' : 'Keep reading'}
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm" className="gap-2">
            <Link href={article.sourcePath}>
              See full legislation
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900"
          >
            <Link href={`/feed?focus=${encodeURIComponent(`article:${article.id}`)}`}>
              Open in feed
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
