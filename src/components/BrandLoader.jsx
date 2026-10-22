import BrandLogo from "./BrandLogo";

/**
 * Full-screen loading hero. The mark floats on a soft lavender aura in light
 * mode and breathes inside a stronger purple glow in dark mode (see index.css).
 */
export default function BrandLoader({ label = "Loading…" }) {
  return (
    <div className="tk-loader" role="status" aria-live="polite">
      <span className="tk-loader__stage">
        <span className="tk-loader__halo" aria-hidden="true" />
        <BrandLogo className="tk-loader__logo" />
      </span>
      <p className="tk-loader__label">{label}</p>
    </div>
  );
}
