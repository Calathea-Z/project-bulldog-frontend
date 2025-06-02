export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iP(ad|hone|od)/i.test(navigator.userAgent);
}
