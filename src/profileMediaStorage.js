const DATABASE_NAME = "trendySize_profile_media";
const STORE_NAME = "images";
const DATABASE_VERSION = 1;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("Could not open profile image storage."));
    request.onblocked = () =>
      reject(new Error("Profile image storage is blocked by another tab."));
  });
}

export async function saveProfileMedia(field, imageBlob) {
  const database = await openDatabase();

  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(imageBlob, field);
      transaction.oncomplete = resolve;
      transaction.onerror = () =>
        reject(
          transaction.error ||
            new Error("Could not save the profile image.")
        );
      transaction.onabort = () =>
        reject(
          transaction.error ||
            new Error("Saving the profile image was interrupted.")
        );
    });
  } finally {
    database.close();
  }
}

export async function loadProfileMedia(field) {
  const database = await openDatabase();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(field);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () =>
        reject(request.error || new Error("Could not load the profile image."));
    });
  } finally {
    database.close();
  }
}

export async function deleteProfileMedia(field) {
  const database = await openDatabase();

  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(field);
      transaction.oncomplete = resolve;
      transaction.onerror = () =>
        reject(
          transaction.error ||
            new Error("Could not delete the saved image.")
        );
      transaction.onabort = () =>
        reject(
          transaction.error ||
            new Error("Deleting the saved image was interrupted.")
        );
    });
  } finally {
    database.close();
  }
}

export async function hydrateProductImages(products) {
  let migrated = false;

  const hydratedProducts = await Promise.all(
    products.map(async (product, index) => {
      const id = product.id ?? `legacy-${index}`;
      const imageKey = product.imageKey || `product:${id}`;
      let image = product.image || "";

      if (image.startsWith("data:")) {
        await saveProfileMedia(imageKey, dataUrlToBlob(image));
        migrated = true;
      }

      const storedImage = await loadProfileMedia(imageKey);
      if (storedImage) {
        image = await readBlobAsDataUrl(storedImage);
      }

      return { ...product, id, image, imageKey };
    })
  );

  return { products: hydratedProducts, migrated };
}

export function getStoredProducts(products) {
  return products.map((product) =>
    Object.fromEntries(
      Object.entries(product).filter(([key]) => key !== "image")
    )
  );
}

export function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read the profile image."));
      }
    };
    reader.onerror = () =>
      reject(reader.error || new Error("Could not read the profile image."));
    reader.readAsDataURL(blob);
  });
}

export function dataUrlToBlob(dataUrl) {
  const [metadata, encodedData] = dataUrl.split(",", 2);
  const mimeType = metadata.match(/^data:(.*?);base64$/)?.[1];

  if (!mimeType || !encodedData) {
    throw new Error("The saved profile image has an invalid format.");
  }

  const binaryData = atob(encodedData);
  const bytes = new Uint8Array(binaryData.length);

  for (let index = 0; index < binaryData.length; index += 1) {
    bytes[index] = binaryData.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}
