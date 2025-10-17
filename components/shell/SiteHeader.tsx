'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  Menu,
  Search,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getLoginUrl } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SearchResults from '@/components/SearchResults';
import useSearch from '@/hooks/useSearch';

const NAV_LINKS = [
  { href: '/', label: 'Featured' },
  { href: '/feed', label: 'Feed' },
  { href: '/archives', label: 'Archives' },
];

const isActivePath = (pathname: string, href: string) => {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname.startsWith(href);
};

export function SiteHeader() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const {
    searchQuery,
    results,
    isLoading,
    showResults,
    handleSearchChange,
    clearSearch,
    closeResults,
  } = useSearch();

  useEffect(() => {
    setMobileOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            GovLens
          </Link>
          <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1 py-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  isActivePath(pathname, link.href)
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900',
                ].join(' ')}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="relative hidden w-full max-w-xs items-center gap-2 lg:flex">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search legislation, members, agencies..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full rounded-full bg-white pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 text-slate-400 hover:text-slate-600"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {showResults && (
            <div className="absolute left-0 top-full z-40 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <SearchResults
                results={results}
                isLoading={isLoading}
                onClose={closeResults}
                searchQuery={searchQuery}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="lg:hidden">
            <Link href="/feed">
              <Bookmark className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Feed</span>
            </Link>
          </Button>
          <div className="relative" ref={profileRef}>
            {!loading && user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100 lg:flex"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-expanded={profileMenuOpen}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {user.email?.slice(0, 2).toUpperCase()}
                  </span>
                  {user.email}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-label="Toggle profile menu"
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                </Button>
                {profileMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      Signed in as
                      <div className="truncate text-sm font-medium text-slate-900">
                        {user.email}
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full justify-start text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => signOut().catch(() => undefined)}
                    >
                      Sign out
                    </Button>
                  </div>
                )}
              </>
            ) : (
              !loading && (
                <Button asChild size="sm" className="rounded-full px-4 py-2 text-sm font-semibold">
                  <Link href={getLoginUrl(pathname)}>Sign in</Link>
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden">
          <div
            ref={mobileMenuRef}
            className="border-t border-slate-200 bg-white px-4 pb-6 pt-4 shadow-lg"
          >
            <nav className="grid gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    'rounded-lg px-3 py-2 text-sm font-medium',
                    isActivePath(pathname, link.href)
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1"
              />
            </div>
            {showResults && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-white shadow-inner">
                <SearchResults
                  results={results}
                  isLoading={isLoading}
                  onClose={closeResults}
                  searchQuery={searchQuery}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
