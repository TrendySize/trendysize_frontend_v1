/*
|--------------------------------------------------------------------------
| AMBIENT BACKGROUND
|--------------------------------------------------------------------------
| A single fixed layer of soft, brand-tinted light pools behind the app
| content. Its only job is to give the frosted glass tiles and chrome
| something to reveal — without it, glass over a flat fill is invisible.
| Non-interactive and layout-neutral (position: fixed, pointer-events: none).
|
*/

export default function AmbientBackground() {
  return <div className="tk-ambient" aria-hidden="true" />;
}
