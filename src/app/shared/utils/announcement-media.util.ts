export type AnnouncementMediaType =
  | 'image'
  | 'youtube'
  | 'google-drive'
  | 'video'
  | 'none';

export function getAnnouncementMediaType(
  url?: string,
): AnnouncementMediaType {
  const mediaUrl = url?.trim();

  if (!mediaUrl) {
    return 'none';
  }

  if (isYoutubeUrl(mediaUrl)) {
    return 'youtube';
  }

  if (isGoogleDriveUrl(mediaUrl)) {
    return 'google-drive';
  }

  if (isDirectVideoUrl(mediaUrl)) {
    return 'video';
  }

  return 'image';
}

export function getBannerImageSrc(
  mediaUrl?: string,
): string | null {
  const url = mediaUrl?.trim();

  if (!url) {
    return null;
  }

  const type = getAnnouncementMediaType(url);

  if (type === 'image') {
    return url;
  }

  if (type === 'youtube') {
    const videoId = extractYoutubeVideoId(url);

    if (!videoId) {
      return null;
    }

    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  if (type === 'google-drive') {
    const fileId = extractGoogleDriveFileId(url);

    if (!fileId) {
      return null;
    }

    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
  }

  return null;
}

export function bannerHasVisual(mediaUrl?: string): boolean {
  return !!getBannerImageSrc(mediaUrl);
}

function isYoutubeUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    return (
      hostname === 'youtube.com' ||
      hostname === 'www.youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'youtu.be' ||
      hostname === 'www.youtu.be'
    );
  } catch {
    return false;
  }
}

function isGoogleDriveUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    return (
      hostname === 'drive.google.com' ||
      hostname.endsWith('.drive.google.com')
    );
  } catch {
    return false;
  }
}

function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
}

export function extractYoutubeVideoId(
  url: string,
): string | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (
      hostname === 'youtu.be' ||
      hostname === 'www.youtu.be'
    ) {
      return (
        parsedUrl.pathname.split('/').filter(Boolean)[0] ||
        null
      );
    }

    const queryVideoId = parsedUrl.searchParams.get('v');

    if (queryVideoId) {
      return queryVideoId;
    }

    const pathParts = parsedUrl.pathname
      .split('/')
      .filter(Boolean);

    const embedIndex = pathParts.indexOf('embed');

    if (embedIndex >= 0 && pathParts[embedIndex + 1]) {
      return pathParts[embedIndex + 1];
    }

    const shortsIndex = pathParts.indexOf('shorts');

    if (shortsIndex >= 0 && pathParts[shortsIndex + 1]) {
      return pathParts[shortsIndex + 1];
    }

    return null;
  } catch {
    return null;
  }
}

export function extractGoogleDriveFileId(
  url: string,
): string | null {
  try {
    const parsedUrl = new URL(url);

    const queryId = parsedUrl.searchParams.get('id');

    if (queryId) {
      return queryId;
    }

    const filePathMatch = parsedUrl.pathname.match(
      /\/file\/d\/([^/]+)/,
    );

    if (filePathMatch?.[1]) {
      return filePathMatch[1];
    }

    const genericPathMatch = parsedUrl.pathname.match(
      /\/d\/([^/]+)/,
    );

    return genericPathMatch?.[1] || null;
  } catch {
    return null;
  }
}
