import type React from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://videocalc.org';
const SITE_NAME = 'Video File Size Calculator';
const ORGANIZATION_NAME = 'Time Lapse Technologies LLC';
const DEFAULT_KEYWORDS = [
  'video file size calculator',
  'video bitrate calculator',
  'codec database',
  'ProRes file size',
  'DNxHD file size',
  'FFmpeg command generator',
  'video storage calculator',
  'media workflow planning',
];

interface SeoRoute {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  schemaType: 'WebApplication' | 'AboutPage' | 'Dataset' | 'TechArticle' | 'PrivacyPolicy';
}

const SEO_ROUTES: SeoRoute[] = [
  {
    path: '/',
    title: 'Video File Size Calculator for Codecs, Bitrates, Audio and FFmpeg',
    description:
      'Free professional video file size calculator for ProRes, DNxHD, H.264, HEVC, RAW, broadcast, cinema, audio profiles, and supported FFmpeg commands.',
    keywords: [
      'video file size calculator',
      'video storage calculator',
      'video bitrate calculator',
      'ProRes calculator',
      'DNxHD calculator',
      'H.264 file size calculator',
      'HEVC file size calculator',
      'FFmpeg command generator',
    ],
    schemaType: 'WebApplication',
  },
  {
    path: '/about',
    title: 'About the Free Video File Size Calculator',
    description:
      'Learn about the free, open-source video, audio, codec database, and FFmpeg planning tool built for media professionals.',
    keywords: [
      'free video calculator',
      'open source video tools',
      'media workflow tool',
      'codec bitrate reference',
      'video production storage',
    ],
    schemaType: 'AboutPage',
  },
  {
    path: '/about-ffmpeg',
    title: 'About FFmpeg Commands in the Video Calculator',
    description:
      'How the calculator generates FFmpeg command examples, validates supported outputs, and explains exact codec variants FFmpeg cannot author.',
    keywords: [
      'FFmpeg commands',
      'FFmpeg video bitrate',
      'FFmpeg ProRes command',
      'FFmpeg H.264 command',
      'FFmpeg validation',
      'video encoding command examples',
    ],
    schemaType: 'TechArticle',
  },
  {
    path: '/codec-data',
    title: 'Searchable Video Codec Bitrate Database',
    description:
      'Browse a searchable codec bitrate database with professional, camera, broadcast, cinema, RAW, audio, resolution, frame-rate, and file-size planning data.',
    keywords: [
      'codec database',
      'video bitrate database',
      'ProRes bitrate',
      'DNxHD bitrate',
      'RAW video bitrate',
      'broadcast codec reference',
      'camera codec data',
    ],
    schemaType: 'Dataset',
  },
  {
    path: '/streaming-services',
    title: 'Streaming Service Video Delivery Specifications',
    description:
      'Partner contribution specs for delivering video and audio TO streaming platforms — SVOD, AVOD, TVOD, FAST ingest, and vertical micro-drama delivery including Amagi, Wurl, Frequency, ReelShort, DramaBox, Netflix, Prime Video, Roku, and 32 services with file size estimates.',
    keywords: [
      'streaming delivery specs',
      'SVOD vs AVOD specs',
      'Netflix delivery specifications',
      'Amazon Prime Video AVOD SVOD',
      'FAST HLS delivery specs',
      'streaming video submission',
    ],
    schemaType: 'Dataset',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy for Video File Size Calculator',
    description:
      'Privacy policy for the Video File Size Calculator, including local calculations, optional analytics consent, cookies, and GDPR rights.',
    keywords: [
      'video calculator privacy',
      'GDPR video calculator',
      'cookie consent',
      'local browser calculation',
    ],
    schemaType: 'PrivacyPolicy',
  },
];

function normalizePath(pathname: string): string {
  if (pathname === '/') {
    return pathname;
  }

  return pathname.replace(/\/$/, '');
}

function absoluteUrl(path: string): string {
  return `${SITE_URL}${path === '/' ? '/' : path}`;
}

function getSeoRoute(pathname: string): SeoRoute {
  const normalizedPath = normalizePath(pathname);
  return SEO_ROUTES.find(route => route.path === normalizedPath) ?? SEO_ROUTES[0];
}

function setMetaAttribute(attribute: 'name' | 'property', value: string, content: string): void {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${value}"]`);

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, value);
    document.head.appendChild(meta);
  }

  meta.setAttribute('content', content);
}

function setCanonical(url: string): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', url);
}

function setStructuredData(route: SeoRoute, url: string): void {
  const routeKeywords = [...new Set([...route.keywords, ...DEFAULT_KEYWORDS])];
  const organization = {
    '@type': 'Organization',
    name: ORGANIZATION_NAME,
    url: SITE_URL,
    sameAs: [
      'https://mediasupplychain.org',
      'https://github.com/timelapsetech/videocalc-db',
    ],
  };
  const website = {
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    publisher: organization,
  };
  const basePage = {
    '@type': route.schemaType === 'PrivacyPolicy' ? 'WebPage' : route.schemaType,
    name: route.title,
    description: route.description,
    url,
    isPartOf: website,
    publisher: organization,
    keywords: routeKeywords.join(', '),
  };
  const structuredData = [
    {
      '@context': 'https://schema.org',
      ...basePage,
      ...(route.schemaType === 'WebApplication'
        ? {
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            featureList: [
              'Video file size estimates',
              'Professional codec bitrate database',
              'Optional audio bitrate calculations',
              'Shareable calculator URLs',
              'Supported FFmpeg command examples',
            ],
          }
        : {}),
      ...(route.schemaType === 'Dataset'
        ? {
            license: 'https://www.gnu.org/licenses/gpl-3.0.en.html',
            creator: organization,
            distribution: [
              {
                '@type': 'DataDownload',
                name: 'Codec catalog JSON',
                encodingFormat: 'application/json',
                contentUrl: 'https://raw.githubusercontent.com/timelapsetech/videocalc-db/main/data/codecs.json',
              },
              {
                '@type': 'DataDownload',
                name: 'Audio configuration JSON',
                encodingFormat: 'application/json',
                contentUrl: 'https://raw.githubusercontent.com/timelapsetech/videocalc-db/main/data/audio-configurations.json',
              },
              {
                '@type': 'DataDownload',
                name: 'Default workflow presets JSON',
                encodingFormat: 'application/json',
                contentUrl: 'https://raw.githubusercontent.com/timelapsetech/videocalc-db/main/data/default-presets.json',
              },
            ],
          }
        : {}),
    },
  ];
  let script = document.getElementById('route-structured-data') as HTMLScriptElement | null;

  if (!script) {
    script = document.createElement('script');
    script.id = 'route-structured-data';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(structuredData);
}

const Seo: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const route = getSeoRoute(location.pathname);
    const canonicalUrl = absoluteUrl(route.path);
    const keywords = [...new Set([...route.keywords, ...DEFAULT_KEYWORDS])].join(', ');

    document.title = route.title;
    setCanonical(canonicalUrl);
    setMetaAttribute('name', 'description', route.description);
    setMetaAttribute('name', 'keywords', keywords);
    setMetaAttribute('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaAttribute('name', 'googlebot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaAttribute('name', 'author', ORGANIZATION_NAME);
    setMetaAttribute('name', 'application-name', SITE_NAME);
    setMetaAttribute('property', 'og:title', route.title);
    setMetaAttribute('property', 'og:description', route.description);
    setMetaAttribute('property', 'og:type', 'website');
    setMetaAttribute('property', 'og:url', canonicalUrl);
    setMetaAttribute('property', 'og:site_name', SITE_NAME);
    setMetaAttribute('property', 'og:locale', 'en_US');
    setMetaAttribute('name', 'twitter:card', 'summary');
    setMetaAttribute('name', 'twitter:title', route.title);
    setMetaAttribute('name', 'twitter:description', route.description);
    setStructuredData(route, canonicalUrl);
  }, [location.pathname]);

  return null;
};

export default Seo;
