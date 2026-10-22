import { clearAllProfileMedia } from "./profileMediaStorage";

// Keys that do not belong to an account and must survive a sign-out.
const PROTECTED_KEYS = new Set(["auth_token", "trendySize_theme"]);
const USER_SCOPED_PREFIX = "trendySize_";
const EXTRA_USER_KEYS = new Set(["auth_user", "user"]);

function isUserScopedKey(key) {
  if (PROTECTED_KEYS.has(key)) {
    return false;
  }

  return key.startsWith(USER_SCOPED_PREFIX) || EXTRA_USER_KEYS.has(key);
}

/**
 * Remove everything cached about the signed-in account: profile fields,
 * products, measurement drafts/photos, subscription state and the IndexedDB
 * image blobs. This data was historically stored under browser-wide keys, so
 * without a wipe the next account on the same browser inherits the previous
 * user's name, phone number and photos.
 */
export async function clearUserScopedData({ includeToken = false } = {}) {
  try {
    if (includeToken) {
      localStorage.removeItem("auth_token");
    }

    const keys = [];

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key && isUserScopedKey(key)) {
        keys.push(key);
      }
    }

    keys.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("Could not clear cached account data:", error);
  }

  try {
    await clearAllProfileMedia();
  } catch (error) {
    console.error("Could not clear cached profile images:", error);
  }
}

/**
 * True when the browser is still holding another account's profile. Any cache
 * whose owner cannot be read is treated as foreign, because showing it would
 * risk displaying someone else's details.
 */
export function profileCacheBelongsToOtherUser(email) {
  if (!email) {
    return true;
  }

  const keys = ["trendySize_profile", "trendySize_user", "auth_user"];

  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) {
      continue;
    }

    try {
      const cached = JSON.parse(raw);
      const cachedEmail = cached?.email || cached?.Email;

      if (!cachedEmail) {
        return true;
      }

      return String(cachedEmail).toLowerCase() !== email.toLowerCase();
    } catch {
      return true;
    }
  }

  return false;
}
