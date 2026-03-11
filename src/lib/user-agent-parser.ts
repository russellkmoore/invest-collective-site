/**
 * Lightweight user-agent parser for storing pre-parsed UA columns in analytics_events.
 * Parses at write time so analytics queries can GROUP BY browser/device/os columns
 * instead of the raw user_agent string.
 */

export function parseUserAgent(userAgent: string): {
  browser: string;
  os: string;
  device: string;
} {
  if (!userAgent || userAgent === '') {
    return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' };
  }

  const ua = userAgent.toLowerCase();

  // --- browser ---
  let browser = 'Other';
  if (ua.includes('edg/') || ua.includes('edge/')) {
    browser = 'Edge';
  } else if (ua.includes('chrome/') || ua.includes('crios/')) {
    browser = 'Chrome';
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('firefox/') || ua.includes('fxios/')) {
    browser = 'Firefox';
  } else if (ua.includes('opera/') || ua.includes('opr/')) {
    browser = 'Opera';
  } else if (ua.includes('trident/') || ua.includes('msie ')) {
    browser = 'Internet Explorer';
  }

  // --- os ---
  let os = 'Other';
  if (ua.includes('windows nt')) {
    os = 'Windows';
  } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
    os = 'macOS';
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    os = 'iOS';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('chromeos') || ua.includes('cros ')) {
    os = 'ChromeOS';
  }

  // --- device ---
  let device = 'Desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent)) {
    device = 'Tablet';
  } else if (
    /mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(
      userAgent,
    )
  ) {
    device = 'Mobile';
  }

  return { browser, os, device };
}

// Re-export helpers that were previously in userAgentParser.ts so existing callers don't break
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode === 'XX' || countryCode.length !== 2) {
    return '🌐';
  }
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function getCountryName(countryCode: string): string {
  const countries: Record<string, string> = {
    US: 'United States',
    GB: 'United Kingdom',
    CA: 'Canada',
    AU: 'Australia',
    DE: 'Germany',
    FR: 'France',
    IT: 'Italy',
    ES: 'Spain',
    NL: 'Netherlands',
    SE: 'Sweden',
    NO: 'Norway',
    DK: 'Denmark',
    FI: 'Finland',
    BE: 'Belgium',
    AT: 'Austria',
    CH: 'Switzerland',
    IE: 'Ireland',
    PT: 'Portugal',
    GR: 'Greece',
    PL: 'Poland',
    CZ: 'Czech Republic',
    HU: 'Hungary',
    RO: 'Romania',
    BG: 'Bulgaria',
    HR: 'Croatia',
    SK: 'Slovakia',
    SI: 'Slovenia',
    EE: 'Estonia',
    LV: 'Latvia',
    LT: 'Lithuania',
    JP: 'Japan',
    CN: 'China',
    IN: 'India',
    KR: 'South Korea',
    SG: 'Singapore',
    HK: 'Hong Kong',
    TW: 'Taiwan',
    TH: 'Thailand',
    MY: 'Malaysia',
    ID: 'Indonesia',
    PH: 'Philippines',
    VN: 'Vietnam',
    NZ: 'New Zealand',
    BR: 'Brazil',
    MX: 'Mexico',
    AR: 'Argentina',
    CL: 'Chile',
    CO: 'Colombia',
    PE: 'Peru',
    VE: 'Venezuela',
    ZA: 'South Africa',
    NG: 'Nigeria',
    KE: 'Kenya',
    EG: 'Egypt',
    IL: 'Israel',
    TR: 'Turkey',
    SA: 'Saudi Arabia',
    AE: 'UAE',
    RU: 'Russia',
    UA: 'Ukraine',
    XX: 'Unknown',
  };
  return countries[countryCode] || countryCode;
}
