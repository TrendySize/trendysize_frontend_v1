// Google Identity Services loader.
// Loads the GIS script once and exposes a helper that resolves a Google ID token.
// The token is posted to POST /api/auth/google (see services/api.js).

const GSI_SRC = "https://accounts.google.com/gsi/client";

let loadPromise = null;

export function loadGoogleIdentity() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in requires a browser."));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google.accounts.id);
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () =>
        resolve(window.google.accounts.id)
      );
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services."))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.accounts.id);
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services."));
    document.head.appendChild(script);
  });

  return loadPromise;
}

// Triggers the Google account chooser and resolves the resulting ID token.
export async function promptGoogleCredential(clientId) {
  const googleId = await loadGoogleIdentity();

  return new Promise((resolve, reject) => {
    googleId.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response?.credential) {
          resolve(response.credential);
        } else {
          reject(new Error("Google did not return a credential."));
        }
      },
      cancel_on_tap_outside: true,
    });

    // Render an off-screen button and click it to open the popup, which works
    // without relying on One Tap being explicitly shown.
    const holder = document.createElement("div");
    holder.style.position = "fixed";
    holder.style.left = "-9999px";
    document.body.appendChild(holder);

    googleId.renderButton(holder, {
      type: "standard",
      size: "large",
      text: "continue_with",
    });

    const button = holder.querySelector("div[role=button]") || holder.firstElementChild;
    if (button) {
      button.click();
    } else {
      document.body.removeChild(holder);
      reject(new Error("Unable to open the Google sign-in prompt."));
      return;
    }

    // Clean up on the next tick after the popup opens.
    setTimeout(() => {
      if (holder.parentNode) document.body.removeChild(holder);
    }, 1000);
  });
}
