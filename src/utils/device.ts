export function isIOS(): boolean {
  if (typeof navigator === 'undefined') {
    console.log('📱 isIOS: navigator is undefined (probably SSR)');
    return false;
  }

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  const platform = navigator.platform;
  const maxTouchPoints = (navigator as any).maxTouchPoints || 0;

  const isIOSDevice = /iPad|iPhone|iPod/.test(ua);
  const isMacTouch = platform === 'MacIntel' && maxTouchPoints > 1;

  const isIOS = isIOSDevice || isMacTouch;

  return isIOS;
}
