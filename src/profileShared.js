import { useEffect, useRef } from "react";

import { getProfile, getVendorProjects } from "./services/api";
import {
  dataUrlToBlob,
  getStoredProducts,
  hydrateProductImages,
  loadProfileMedia,
  readBlobAsDataUrl,
  saveProfileMedia,
} from "./profileMediaStorage";

export const PROFILE_STORAGE_KEY = "trendySize_profile";
export const PRODUCTS_STORAGE_KEY = "trendySize_products";
export const MEASUREMENT_LINK_KEY = "trendySize_active_measurement_link";

export const PROFILE_IMAGE_FIELDS = ["profileImage", "coverImage"];
export const MAX_PROFILE_IMAGE_SIZE = 20 * 1024 * 1024;

export const DEFAULT_PROFILE = {
  businessName: "",
  username: "",
  tagline: "",
  description: "",
  city: "",
  region: "",
  specialization: "",
  specialtyLine: "",
  craftTags: [],
  whatsappName: "",
  whatsappNumber: "",
  phone: "",
  email: "",
  portfolioUrl: "",
  profileImage: "",
  coverImage: "",
  outfitsMade: "",
  yearsExperience: "",
};

export const CRAFT_TAG_SUGGESTIONS = [
  "Senator",
  "Agbada",
  "Two-Piece",
  "Bridal",
  "Native",
  "Corporate",
  "Kids",
];

// Derive a usable wa.me link from a stored number. Local-format numbers
// (leading 0) are normalised so the link doesn't break (guide §6.1).
export function deriveWhatsAppLink(number) {
  const digits = (number || "").replace(/\D/g, "").replace(/^0+/, "");
  return digits ? `https://wa.me/${digits}` : "#";
}

// Build the single display line shown under the business name on the profile:
// "<City, Region> · <Specialization>". Falls back to any legacy specialtyLine.
export function deriveSpecialtyLine(profile) {
  const location = [profile.city, profile.region]
    .map((part) => (part || "").trim())
    .filter(Boolean)
    .join(", ");
  const specialization = (profile.specialization || "").trim();

  const line = [location, specialization].filter(Boolean).join(" · ");
  return line || (profile.specialtyLine || "").trim();
}

// Location only (city, region) — shown directly under the business name.
export function deriveLocationLine(profile) {
  return [profile.city, profile.region]
    .map((part) => (part || "").trim())
    .filter(Boolean)
    .join(", ");
}

// Display helpers for customer records (shared by the link modal + pages).
export function customerDisplayName(customer) {
  return (
    customer?.name ||
    customer?.full_name ||
    customer?.fullName ||
    [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") ||
    "Unnamed Customer"
  );
}

export function customerDisplayPhone(customer) {
  return (
    customer?.phone ||
    customer?.phone_number ||
    customer?.phoneNumber ||
    customer?.contact ||
    "Not set"
  );
}

// Fill in defaults and migrate any legacy single "Specialty & City" value into
// the separate city / specialization fields so older saves still display.
export function normaliseProfile(raw) {
  const merged = { ...DEFAULT_PROFILE, ...(raw || {}) };

  if (!merged.city && !merged.specialization && merged.specialtyLine) {
    const [head, ...rest] = merged.specialtyLine.split("·");
    merged.city = (head || "").trim();
    merged.specialization = rest.join("·").trim();
  }

  return merged;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "label[tabindex]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

// Shared overlay behavior: Escape-to-close, body scroll lock, and a
// basic focus trap so keyboard users can't tab behind the overlay.
export function useOverlay(isOpen, onClose) {
  const containerRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const previouslyFocused = document.activeElement;
    const container = containerRef.current;

    const focusFirst = () => {
      if (!container) return;
      const focusable = container.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        container.focus();
      }
    };

    const frame = window.requestAnimationFrame(focusFirst);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab" || !container) return;

      const focusable = Array.from(
        container.querySelectorAll(FOCUSABLE_SELECTOR)
      ).filter(
        (element) =>
          element.offsetParent !== null || element === document.activeElement
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  return containerRef;
}

// Load the vendor profile (local cache + backend identity fields + media)
// and the featured-work products. Shared by the Profile and Settings pages.
export async function loadVendorData() {
  let updatedProfile = DEFAULT_PROFILE;
  let remoteLoaded = false;

  const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (savedProfile) {
    try {
      updatedProfile = normaliseProfile(JSON.parse(savedProfile));
    } catch (error) {
      console.error("Could not load profile:", error);
    }
  }

  try {
    const remote = await getProfile();
    if (remote) {
      remoteLoaded = true;

      const fullName = [remote.firstName, remote.lastName]
        .filter(Boolean)
        .join(" ");

      // Cache from a different account is never used: the identity and
      // contact fields must describe the authenticated user only.
      const cachedEmail = String(updatedProfile.email || "").trim().toLowerCase();
      const remoteEmail = String(remote.email || "").trim().toLowerCase();
      if (!cachedEmail || cachedEmail !== remoteEmail) {
        updatedProfile = { ...DEFAULT_PROFILE };
      }

      updatedProfile = {
        ...updatedProfile,
        businessName: remote.businessName || fullName || "",
        username: remote.username || "",
        tagline: remote.tagline || "",
        description: remote.description || "",
        city: remote.city || "",
        region: remote.region || "",
        specialization: remote.specialization || "",
        whatsappName: remote.whatsappName || "",
        portfolioUrl: remote.portfolioUrl || "",
        craftTags: Array.isArray(remote.craftTags) ? remote.craftTags : [],
        outfitsMade:
          remote.outfitsMade != null ? String(remote.outfitsMade) : "",
        yearsExperience:
          remote.yearsExperience != null ? String(remote.yearsExperience) : "",
        whatsappNumber: remote.whatsappNumber || "",
        phone: remote.phoneNumber || "",
        email: remote.email || "",
        profileImage: remote.profileImageUrl || "",
        coverImage: remote.bannerImageUrl || "",
      };
    }
  } catch (error) {
    console.error("Could not load profile from API:", error);
  }

  try {
    let migrated = false;

    for (const field of PROFILE_IMAGE_FIELDS) {
      if (updatedProfile[field]?.startsWith("data:")) {
        await saveProfileMedia(field, dataUrlToBlob(updatedProfile[field]));
        migrated = true;
      }

      // A backend URL wins over any locally cached blob.
      if (
        (field === "profileImage" &&
          updatedProfile.profileImage &&
          !updatedProfile.profileImage.startsWith("blob:")) ||
        (field === "coverImage" &&
          updatedProfile.coverImage &&
          !updatedProfile.coverImage.startsWith("blob:"))
      ) {
        continue;
      }

      const storedImage = await loadProfileMedia(field);
      if (storedImage) {
        updatedProfile[field] = await readBlobAsDataUrl(storedImage);
      }
    }

    if (migrated) {
      const storedProfile = { ...updatedProfile };
      PROFILE_IMAGE_FIELDS.forEach((field) => {
        storedProfile[field] = "";
      });
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(storedProfile));
    }
  } catch (error) {
    console.error("Could not load profile images:", error);
  }

  let products = [];

  // Featured Work now lives on the backend (VendorProjects). Fetch it and map
  // to the UI's { id, name, image } shape; fall back to any legacy
  // localStorage copy if the request fails.
  try {
    const remoteProjects = await getVendorProjects();
    if (Array.isArray(remoteProjects)) {
      products = remoteProjects
        .map((project) => ({
          id: project.id ?? project.Id,
          name: project.name ?? project.Name ?? "",
          image: project.imageUrl ?? project.ImageUrl ?? "",
        }))
        .filter((project) => project.id && project.image);
    }
  } catch (error) {
    console.error("Could not load featured work from API:", error);
  }

  if (products.length === 0) {
    const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        if (!Array.isArray(parsedProducts)) {
          throw new Error("Saved products must be an array.");
        }
        const { products: loadedProducts, migrated } =
          await hydrateProductImages(parsedProducts);

        if (migrated) {
          localStorage.setItem(
            PRODUCTS_STORAGE_KEY,
            JSON.stringify(getStoredProducts(loadedProducts))
          );
        }

        products = loadedProducts;
      } catch (error) {
        console.error("Could not load products:", error);
      }
    }
  }

  // Refresh the cache with the account we just loaded. It carries the email
  // used to detect a different account signing in on this browser later.
  if (remoteLoaded) {
    persistProfile(updatedProfile);
  }

  return { profile: updatedProfile, products };
}

// Persist the local-only profile fields (images are stored as blobs).
export function persistProfile(profile) {
  const storedProfile = { ...profile };
  PROFILE_IMAGE_FIELDS.forEach((field) => {
    storedProfile[field] = "";
  });
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(storedProfile));
}
