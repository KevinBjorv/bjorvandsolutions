const DEFAULT_TARGET = 'https://www.skool.com/smart-indie-6927/about?ref=6e183e0cb40b468289dc9bf659028fe2';
const DEFAULT_SOURCE = 'website';

const SOURCE_ALIASES = new Map([
  ['youtube', 'youtube-video'],
  ['youtube-video', 'youtube-video'],
  ['youtubevideo', 'youtube-video'],
  ['yt-video', 'youtube-video'],
  ['ytvideo', 'youtube-video'],
  ['email', 'email'],
  ['bio', 'youtube-profile'],
  ['website', 'website'],
  ['youtube-profile', 'youtube-profile'],
  ['youtubeprofile', 'youtube-profile'],
  ['yt-profile', 'youtube-profile'],
  ['ytprofile', 'youtube-profile']
]);

const SOURCE_PATHS = new Map([
  ['/youtube', 'youtube-video'],
  ['/bio', 'youtube-profile'],
  ['/website', 'website'],
  ['/email', 'email']
]);

export default {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', {
        status: 405,
        headers: {
          Allow: 'GET, HEAD'
        }
      });
    }

    const url = new URL(request.url);
    const pathname = stripTrailingSlash(url.pathname);

    if (pathname === '/health') {
      return new Response('ok', { status: 200 });
    }

    const source = resolveSource(url, pathname);
    const target = env.SKOOL_TARGET || DEFAULT_TARGET;

    trackClick(request, env, {
      source,
      target,
      path: url.pathname,
      host: url.host
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: target,
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }
};

function stripTrailingSlash(pathname) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function resolveSource(url, pathname) {
  const pathSource = SOURCE_PATHS.get(pathname);
  if (pathSource) {
    return pathSource;
  }

  let rawSource = '';

  if (pathname.startsWith('/s/')) {
    try {
      rawSource = decodeURIComponent(pathname.slice(3));
    } catch (error) {
      rawSource = '';
    }
  }

  if (!rawSource) {
    rawSource = url.searchParams.get('source') || url.searchParams.get('src') || '';
  }

  const normalized = rawSource.trim().toLowerCase().replace(/[_\s]+/g, '-');
  return SOURCE_ALIASES.get(normalized) || DEFAULT_SOURCE;
}

function trackClick(request, env, event) {
  if (!env.CLICKS || typeof env.CLICKS.writeDataPoint !== 'function') {
    return;
  }

  const cf = request.cf || {};
  const referrer = request.headers.get('referer') || '';
  const referrerHost = safeHost(referrer);
  const userAgent = (request.headers.get('user-agent') || '').slice(0, 256);
  const rayId = request.headers.get('cf-ray') || 'unknown';

  try {
    env.CLICKS.writeDataPoint({
      blobs: [
        event.source,
        event.target,
        event.path,
        event.host,
        cf.country || 'unknown',
        cf.colo || 'unknown',
        referrerHost,
        userAgent
      ],
      doubles: [1],
      indexes: [rayId]
    });
  } catch (error) {
    console.error('Failed to write click event', error);
  }
}

function safeHost(rawUrl) {
  if (!rawUrl) {
    return 'none';
  }

  try {
    return new URL(rawUrl).host;
  } catch (error) {
    return 'invalid';
  }
}
