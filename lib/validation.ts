export interface UrlValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  error?: string;
  errorCode?: 'INVALID_URL' | 'SSRF_BLOCKED';
}

// Check for private / internal IP ranges to prevent SSRF
function isPrivateIpOrHost(hostname: string): boolean {
  const host = hostname.toLowerCase();

  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return true;
  }

  // IPv4 regex check
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = host.match(ipv4Regex);
  if (match) {
    const octets = match.slice(1, 5).map(Number);
    if (octets.some((o) => o > 255)) return true;

    // 127.0.0.0/8 (loopback)
    if (octets[0] === 127) return true;
    // 10.0.0.0/8 (private)
    if (octets[0] === 10) return true;
    // 172.16.0.0/12 (private)
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
    // 192.168.0.0/16 (private)
    if (octets[0] === 192 && octets[1] === 168) return true;
    // 169.254.0.0/16 (link-local)
    if (octets[0] === 169 && octets[1] === 254) return true;
    // 0.0.0.0/8
    if (octets[0] === 0) return true;
  }

  return false;
}

export function validateProductUrl(urlInput: string): UrlValidationResult {
  if (!urlInput || typeof urlInput !== 'string') {
    return {
      isValid: false,
      error: 'Please enter a valid product URL.',
      errorCode: 'INVALID_URL',
    };
  }

  const trimmed = urlInput.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid product URL.',
      errorCode: 'INVALID_URL',
    };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      isValid: false,
      error: 'Only HTTP and HTTPS URLs are supported.',
      errorCode: 'INVALID_URL',
    };
  }

  if (isPrivateIpOrHost(parsed.hostname)) {
    return {
      isValid: false,
      error: 'Requests to local or private networks are blocked for security.',
      errorCode: 'SSRF_BLOCKED',
    };
  }

  return {
    isValid: true,
    sanitizedUrl: parsed.toString(),
  };
}

export function sanitizeText(text: string, maxLength: number = 2000): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>?/gm, '') // strip HTML tags
    .replace(/\s+/g, ' ') // collapse multiple whitespaces
    .trim()
    .slice(0, maxLength);
}
