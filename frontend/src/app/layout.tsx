import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
const inter=localFont({src:'../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',variable:'--font-inter',display:'swap'});
const space=localFont({src:'../../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2',variable:'--font-space',display:'swap'});
const mono=localFont({src:'../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',variable:'--font-mono',display:'swap',preload:false});
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ThemeProvider } from '@/components/theme-provider';
import { siteUrl, description, jsonLd } from '@/lib/metadata';

export const metadata: Metadata = {
 metadataBase: new URL(siteUrl), title: { default: 'Manish Botta — Software & AI Engineer', template: '%s | Manish Botta' }, description,
 authors: [{ name: 'Manish Botta', url: siteUrl }], creator: 'Manish Botta', applicationName: 'Manish Botta',
 keywords: ['Manish Botta','Software engineer','AI engineer','Forward deployed engineer','Python','FastAPI','RAG'],
 alternates: { canonical: '/', types: { 'application/rss+xml': '/rss.xml' } },
 openGraph: { title: 'Manish Botta — Software & AI Engineer', description, url: siteUrl, siteName: 'Manish Botta', locale: 'en_US', type: 'website', images: [{ url: '/og.png', width:1200,height:630 }] },
 twitter: { card:'summary_large_image', title:'Manish Botta — Software & AI Engineer',description,images:['/og.png'] },
 icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' }, manifest: '/manifest.webmanifest',
};
export const viewport: Viewport = { width:'device-width',initialScale:1,themeColor:[{media:'(prefers-color-scheme: dark)',color:'#14181c'},{media:'(prefers-color-scheme: light)',color:'#f8fafb'}] };
export default function RootLayout({children}:{children:React.ReactNode}) {
 const analytics = process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT;
 return <html lang="en" className={`${inter.variable} ${space.variable} ${mono.variable}`} suppressHydrationWarning><body id="top"><ThemeProvider><a className="skip-link" href="#main">Skip to content</a><Header/><main id="main">{children}</main><Footer/></ThemeProvider><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({'@context':'https://schema.org','@type':'Person',name:'Manish Botta',url:siteUrl,jobTitle:'Software Engineer',sameAs:['https://github.com/Manishrdy','https://linkedin.com/in/manish-reddyb']})}}/>{analytics&&/^https:\/\//.test(analytics)&&<script defer data-domain={process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN||'botta.in'} src={analytics}/>}</body></html>;
}
