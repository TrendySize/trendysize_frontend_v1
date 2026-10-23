import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function LinkQrCode({ value, size = 176 }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let active = true;

    if (!value) {
      Promise.resolve().then(() => {
        if (active) setSrc("");
      });

      return () => {
        active = false;
      };
    }

    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: "#241065", light: "#FFFFFF" },
    })
      .then((dataUrl) => {
        if (active) setSrc(dataUrl);
      })
      .catch((error) => {
        console.error("Could not create QR code:", error);
        if (active) setSrc("");
      });

    return () => {
      active = false;
    };
  }, [value, size]);

  if (!src) return null;

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt="QR code for this measurement link"
      className="rounded-lg border border-[var(--tk-border)] bg-white p-1.5"
    />
  );
}
