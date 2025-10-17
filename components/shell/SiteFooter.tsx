import Link from 'next/link';
import { Mail, MessageCircle, Newspaper, Twitter } from 'lucide-react';

const FOOTER_LINKS = [
  {
    heading: 'Explore',
    links: [
      { href: '/', label: 'Featured' },
      { href: '/feed', label: 'Feed' },
      { href: '/archives', label: 'Archives' },
    ],
  },
  {
    heading: 'Legislation',
    links: [
      { href: '/bills', label: 'Bills' },
      { href: '/laws', label: 'Laws' },
      { href: '/executive-orders', label: 'Executive Orders' },
      { href: '/agency-rules', label: 'Agency Rules' },
    ],
  },
  {
    heading: 'Institutions',
    links: [
      { href: '/supreme-court-cases', label: 'Supreme Court Cases' },
      { href: '/judges', label: 'Judges' },
      { href: '/congressmen', label: 'Members of Congress' },
      { href: '/agencies', label: 'Agencies' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
              <Newspaper className="h-5 w-5" aria-hidden="true" />
            </div>
            GovLens
          </div>
          <p className="text-sm text-slate-600">
            Modern coverage of U.S. legislation, agency actions, and court decisions—built for
            policy analysts, journalists, and informed citizens.
          </p>
          <div className="flex gap-3">
            <Link
              href="mailto:hello@govlens.com"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:border-slate-900 hover:text-slate-900"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Email</span>
            </Link>
            <Link
              href="https://twitter.com"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:border-slate-900 hover:text-slate-900"
            >
              <Twitter className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link
              href="/contact"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:border-slate-900 hover:text-slate-900"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Contact</span>
            </Link>
          </div>
        </div>

        {FOOTER_LINKS.map((section) => (
          <div key={section.heading} className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {section.heading}
            </h3>
            <nav className="grid gap-2 text-sm text-slate-600">
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 bg-white py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-slate-500 md:flex-row lg:px-8">
          <span>© {new Date().getFullYear()} GovLens. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-900">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
