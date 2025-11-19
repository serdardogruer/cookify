import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Sayfa sırası (swipe ile geçiş) - Sadece ana menü sayfaları
const pageOrder = [
  '/dashboard',
  '/dashboard/pantry',
  '/dashboard/market',
  '/dashboard/recipe-search',
  '/dashboard/recipe-add',
];

export function useSwipeNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'swipe') {
        const currentIndex = pageOrder.indexOf(pathname);
        
        if (currentIndex === -1) return;

        if (event.data.direction === 'left') {
          // Sola swipe: Sonraki sayfa
          const nextIndex = currentIndex + 1;
          if (nextIndex < pageOrder.length) {
            router.push(pageOrder[nextIndex]);
          }
        } else if (event.data.direction === 'right') {
          // Sağa swipe: Önceki sayfa
          const prevIndex = currentIndex - 1;
          if (prevIndex >= 0) {
            router.push(pageOrder[prevIndex]);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [pathname, router]);
}
