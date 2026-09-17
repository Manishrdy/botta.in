'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X, Sun, Moon, ArrowUpRight } from 'lucide-react';

const navigation = [{ href: '/', label: 'Home' }, { href: '/about/', label: 'About' }, { href: '/projects/', label: 'Projects' }, { href: '/posts/', label: 'Writing' }, { href: '/activity/', label: 'Activity' }];
export function Header() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const update = () => setScrolled(window.scrollY > 8); update(); window.addEventListener('scroll', update, { passive: true }); return () => window.removeEventListener('scroll', update); }, []);
  const active = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href.replace(/\/$/, ''));
  const links = navigation.map(({ href, label }) => <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link>);
  return <header className={`site-header ${scrolled ? 'scrolled' : ''}`}><div className="header-inner">
    <Link href="/" className="wordmark" aria-label="Manish Botta home">mb<span>.</span></Link>
    <nav aria-label="Main navigation" className="desktop-nav">{links}</nav>
    <div className="header-actions"><button className="icon-button theme-toggle" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} aria-label="Toggle light and dark theme"><Sun className="sun" size={18} /><Moon className="moon" size={18} /></button>
      <Link className="header-resume" href="/resume/">Resume <ArrowUpRight size={15} /></Link>
      <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Trigger asChild><button className="icon-button mobile-menu" aria-label="Open navigation"><Menu size={22} /></button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="menu-overlay" /><Dialog.Content className="menu-sheet" aria-describedby={undefined}><div className="menu-heading"><Dialog.Title>Explore</Dialog.Title><Dialog.Close asChild><button className="icon-button" aria-label="Close navigation"><X /></button></Dialog.Close></div><nav aria-label="Mobile navigation">{links}<Link href="/resume/" onClick={() => setOpen(false)}>Resume</Link><Link href="/contact/" onClick={() => setOpen(false)}>Contact</Link></nav><p>Manish Botta<br /><span>Software engineer, San Francisco</span></p></Dialog.Content></Dialog.Portal></Dialog.Root>
    </div>
  </div></header>;
}
