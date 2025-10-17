import { SupabaseClient } from '@supabase/supabase-js';
import { ArticleFeedItem, ArticlePrimaryItemType } from '@/types/types';

type AnySupabaseClient = SupabaseClient<any>;

const DEFAULT_LIMIT = 24;
const DEFAULT_FEATURED_LIMIT = 6;

const ARTICLE_FIELDS = `
  id,
  title,
  dek,
  summary,
  excerpt,
  body_markdown,
  published_at,
  created_at,
  reading_time,
  author,
  primary_item_type,
  primary_item_id,
  is_featured
`;

const TYPE_LABEL_MAP: Record<ArticlePrimaryItemType, string> = {
  bill: 'Bill',
  law: 'Public Law',
  agency_document: 'Agency Rule',
  executive_order: 'Executive Order',
  cluster: 'Court Case',
};

const normalizeDate = (value?: string | null) => {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
};

const resolveArticleSourcePath = (type: ArticlePrimaryItemType, id: string) => {
  switch (type) {
    case 'bill':
      return `/bills/${id}`;
    case 'law':
      return `/laws/${id}`;
    case 'executive_order':
      return `/executive-orders/${id}`;
    case 'agency_document':
      return `/agency-rules/${id}`;
    case 'cluster':
      return `/supreme-court-cases/${id}`;
    default:
      return '/feed';
  }
};

const mapArticleRecord = (record: any): ArticleFeedItem => {
  const id = String(record.id);
  const primaryItemType = record.primary_item_type as ArticlePrimaryItemType;
  const primaryItemId = String(record.primary_item_id);
  const typeLabel = TYPE_LABEL_MAP[primaryItemType] ?? 'Legislation';
  const publishedAt = normalizeDate(record.published_at || record.created_at);

  const tags = [
    typeLabel,
    record.reading_time ? `${record.reading_time} min read` : null,
    record.author,
  ].filter(Boolean) as string[];

  return {
    id,
    title: record.title,
    dek: record.dek,
    summary: record.summary,
    excerpt: record.excerpt,
    bodyMarkdown: record.body_markdown,
    publishedAt,
    author: record.author,
    readingTime: record.reading_time ?? null,
    typeLabel,
    tags,
    sourcePath: resolveArticleSourcePath(primaryItemType, primaryItemId),
    primaryItemType,
    primaryItemId,
  };
};

interface FetchOptions {
  limit?: number;
  before?: string;
  featuredOnly?: boolean;
  withCursor?: boolean;
}

async function fetchArticleRows(
  client: AnySupabaseClient,
  options: FetchOptions = {},
) {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const effectiveLimit = options.withCursor ? limit + 1 : limit;

  let query = client
    .from('article')
    .select(ARTICLE_FIELDS)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false, nullsLast: true });

  if (options.featuredOnly) {
    query = query
      .eq('is_featured', true)
      .order('featured_until', { ascending: false, nullsLast: true })
      .order('published_at', { ascending: false, nullsLast: true });
  }

  if (options.before) {
    query = query.lt('published_at', options.before);
  }

  query = query.limit(effectiveLimit);

  const { data, error } = await query;
  if (error) throw error;

  return data ?? [];
}

export const getArticleFeed = async (
  client: AnySupabaseClient,
  options: { limit?: number; before?: string } = {},
) => {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const rows = await fetchArticleRows(client, {
    ...options,
    limit,
    withCursor: true,
  });

  const hasMore = rows.length > limit;
  const sliced = rows.slice(0, limit);
  const items = sliced.map(mapArticleRecord);
  const nextCursor =
    hasMore && items.length > 0
      ? items[items.length - 1]?.publishedAt ?? null
      : null;

  return { items, hasMore, nextCursor };
};

export const getFeaturedArticles = async (
  client: AnySupabaseClient,
  options: { limit?: number } = {},
) => {
  const limit = options.limit ?? DEFAULT_FEATURED_LIMIT;
  const featuredRows = await fetchArticleRows(client, {
    limit,
    featuredOnly: true,
  });

  const collected = [...featuredRows];

  if (collected.length < limit) {
    const additionalRows = await fetchArticleRows(client, {
      limit: limit * 2,
      featuredOnly: false,
    });
    const seen = new Set(collected.map((row) => row.id));
    additionalRows.forEach((row) => {
      if (!seen.has(row.id) && collected.length < limit) {
        collected.push(row);
        seen.add(row.id);
      }
    });
  }

  return collected.slice(0, limit).map(mapArticleRecord);
};
