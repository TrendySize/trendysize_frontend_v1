import logoLight from "../assets/images/trendySizeLogo.svg";
import logoDark from "../assets/images/trendySizeLogo-dark.svg";

/**
 * The TrendySize mark.
 *
 * variant="auto"  follow the app theme (html.dark); the brightened artwork is
 *                 used on dark surfaces so the purple body stays legible.
 * variant="light" pin the original artwork (light surfaces, purple hero).
 * variant="dark"  pin the brightened artwork (fixed dark surfaces).
 *
 * Sizing comes from `className`; the images fill the wrapper.
 */
export default function BrandLogo({
  variant = "auto",
  alt = "",
  className = "",
}) {
  const auto = variant === "auto";
  const showLight = auto || variant === "light";
  const showDark = auto || variant === "dark";

  return (
    <span
      className={`tk-brand-logo${auto ? " tk-brand-logo--auto" : ""} ${className}`.trim()}
      {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": "true" })}
    >
      {showLight && (
        <img
          src={logoLight}
          alt=""
          className="tk-brand-logo__img tk-brand-logo__light"
        />
      )}
      {showDark && (
        <img
          src={logoDark}
          alt=""
          className="tk-brand-logo__img tk-brand-logo__dark"
        />
      )}
    </span>
  );
}
