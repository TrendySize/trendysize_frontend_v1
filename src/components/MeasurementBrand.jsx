import { useEffect, useState } from "react";

import {
  loadMeasurementVendor,
  subscribeToMeasurementVendor,
  vendorDisplayName,
  vendorInitials,
} from "../measurementSession";

export default function MeasurementBrand({ vendor = null, className = "" }) {
  const [storedVendor, setStoredVendor] = useState(() =>
    loadMeasurementVendor()
  );

  useEffect(() => subscribeToMeasurementVendor(setStoredVendor), []);

  const activeVendor = vendor || storedVendor;
  if (!activeVendor) return null;

  const name = vendorDisplayName(activeVendor);
  if (!name) return null;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-border)] bg-[var(--tk-surface)] text-xs font-bold text-[var(--tk-brand)]">
        {activeVendor.profileImageUrl ? (
          <img
            src={activeVendor.profileImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          vendorInitials(activeVendor)
        )}
      </span>

      <span className="min-w-0 text-left">
        <span className="block truncate text-xs font-semibold text-[var(--tk-ink)]">
          {name}
        </span>
        <span className="block text-xs text-[var(--tk-ink-muted)]">
          Measurement link
        </span>
      </span>
    </div>
  );
}
