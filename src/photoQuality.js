export function checkPhotoBrightness(dataUrl) {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const width = 32;
        const height = 42;
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) {
          resolve({ brightness: null, isDark: false });
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        const { data } = context.getImageData(0, 0, width, height);

        let total = 0;
        for (let index = 0; index < data.length; index += 4) {
          total +=
            0.2126 * data[index] +
            0.7152 * data[index + 1] +
            0.0722 * data[index + 2];
        }

        const brightness = total / (data.length / 4);
        resolve({ brightness, isDark: brightness < 58 });
      } catch {
        resolve({ brightness: null, isDark: false });
      }
    };

    image.onerror = () => resolve({ brightness: null, isDark: false });
    image.src = dataUrl;
  });
}
