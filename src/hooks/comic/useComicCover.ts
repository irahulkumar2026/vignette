import { useState, useEffect, useRef } from 'react';

export function useComicCover(coverBlob?: Blob | null) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const currentBlobRef = useRef<Blob | null>(null);
  const currentUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!coverBlob) {
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = null;
      }
      currentBlobRef.current = null;
      setCoverUrl(null);
      return;
    }

    // Reuse existing Object URL if blob size & type are identical to prevent flicker during live query updates
    if (
      currentBlobRef.current &&
      currentBlobRef.current.size === coverBlob.size &&
      currentBlobRef.current.type === coverBlob.type &&
      currentUrlRef.current
    ) {
      return;
    }

    // Clean up old Object URL before creating new one
    if (currentUrlRef.current) {
      URL.revokeObjectURL(currentUrlRef.current);
    }

    const newUrl = URL.createObjectURL(coverBlob);
    currentBlobRef.current = coverBlob;
    currentUrlRef.current = newUrl;
    setCoverUrl(newUrl);
  }, [coverBlob]);

  // Clean up Object URL on component unmount
  useEffect(() => {
    return () => {
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = null;
      }
    };
  }, []);

  return coverUrl;
}
