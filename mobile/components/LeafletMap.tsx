/**
 * LeafletMap — WebView-based OpenStreetMap (free, no API key).
 *
 * mode="view"   → shows a pin at lat/lng (or auto-geocodes `address` if no coords)
 * mode="picker" → tap/drag to pin a location; search box uses Nominatim geocoding
 *                 calls onLocationPick(lat, lng) whenever the pin changes
 */
import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

interface LeafletMapProps {
  mode: 'view' | 'picker';
  latitude?: number;
  longitude?: number;
  /** Used in view mode to auto-geocode when no lat/lng are available */
  address?: string;
  height?: number;
  onLocationPick?: (lat: number, lng: number) => void;
}

/* ─── HTML builders ─────────────────────────────────────────────────────── */

function buildViewHtml(lat?: number, lng?: number, address?: string): string {
  const hasCoords = lat != null && lng != null;
  const initLat = hasCoords ? lat : 20.5937;
  const initLng = hasCoords ? lng : 78.9629;
  const initZoom = hasCoords ? 15 : 5;

  const autoGeocode =
    !hasCoords && address
      ? `
fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(${JSON.stringify(address)}) + '&format=json&limit=1', {
  headers: { 'User-Agent': 'RoomSafar/1.0', 'Accept-Language': 'en' }
})
.then(function(r){ return r.json(); })
.then(function(data){
  if (data && data.length > 0) {
    var lat = parseFloat(data[0].lat), lng = parseFloat(data[0].lon);
    map.setView([lat, lng], 14);
    L.marker([lat, lng]).addTo(map);
  }
}).catch(function(){});
`
      : '';

  const staticPin = hasCoords
    ? `L.marker([${lat}, ${lng}]).addTo(map);`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { box-sizing: border-box; }
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
  .leaflet-control-attribution { font-size: 9px; }
</style>
</head>
<body>
<div id="map"></div>
<script>
var map = L.map('map', { zoomControl: true, scrollWheelZoom: false, dragging: true })
          .setView([${initLat}, ${initLng}], ${initZoom});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19
}).addTo(map);
${staticPin}
${autoGeocode}
</script>
</body>
</html>`;
}

function buildPickerHtml(lat?: number, lng?: number): string {
  const hasCoords = lat != null && lng != null;
  const initLat = hasCoords ? lat : 20.5937;
  const initLng = hasCoords ? lng : 78.9629;
  const initZoom = hasCoords ? 14 : 5;

  const initialMarker = hasCoords
    ? `
marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);
marker.on('dragend', function(e) { sendCoords(e.target.getLatLng().lat, e.target.getLatLng().lng); });
document.getElementById('hint').style.display = 'none';
`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { box-sizing: border-box; }
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
  #search-bar {
    position: absolute; top: 10px; left: 10px; right: 10px; z-index: 1000;
    display: flex; gap: 6px;
  }
  #search-input {
    flex: 1; padding: 9px 12px; border-radius: 10px; border: 1px solid #ddd;
    font-size: 14px; background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    outline: none;
  }
  #search-btn {
    padding: 9px 14px; border-radius: 10px; border: none;
    background: #FF385C; color: white; font-weight: 700; font-size: 13px;
    cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    white-space: nowrap; flex-shrink: 0;
  }
  #hint {
    position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
    z-index: 1000; background: rgba(0,0,0,0.62); color: white;
    padding: 7px 16px; border-radius: 20px; font-size: 12px;
    white-space: nowrap; pointer-events: none;
  }
  .leaflet-control-attribution { font-size: 9px; }
</style>
</head>
<body>
<div id="search-bar">
  <input id="search-input" type="text" placeholder="Search area / city…" autocomplete="off"/>
  <button id="search-btn">Search</button>
</div>
<div id="map"></div>
<div id="hint">Tap map to pin the location</div>
<script>
var marker = null;

var map = L.map('map', { zoomControl: true, scrollWheelZoom: false })
          .setView([${initLat}, ${initLng}], ${initZoom});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19
}).addTo(map);

${initialMarker}

map.on('click', function(e) {
  placeMarker(e.latlng.lat, e.latlng.lng);
});

function placeMarker(lat, lng) {
  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    marker.on('dragend', function(e) {
      sendCoords(e.target.getLatLng().lat, e.target.getLatLng().lng);
    });
  }
  sendCoords(lat, lng);
  document.getElementById('hint').style.display = 'none';
}

function sendCoords(lat, lng) {
  var msg = JSON.stringify({ type: 'location', lat: lat, lng: lng });
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(msg);
  }
}

function searchAddress() {
  var q = document.getElementById('search-input').value.trim();
  if (!q) return;
  document.getElementById('search-btn').textContent = '…';
  fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(q) + '&format=json&limit=1&countrycodes=in', {
    headers: { 'User-Agent': 'RoomSafar/1.0', 'Accept-Language': 'en' }
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    document.getElementById('search-btn').textContent = 'Search';
    if (data && data.length > 0) {
      var lat = parseFloat(data[0].lat), lng = parseFloat(data[0].lon);
      map.setView([lat, lng], 15);
      placeMarker(lat, lng);
    } else {
      alert('Location not found. Try a more specific search.');
    }
  })
  .catch(function() {
    document.getElementById('search-btn').textContent = 'Search';
    alert('Search failed. Check your connection.');
  });
}

document.getElementById('search-btn').addEventListener('click', searchAddress);
document.getElementById('search-input').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); searchAddress(); }
});
</script>
</body>
</html>`;
}

/* ─── component ─────────────────────────────────────────────────────────── */

export default function LeafletMap({
  mode,
  latitude,
  longitude,
  address,
  height = 220,
  onLocationPick,
}: LeafletMapProps) {
  const webviewRef = useRef<WebView>(null);

  const html =
    mode === 'view'
      ? buildViewHtml(latitude, longitude, address)
      : buildPickerHtml(latitude, longitude);

  const handleMessage = (e: WebViewMessageEvent) => {
    if (mode !== 'picker') return;
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.type === 'location' && onLocationPick) {
        onLocationPick(data.lat, data.lng);
      }
    } catch (_) {}
  };

  // On web platform the WebView renders as an <iframe>; it still works fine.
  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webviewRef}
        source={{ html }}
        style={styles.webview}
        onMessage={handleMessage}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color="#FF385C" />
            <Text style={styles.loadingText}>Loading map…</Text>
          </View>
        )}
        // Needed on Android so the map tiles load
        mixedContentMode="always"
        // Allow network requests for tiles + Nominatim
        allowsInlineMediaPlayback
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  webview: { flex: 1 },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F7',
    gap: 8,
  },
  loadingText: { fontSize: 13, color: '#717171' },
});
