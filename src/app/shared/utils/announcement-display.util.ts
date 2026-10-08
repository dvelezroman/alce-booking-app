import { Announcement } from '../../services/dtos/announcement.dto';
import { StudentClassification } from '../../services/dtos/student.dto';
import { UserRole } from '../../services/dtos/user.dto';
import { bannerHasVisual } from './announcement-media.util';

export type AnnouncementSurface = 'modal' | 'banner';

export type AnnouncementViewerUser = {
  role?: UserRole;
  classification?: StudentClassification | null;
  city?: 'Portoviejo' | 'Cuenca' | null;
};

export function getAnnouncementDisplayMode(
  announcement: Announcement,
): 'modal' | 'banner' | 'both' {
  return announcement.displayMode ?? 'modal';
}

export function isAnnouncementForSurface(
  announcement: Announcement,
  surface: AnnouncementSurface,
): boolean {
  const mode = getAnnouncementDisplayMode(announcement);

  if (surface === 'modal') {
    return mode === 'modal' || mode === 'both';
  }

  return mode === 'banner' || mode === 'both';
}

export function filterAnnouncementsForUser(
  list: Announcement[],
  user: AnnouncementViewerUser,
): Announcement[] {
  const now = new Date();

  return list.filter((announcement) => {
    if (!announcement.isActive) {
      return false;
    }

    if (
      announcement.startDate &&
      new Date(announcement.startDate) > now
    ) {
      return false;
    }

    if (
      announcement.endDate &&
      new Date(announcement.endDate) < now
    ) {
      return false;
    }

    if (
      announcement.targetRole &&
      user?.role &&
      announcement.targetRole !== user.role
    ) {
      return false;
    }

    if (
      announcement.targetStudentType &&
      user?.classification &&
      announcement.targetStudentType !== user.classification
    ) {
      return false;
    }

    if (announcement.city && user?.city) {
      const userCity = user.city.toLowerCase();
      const targetCity = announcement.city.toLowerCase();

      if (userCity !== targetCity) {
        return false;
      }
    }

    if (announcement.showMode === 'once_user') {
      const sessionKey = `announcement_session_${announcement.id}`;

      if (sessionStorage.getItem(sessionKey)) {
        return false;
      }
    }

    return true;
  });
}

function modalSessionKey(announcementId: string): string {
  return `announcement_seen_${announcementId}`;
}

function bannerDismissSessionKey(announcementId: string): string {
  return `announcement_banner_dismiss_${announcementId}`;
}

function bannerDismissUserKey(
  user: AnnouncementViewerUser,
  announcementId: string,
): string {
  const userKey = user?.role ?? 'anon';
  return `announcement_banner_dismiss_${userKey}_${announcementId}`;
}

export function filterModalAnnouncementsByShowMode(
  list: Announcement[],
): Announcement[] {
  return list.filter((announcement) => {
    if (
      announcement.showMode === 'always' ||
      !announcement.showMode
    ) {
      return true;
    }

    if (announcement.showMode === 'once_session') {
      return !sessionStorage.getItem(modalSessionKey(announcement.id));
    }

    return true;
  });
}

export function filterBannerAnnouncementsByShowMode(
  list: Announcement[],
  user: AnnouncementViewerUser,
): Announcement[] {
  return list.filter((announcement) => {
    if (announcement.showMode === 'once_user') {
      return !localStorage.getItem(
        bannerDismissUserKey(user, announcement.id),
      );
    }

    if (
      announcement.showMode === 'once_session' ||
      announcement.showMode === 'always' ||
      !announcement.showMode
    ) {
      return !sessionStorage.getItem(
        bannerDismissSessionKey(announcement.id),
      );
    }

    return true;
  });
}

export function markModalAnnouncementSeen(
  announcement: Announcement,
): void {
  if (announcement.showMode === 'once_session') {
    sessionStorage.setItem(
      modalSessionKey(announcement.id),
      'true',
    );
  }
}

export function dismissBannerAnnouncement(
  announcement: Announcement,
  user: AnnouncementViewerUser,
): void {
  if (announcement.showMode === 'once_user') {
    localStorage.setItem(
      bannerDismissUserKey(user, announcement.id),
      'true',
    );
    return;
  }

  sessionStorage.setItem(
    bannerDismissSessionKey(announcement.id),
    'true',
  );
}

export function getVisibleModalAnnouncements(
  list: Announcement[],
  user: AnnouncementViewerUser,
): Announcement[] {
  return filterModalAnnouncementsByShowMode(
    filterAnnouncementsForUser(list, user).filter((a) =>
      isAnnouncementForSurface(a, 'modal'),
    ),
  );
}

export function getVisibleBannerAnnouncements(
  list: Announcement[],
  user: AnnouncementViewerUser,
): Announcement[] {
  return filterBannerAnnouncementsByShowMode(
    filterAnnouncementsForUser(list, user).filter((a) =>
      isAnnouncementForSurface(a, 'banner'),
    ),
    user,
  );
}

export function getBannerDisplayText(
  announcement: Announcement,
): string {
  const message = announcement.message?.trim();
  if (message) {
    return message;
  }

  if (bannerHasVisual(announcement.mediaUrl)) {
    return '';
  }

  return announcement.title?.trim() ?? '';
}
