const PRODUCTION_HOSTS = new Set(['levemente.ia.br', 'www.levemente.ia.br']);

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

export function shouldIndexHost(host: string | null | undefined): boolean {
  if (!host) return false;

  const hostname = host.split(':')[0].toLowerCase();

  if (PRODUCTION_HOSTS.has(hostname)) return true;
  if (LOCAL_HOSTS.has(hostname)) return true;

  return false;
}
