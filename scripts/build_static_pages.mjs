import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve('dist');
const indexPath = path.join(distDir, 'index.html');
const siteUrl = 'https://videocalc.org';
const siteName = 'Video File Size Calculator';
const organizationName = 'Time Lapse Technologies LLC';

const routes = [
  {
    path: '/',
    output: 'index.html',
    title: 'Video File Size Calculator for Codecs, Bitrates, Audio and FFmpeg',
    description:
      'Free professional video file size calculator for ProRes, DNxHD, H.264, HEVC, RAW, broadcast, cinema, audio profiles, and supported FFmpeg commands.',
    keywords:
      'video file size calculator, video bitrate calculator, codec database, ProRes calculator, DNxHD calculator, FFmpeg command generator, video storage calculator, media workflow planning',
    schemaType: 'WebApplication',
  },
  {
    path: '/about',
    output: 'about/index.html',
    title: 'About the Free Video File Size Calculator',
    description:
      'Learn about the free, open-source video, audio, codec database, and FFmpeg planning tool built for media professionals.',
    keywords:
      'free video calculator, open source video tools, media workflow tool, codec bitrate reference, video production storage',
    schemaType: 'AboutPage',
  },
  {
    path: '/about-ffmpeg',
    output: 'about-ffmpeg/index.html',
    title: 'About FFmpeg Commands in the Video Calculator',
    description:
      'How the calculator generates FFmpeg command examples, validates supported outputs, and explains exact codec variants FFmpeg cannot author.',
    keywords:
      'FFmpeg commands, FFmpeg video bitrate, FFmpeg ProRes command, FFmpeg H.264 command, FFmpeg validation, video encoding command examples',
    schemaType: 'TechArticle',
  },
  {
    path: '/codec-data',
    output: 'codec-data/index.html',
    title: 'Searchable Video Codec Bitrate Database',
    description:
      'Browse a searchable codec bitrate database with professional, camera, broadcast, cinema, RAW, audio, resolution, frame-rate, and file-size planning data.',
    keywords:
      'codec database, video bitrate database, ProRes bitrate, DNxHD bitrate, RAW video bitrate, broadcast codec reference, camera codec data',
    schemaType: 'Dataset',
  },
  {
    path: '/privacy',
    output: 'privacy/index.html',
    title: 'Privacy Policy for Video File Size Calculator',
    description:
      'Privacy policy for the Video File Size Calculator, including local calculations, optional analytics consent, cookies, and GDPR rights.',
    keywords:
      'video calculator privacy, GDPR video calculator, cookie consent, local browser calculation',
    schemaType: 'WebPage',
  },
];

function canonicalUrl(routePath) {
  return `${siteUrl}${routePath === '/' ? '/' : routePath}`;
}

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

function routeStructuredData(route) {
  const organization = {
    '@type': 'Organization',
    name: organizationName,
    url: siteUrl,
    sameAs: [
      'https://mediasupplychain.org',
      'https://github.com/timelapsetech/videocalc-db',
    ],
  };
  const data = {
    '@context': 'https://schema.org',
    '@type': route.schemaType,
    name: route.title,
    url: canonicalUrl(route.path),
    description: route.description,
    publisher: organization,
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
      publisher: organization,
    },
    keywords: route.keywords,
  };

  if (route.schemaType === 'WebApplication') {
    data.applicationCategory = 'MultimediaApplication';
    data.operatingSystem = 'Any';
    data.offers = {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    };
    data.featureList = [
      'Video file size estimates',
      'Professional codec bitrate database',
      'Optional audio bitrate calculations',
      'Shareable calculator URLs',
      'Supported FFmpeg command examples',
    ];
  }

  if (route.schemaType === 'Dataset') {
    data.license = 'https://www.gnu.org/licenses/gpl-3.0.en.html';
    data.creator = organization;
    data.distribution = [
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
    ];
  }

  return JSON.stringify(data, null, 8);
}

function replaceMeta(html, route) {
  const url = canonicalUrl(route.path);
  const replacements = [
    [/<title>.*?<\/title>/s, `<title>${escapeAttribute(route.title)}</title>`],
    [/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`],
    [/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeAttribute(route.description)}" />`],
    [/<meta name="keywords" content="[^"]*" \/>/, `<meta name="keywords" content="${escapeAttribute(route.keywords)}" />`],
    [/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeAttribute(route.title)}" />`],
    [/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeAttribute(route.description)}" />`],
    [/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`],
    [/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeAttribute(route.title)}" />`],
    [/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeAttribute(route.description)}" />`],
    [
      /<script type="application\/ld\+json">.*?<\/script>/s,
      `<script type="application/ld+json">\n      ${routeStructuredData(route)}\n    </script>`,
    ],
  ];

  return replacements.reduce(
    (updatedHtml, [pattern, replacement]) => updatedHtml.replace(pattern, replacement),
    html
  );
}

async function writeRoute(route, baseHtml) {
  const outputPath = path.join(distDir, route.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, replaceMeta(baseHtml, route));
}

const baseHtml = await readFile(indexPath, 'utf8');

for (const route of routes) {
  await writeRoute(route, baseHtml);
}

await writeFile(path.join(distDir, '404.html'), replaceMeta(baseHtml, routes[0]));
