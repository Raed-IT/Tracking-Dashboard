# FusionOps UI update

Implemented on top of the uploaded source tree:

- Full-screen overview map mode with fixed viewport and exit control.
- Responsive map sizing with MapLibre navigation controls.
- Internal table scrolling (vertical + horizontal) so the page does not overflow.
- Table pagination with 10/25/50/100 rows, numbered pages, previous/next and result ranges.
- Dark/light theme persisted in localStorage.
- English/Arabic language toggle persisted in localStorage; document direction switches LTR/RTL.
- Header controls for language and theme.
- Existing Laravel API, realtime connection, Zustand stores and MapLibre track fetching were kept intact.

The language toggle currently switches the UI direction and preference state. Existing page copy is still English unless translated in the individual page/components.
