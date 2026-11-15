# Japan 13-day itinerary planner

A buildless, browser-based planner for a fixed Tokyo → Hakone → Kyoto → Osaka → Tokyo route. It includes 33 curated attractions with coordinates, prices, cities, and official links, GeoJSON and map-click workflows for adding more, calendar scheduling, any number of timed travel entries, mapped hotels by stay day, Google Maps links in every place popup, map filters, automatic local persistence, and JSON backup/restore. The packaged `data/japan-attractions.geojson` supplies the base coordinates and source notes.

## Open it

For the most reliable experience, serve this folder with any small static server:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`. Opening `index.html` directly also works in current browsers, though some browser privacy settings restrict JavaScript modules on `file://` pages.

No build or package installation is required. Internet access is needed only for the Leaflet library and OpenStreetMap tiles. If those cannot load, the attraction and itinerary tools remain available and a useful map fallback is shown.

## Files

- `index.html` — accessible page structure and Leaflet CDN references
- `css/styles.css` — responsive visual design and required map dimensions
- `js/app.js` — UI state, events, import/export, and rendering
- `js/map.js` — Leaflet initialization, markers, attribution, and tile errors
- `js/attractions.js` — sample places, search, and GeoJSON validation
- `js/itinerary.js` — 13-day route and assignment/reordering logic
- `js/storage.js` — local persistence and JSON backups
- `data/japan-attractions.geojson` — the source list of 33 built-in attractions

## GeoJSON format

Import a `FeatureCollection` containing Point features. Coordinates follow GeoJSON order: `[longitude, latitude]`. Supported properties are `id`, `name`, `city`, and `category`; reasonable fallbacks are used when properties are missing. Non-Point features are skipped and reported.

For a quicker single-place workflow, choose “Add from map,” click the location, and enter its name, city, and category. The planner captures the coordinates and saves the new attraction locally; it then behaves like any imported attraction.

## Travel and hotels

Select a day and use “Add travel” as often as needed. Attractions and travel items have editable start/end times and appear on a calendar timeline, with longer events rendered as taller blocks. Existing duration-based backups are migrated into sequential times automatically. Add hotels in the Hotels section with a stay day, latitude, and longitude; hotel cards are listed by day and focus their purple marker when selected.

## Privacy and storage

Without Firebase configuration, plans are stored only in browser `localStorage`. “Back up plan” downloads a JSON file; “Restore plan” accepts that file later. With Firebase enabled, the shared trip is synchronized through one Cloud Firestore document and the browser copy remains as a fallback.

## Enable the shared Firebase itinerary

1. Create a project at `https://console.firebase.google.com/`.
2. In the project overview, add a Web app (`</>`). A hosting setup is not needed because GitHub Pages hosts the files.
3. Copy the displayed `firebaseConfig` values into `js/firebase-config.js`.
4. In that same file, change `enabled: false` to `enabled: true`.
5. In Firebase Console, open **Build → Firestore Database**, choose **Create database**, select **Standard edition**, choose a nearby region, and start in **Production mode**.
6. Open Firestore’s **Rules** tab. Replace its contents with the contents of the included `firestore.rules`, then click **Publish**.
7. Upload the updated folder contents to GitHub and wait for GitHub Pages to redeploy.
8. Open the published planner. The footer should change from “Connecting…” to **Shared trip · live**. If the shared document does not exist yet, the first connected browser seeds it with that browser’s current plan.

The Firebase web configuration is not a password; it identifies the project. Access is controlled by Firestore Rules. The included rules expose only `sharedItineraries/japan-trip`, validate its basic shape and size, prevent deletion, and deny all other database paths. Because this planner intentionally allows anonymous editing, anyone who can load the app can still overwrite the shared itinerary. Writes are last-write-wins when two people edit the same data at nearly the same time.

Map data © OpenStreetMap contributors.
