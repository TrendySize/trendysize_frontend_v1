export const MEASURE_TOKEN_KEY = "trendySize_measure_token";
export const MEASURE_VENDOR_KEY = "trendySize_measure_vendor";
export const CUSTOMER_DETAILS_KEY = "trendySize_customer_details";
export const FRONT_PHOTO_KEY = "trendySize_front_photo";
export const SIDE_PHOTO_KEY = "trendySize_side_photo";

const VENDOR_EVENT = "trendysize:measurement-vendor";

export function saveMeasurementVendor(vendor) {
  if (!vendor) return;

  try {
    localStorage.setItem(MEASURE_VENDOR_KEY, JSON.stringify(vendor));
    window.dispatchEvent(new Event(VENDOR_EVENT));
  } catch (error) {
    console.error("Could not store measurement vendor:", error);
  }
}

export function loadMeasurementVendor() {
  try {
    const raw = localStorage.getItem(MEASURE_VENDOR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function subscribeToMeasurementVendor(callback) {
  const onStorage = (event) => {
    if (event.key === MEASURE_VENDOR_KEY) callback(loadMeasurementVendor());
  };
  const onLocal = () => callback(loadMeasurementVendor());

  window.addEventListener("storage", onStorage);
  window.addEventListener(VENDOR_EVENT, onLocal);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(VENDOR_EVENT, onLocal);
  };
}

export function saveMeasurementToken(token) {
  if (!token) return;
  try {
    localStorage.setItem(MEASURE_TOKEN_KEY, token);
  } catch (error) {
    console.error("Could not store measurement token:", error);
  }
}

export function loadMeasurementToken() {
  try {
    return localStorage.getItem(MEASURE_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function vendorDisplayName(vendor) {
  if (!vendor) return "";
  return (
    vendor.businessName ||
    [vendor.firstName, vendor.lastName].filter(Boolean).join(" ") ||
    vendor.username ||
    ""
  );
}

export function vendorInitials(vendor) {
  return vendorDisplayName(vendor)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
