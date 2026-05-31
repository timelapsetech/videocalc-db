export type SpecSourceType =
  | 'official'
  | 'partner-portal'
  | 'third-party-guide'
  | 'industry-article'
  | 'not-found';

export interface SpecSourceDefinition {
  id: SpecSourceType;
  shortLabel: string;
  linkLabel: string;
  description: string;
}

export const SPEC_SOURCE_TYPES: Record<SpecSourceType, SpecSourceDefinition> = {
  official: {
    id: 'official',
    shortLabel: 'Official docs',
    linkLabel: 'Official documentation',
    description: 'Published directly by the platform or its partner documentation site.',
  },
  'partner-portal': {
    id: 'partner-portal',
    shortLabel: 'Partner portal',
    linkLabel: 'Partner portal',
    description: 'Official partner or business page from the service — not a full technical specification.',
  },
  'third-party-guide': {
    id: 'third-party-guide',
    shortLabel: 'Third-party guide',
    linkLabel: 'Third-party guide',
    description: 'Workflow or technical guidance from an external vendor or publisher, not the platform itself.',
  },
  'industry-article': {
    id: 'industry-article',
    shortLabel: 'Industry article',
    linkLabel: 'Industry article',
    description: 'Third-party article or studio guide — useful context, not platform-issued documentation.',
  },
  'not-found': {
    id: 'not-found',
    shortLabel: 'Specs not found online',
    linkLabel: 'Specs not found online',
    description:
      'We could not find published delivery specifications for this platform online. Contact the platform directly for current ingest requirements.',
  },
};

const OFFICIAL_URL_PATTERNS: RegExp[] = [
  /partnerhelp\.netflixstudios\.com/i,
  /partnerhub\.warnermedia/i,
  /assets\.hulu\.com/i,
  /m\.media-amazon\.com/i,
  /videocentral\.amazon\.com/i,
  /help\.apple\.com/i,
  /help\.vimeo\.com/i,
  /developer\.samsung\.com/i,
  /developer\.roku\.com/i,
  /docs\.frequency\.com/i,
  /support\.wurl\.com/i,
  /catalogs-docs\.plex\.tv/i,
  /pbsdistribution\.org/i,
  /paramount\.com\/sites/i,
  /assets\.contentstack\.io/i,
  /nbcuniversal-creative-guidelines\.scrollhelp\.site/i,
  /code\.tubitv\.com/i,
  /support\.google\.com/i,
  /developers\.google\.com/i,
  /webostv\.developer\.lge\.com/i,
  /hubfs\/1809672\/XUMO/i,
  /XUMO-XumoHLSSpecification/i,
];

const THIRD_PARTY_GUIDE_PATTERNS: RegExp[] = [/moltencloud\.com/i, /aws\.amazon\.com\/blogs/i];

const INDUSTRY_ARTICLE_PATTERNS: RegExp[] = [/reelytics\.io/i, /sukudostudios\.com/i];

const PARTNER_PORTAL_PATTERNS: RegExp[] = [
  /filmhub\.com/i,
  /dramabox\.jp/i,
  /amagi\.com/i,
  /platformplus\.vizio\.com/i,
];

function normalizeHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function isSameServiceHomepage(specUrl: string, serviceWebsiteUrl?: string): boolean {
  if (!serviceWebsiteUrl) {
    return false;
  }

  const specHost = normalizeHost(specUrl);
  const siteHost = normalizeHost(serviceWebsiteUrl);
  if (!specHost || !siteHost) {
    return false;
  }

  if (specHost !== siteHost) {
    return false;
  }

  try {
    const specPath = new URL(specUrl).pathname.replace(/\/$/, '') || '/';
    return specPath === '/' || specPath.split('/').filter(Boolean).length <= 1;
  } catch {
    return false;
  }
}

export function resolveSpecSourceType(
  specUrl: string,
  options?: { serviceWebsiteUrl?: string; override?: SpecSourceType }
): SpecSourceType {
  if (options?.override) {
    return options.override;
  }

  if (OFFICIAL_URL_PATTERNS.some(pattern => pattern.test(specUrl))) {
    return 'official';
  }

  if (INDUSTRY_ARTICLE_PATTERNS.some(pattern => pattern.test(specUrl))) {
    return 'industry-article';
  }

  if (THIRD_PARTY_GUIDE_PATTERNS.some(pattern => pattern.test(specUrl))) {
    return 'third-party-guide';
  }

  if (PARTNER_PORTAL_PATTERNS.some(pattern => pattern.test(specUrl))) {
    return 'partner-portal';
  }

  if (isSameServiceHomepage(specUrl, options?.serviceWebsiteUrl)) {
    return 'not-found';
  }

  // Marketing pages without a dedicated spec path
  if (
    /sling\.com|crackle\.com|starz\.com|mgmplus\.com|localnow\.com|crunchyroll\.com/i.test(specUrl)
  ) {
    return 'not-found';
  }

  return 'third-party-guide';
}

export function getSpecSourceDefinition(type: SpecSourceType): SpecSourceDefinition {
  return SPEC_SOURCE_TYPES[type];
}

export function getSpecSourceLinkLabel(
  specUrl: string,
  options?: { short?: boolean; serviceWebsiteUrl?: string; override?: SpecSourceType }
): string {
  const type = resolveSpecSourceType(specUrl, options);
  const definition = getSpecSourceDefinition(type);
  return options?.short ? definition.shortLabel : definition.linkLabel;
}

export const SPECS_NOT_FOUND_ONLINE_MESSAGE =
  'We could not find published delivery specifications for this platform online. Contact the platform directly for current ingest requirements.';
