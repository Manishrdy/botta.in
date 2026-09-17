import type { Metadata } from 'next';

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://botta.in').replace(/\/$/, '');
export const description = 'Manish Botta — software engineer building backend systems, production AI, and enterprise integrations. Based in San Francisco.';
export function pageMetadata(title: string, summary: string, path: string, image = '/og.png'): Metadata {
  return {
    title, description: summary, alternates: { canonical: `${siteUrl}${path}` },
    openGraph: { type: 'website', title: `${title} | Manish Botta`, description: summary, url: `${siteUrl}${path}`, siteName: 'Manish Botta', images: [{ url: `${siteUrl}${image}`, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: `${title} | Manish Botta`, description: summary, images: [`${siteUrl}${image}`] },
  };
}
export function jsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, '\\u003c'); }
