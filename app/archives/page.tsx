import Link from 'next/link';
import {
  Archive,
  ArrowRight,
  Building,
  FileText,
  Gavel,
  Landmark,
  Scale,
  ScrollText,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ARCHIVE_SECTIONS = [
  {
    title: 'Bills',
    description:
      'Track floor activity, sponsors, actions, and text versions for every piece of legislation introduced.',
    href: '/bills',
    icon: ScrollText,
    badge: 'Legislative',
  },
  {
    title: 'Laws',
    description:
      'Explore enacted laws with timelines, public law numbers, and full text access for every statute.',
    href: '/laws',
    icon: Gavel,
    badge: 'Enacted',
  },
  {
    title: 'Executive Orders',
    description:
      'Browse presidential directives with signing statements, agency ownership, and PDF archives.',
    href: '/executive-orders',
    icon: Landmark,
    badge: 'White House',
  },
  {
    title: 'Agency Rules',
    description:
      'Review agency regulations, notices, and rulemaking documents straight from the Federal Register.',
    href: '/agency-rules',
    icon: FileText,
    badge: 'Agencies',
  },
  {
    title: 'Supreme Court Cases',
    description:
      'Read the latest opinions, dissents, and vote breakdowns from the Supreme Court of the United States.',
    href: '/supreme-court-cases',
    icon: Scale,
    badge: 'Judiciary',
  },
  {
    title: 'Agencies',
    description:
      'Drill into agency profiles, parent organizations, and regulatory histories with linked documents.',
    href: '/agencies',
    icon: Building,
    badge: 'Directory',
  },
];

export default function ArchivesPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Badge variant="secondary" className="rounded-full bg-slate-900 text-white">
          Archives
        </Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Dive into every primary source
          </h1>
          <p className="max-w-2xl text-base text-slate-600">
            Explore the full archive of bills, laws, executive actions, and court cases. Each table
            is searchable, filterable, and linked back to the immersive feed for context.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="grid gap-6">
          {ARCHIVE_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.href} className="border border-slate-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-2xl">{section.title}</CardTitle>
                      <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
                        {section.badge}
                      </Badge>
                    </div>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Button asChild className="self-start gap-2">
                    <Link href={section.href}>
                      Open {section.title}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <p className="text-xs text-slate-500">
                    Includes advanced filters, saved item support, and AI-powered summaries where
                    available.
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <aside>
          <Card className="sticky top-24 border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Archive className="h-5 w-5 text-slate-500" aria-hidden="true" />
                <CardTitle className="text-xl">Quick links</CardTitle>
              </div>
              <CardDescription>
                Jump straight to the destinations power users rely on most often.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild variant="outline" className="justify-between">
                <Link href="/profile">
                  Saved items
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between">
                <Link href="/congressmen">
                  Members directory
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between">
                <Link href="/agencies">
                  Agencies directory
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="justify-between">
                <Link href="/feed">
                  Return to feed
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

