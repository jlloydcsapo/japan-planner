import { mapTilerConfig } from "./maptiler-config.js?v=1";
let map, layer;
const markers = new Map();
const colors = { Tokyo:'#c44435', Kyoto:'#244b3d', Osaka:'#d08d25', Hakone:'#496f91', Nara:'#78588e', Hotel:'#7a4f9d', Other:'#59615b' };

export function initMap({ onSelect, onMapClick, onError }) {
  if (!window.L) {
    onError("Leaflet unavailable");
    return false;
  }

  try {
    map = L.map("map", {
      zoomControl: true
    }).setView([35.38, 136.7], 6);

    const hasMapTiler =
      mapTilerConfig.apiKey &&
      L.maptiler?.maptilerLayer;

    if (hasMapTiler) {
      const basemap = L.maptiler.maptilerLayer({
        apiKey: mapTilerConfig.apiKey,
        style: L.maptiler.MapStyle.STREETS,
        language: L.maptiler.Language.ENGLISH
      }).addTo(map);

      document
        .querySelectorAll('[name="basemap"]')
        .forEach(control => {
          control.addEventListener("change", event => {
            const style =
              event.target.value === "satellite"
                ? L.maptiler.MapStyle.HYBRID
                : L.maptiler.MapStyle.STREETS;

            basemap.setStyle(style);
            basemap.setLanguage(
              L.maptiler.Language.ENGLISH
            );
          });
        });
    } else {
      const tiles = L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      );

      let tileFailures = 0;

      tiles.on("tileerror", () => {
        if (++tileFailures === 3) {
          onError("Map tiles unavailable");
        }
      });

      tiles.addTo(map);

      document
        .querySelectorAll('[name="basemap"]')
        .forEach(control => {
          control.disabled = true;
        });
    }

    layer = L.layerGroup().addTo(map);

    map.on("click", event => {
      onSelect?.(null);

      onMapClick?.({
        lat: event.latlng.lat,
        lng: event.latlng.lng
      });
    });

    setTimeout(() => map.invalidateSize(), 0);

    return true;
  } catch (error) {
    onError(error.message);
    return false;
  }
}

export function setPickMode(active) { map?.getContainer().classList.toggle('picking-place',active); }

export function renderMarkers(places, assigned, selectedDay) {
  if (!map || !layer) return;
  layer.clearLayers();
  markers.clear();
  places.forEach(place => {
    const day = assigned(place.id);
    const googleMapsURL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.lat},${place.lng}`)}`;
    const marker = L.circleMarker([place.lat,place.lng], { radius: day ? 9 : 7, weight:2, color:'#fffdf8', fillColor:colors[place.city] || colors.Other, fillOpacity:day ? 1 : .78 });
    marker.bindPopup(`<div class="map-popup"><strong>${escapeHTML(place.name)}</strong><span>${escapeHTML(place.city)} · ${escapeHTML(place.category)}${place.price?` · ${escapeHTML(place.price)}`:''}${day ? ` · Day ${day}` : ''}</span><a href="${googleMapsURL}" target="_blank" rel="noopener noreferrer">Open in Google Maps ↗</a>${place.url?`<a href="${escapeHTML(place.url)}" target="_blank" rel="noopener noreferrer">Official site ↗</a>`:''}</div>`);
    marker.on('click', () => selectedDay?.(place));
    marker.addTo(layer);
    markers.set(place.id, marker);
  });
}

export function focusPlace(place) {
  if (!map || !place) return;
  map.flyTo([place.lat,place.lng], Math.max(map.getZoom(),14), { duration:.7 });
  setTimeout(() => markers.get(place.id)?.openPopup(), 750);
}

function escapeHTML(value) { const el=document.createElement('span'); el.textContent=value; return el.innerHTML; }
