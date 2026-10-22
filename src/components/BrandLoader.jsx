import BrandLogo from "./BrandLogo";

/** Minimal full-screen fallback used only while the initial route loads. */
export default function BrandLoader({ label = "Loading…" }) {
  return (
    <div className="tk-loader" role="status" aria-live="polite">
      <span className="tk-loader__stage">
        <BrandLogo className="tk-loader__logo" />
      </span>
      <p className="tk-loader__label">{label}</p>
    </div>
  );
}
