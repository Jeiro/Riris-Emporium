export function loginDestination(from: { pathname?: string; search?: string; hash?: string } | undefined, query: string) {
  const fallback = new URLSearchParams(query).get('redirect');
  const path = from?.pathname || (fallback === 'checkout' ? '/checkout' : fallback) || '/';
  // Only same-origin paths; reject protocol-relative and backslash redirects.
  if (!path.startsWith('/') || path.startsWith('//') || /[\\\r\n]/.test(path)) return '/';
  return path + (from?.search?.startsWith('?') ? from.search : '') + (from?.hash?.startsWith('#') ? from.hash : '');
}
