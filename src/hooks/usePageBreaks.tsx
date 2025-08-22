import { useEffect, useState, RefObject } from 'react';

interface PageBreakPosition {
  top: number;
  pageNumber: number;
}

export const usePageBreaks = (containerRef: RefObject<HTMLElement>) => {
  const [pageBreaks, setPageBreaks] = useState<PageBreakPosition[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const calculatePageBreaks = () => {
      const container = containerRef.current;
      if (!container) return;

      // A4 page height in mm (converted to pixels at 96 DPI)
      // 297mm = ~1123px at 96 DPI (297 * 96 / 25.4)
      const pageHeightPx = 1123;
      const containerHeight = container.scrollHeight;
      
      const breaks: PageBreakPosition[] = [];
      let currentPageBottom = pageHeightPx;
      let pageNumber = 1;

      // Calculate page breaks based on A4 height
      while (currentPageBottom < containerHeight) {
        breaks.push({
          top: currentPageBottom,
          pageNumber: pageNumber
        });
        currentPageBottom += pageHeightPx;
        pageNumber++;
      }

      setPageBreaks(breaks);
    };

    // Calculate initially
    calculatePageBreaks();

    // Recalculate when content changes
    const observer = new MutationObserver(calculatePageBreaks);
    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });

    // Recalculate on window resize
    const handleResize = () => setTimeout(calculatePageBreaks, 100);
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef]);

  return pageBreaks;
};