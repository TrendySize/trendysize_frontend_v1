/*
|--------------------------------------------------------------------------
| APP CANVAS
|--------------------------------------------------------------------------
| A fixed neutral canvas behind app content. It is non-interactive and
| layout-neutral, allowing each page to own its own surface hierarchy.
|
*/

export default function AmbientBackground() {
  return <div className="tk-ambient" aria-hidden="true" />;
}
