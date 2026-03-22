// Race Telemetry Dashboard
// Demo: animated car around Portland International Raceway
// Live: connects to AWS WebSocket (update WEBSOCKET_URL after terraform apply)

const WEBSOCKET_URL = 'wss://REPLACE_ME.execute-api.us-west-2.amazonaws.com/prod';

const KPH_TO_MPH = 0.621371;

// Portland International Raceway — approximate waypoints (clockwise)
// PIR sits north of the Columbia River near the Expo Center.
// Address: 1940 N Victory Blvd, Portland OR 97217
// Center: ~45.5930°N, 122.6930°W
// Waypoints are approximate — record precise coords on-site and update TRACKS.md.
const PIR = [
  [45.5958, -122.7008],  //  0: Start/finish — pit exit, heading east
  [45.5958, -122.6978],  //  1: Main straight
  [45.5956, -122.6948],  //  2: Main straight
  [45.5952, -122.6918],  //  3: Main straight end, T1 entry
  [45.5940, -122.6905],  //  4: T1 right-hander apex
  [45.5926, -122.6900],  //  5: T1 exit, back straight begins
  [45.5912, -122.6899],  //  6: Back straight
  [45.5898, -122.6899],  //  7: Back straight mid
  [45.5884, -122.6900],  //  8: Back straight
  [45.5876, -122.6908],  //  9: Back straight end, T3 entry
  [45.5874, -122.6924],  // 10: T3 right-hander
  [45.5876, -122.6942],  // 11: Short straight
  [45.5874, -122.6960],  // 12: T4 left-hander (chicane in)
  [45.5878, -122.6978],  // 13: T5 right-hander (chicane out)
  [45.5884, -122.6995],  // 14: West infield
  [45.5895, -122.7006],  // 15: T6 right-hander
  [45.5910, -122.7010],  // 16: West straight
  [45.5925, -122.7012],  // 17: Carousel entry
  [45.5940, -122.7012],  // 18: Carousel mid
  [45.5952, -122.7010],  // 19: Carousel exit — back onto pit straight
];

// Speed in kph at each waypoint (displayed as mph)
const PIR_SPEED_KPH = [
  130, 148, 155, 150,  // main straight, braking at end
   80,  75,             // T1 apex and exit
  120, 140, 148, 145,  // back straight, braking at end
   65,  70,             // T3
   60,  65, 70,         // chicane
   75,  88,             // west infield
   80,  90, 105,        // carousel out to pit straight
];

// Portland spring demo weather
const DEMO_WEATHER = { tempF: 61, humidity: 62, pressure: 1012 };

class TelemetryDashboard {
  constructor() {
    this.ws            = null;
    this.demoTimer     = null;
    this.demoRunning   = false;
    this.demoIdx       = 0;
    this.lapStart      = null;
    this.lapCount      = 1;
    this.bestLapMs     = null;
    this.sessionStart  = Date.now();

    this.initMap();
    this.initUI();
    this.startSessionTimer();
    this.startDemo();
  }

  // ── Map ─────────────────────────────────────────────

  initMap() {
    this.map = L.map('map', { zoomControl: true, attributionControl: false })
      .setView([45.5917, -122.6956], 14);

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 19 }
    ).addTo(this.map);

    // Track outline
    L.polyline(PIR, { color: '#58a6ff', weight: 3, opacity: 0.45 }).addTo(this.map);

    // Start/finish dot
    L.circleMarker(PIR[0], {
      radius: 5, color: '#3fb950', fillColor: '#3fb950', fillOpacity: 1, weight: 2,
    }).addTo(this.map);

    // Car marker
    const icon = L.divIcon({ className: 'car-dot', iconSize: [11, 11] });
    this.carMarker = L.marker(PIR[0], { icon }).addTo(this.map);
  }

  // ── UI ──────────────────────────────────────────────

  initUI() {
    this.$speed       = document.getElementById('speed');
    this.$lapTime     = document.getElementById('lap-time');
    this.$lapCount    = document.getElementById('lap-count');
    this.$bestLap     = document.getElementById('best-lap');
    this.$satellites  = document.getElementById('satellites');
    this.$sessionTime = document.getElementById('session-time');
    this.$sessionId   = document.getElementById('session-id');
    this.$status      = document.getElementById('connection-status');
    this.$liveBtn     = document.getElementById('live-btn');

    document.getElementById('temp').textContent     = DEMO_WEATHER.tempF;
    document.getElementById('humidity').textContent = DEMO_WEATHER.humidity;
    document.getElementById('pressure').textContent = DEMO_WEATHER.pressure + ' hPa';
    this.$satellites.textContent = '8';

    this.$liveBtn.addEventListener('click', () => this.toggleLive());
  }

  // ── Demo simulation ──────────────────────────────────

  startDemo() {
    this.demoRunning = true;
    this.lapStart    = Date.now();
    this.lapCount    = 1;
    this.$lapCount.textContent = '1';
    this.$status.textContent   = 'Demo';
    this.$status.className     = 'badge demo';
    this.stepDemo();
  }

  stepDemo() {
    if (!this.demoRunning) return;

    const idx      = this.demoIdx % PIR.length;
    const pos      = PIR[idx];
    const speedKph = PIR_SPEED_KPH[idx] || 100;
    const speedMph = speedKph * KPH_TO_MPH;

    this.carMarker.setLatLng(pos);
    this.$speed.textContent = speedMph.toFixed(0);

    // Lap completion
    if (idx === 0 && this.demoIdx > 0) {
      const lapMs   = Date.now() - this.lapStart;
      this.lapStart = Date.now();
      this.lapCount++;
      this.$lapCount.textContent = this.lapCount;

      if (this.bestLapMs === null || lapMs < this.bestLapMs) {
        this.bestLapMs = lapMs;
        this.$bestLap.textContent = this.fmtLap(lapMs);
      }
    }

    // Running lap time
    if (this.lapStart) {
      this.$lapTime.textContent = this.fmtLap(Date.now() - this.lapStart);
    }

    this.demoIdx++;
    const nextIdx = this.demoIdx % PIR.length;
    const dist    = this.haversine(pos, PIR[nextIdx]);
    const mps     = (speedKph * 1000) / 3600;
    const delay   = Math.max(60, (dist / mps) * 1000);

    this.demoTimer = setTimeout(() => this.stepDemo(), delay);
  }

  // ── Live WebSocket ───────────────────────────────────

  toggleLive() {
    if (this.ws) {
      this.ws.close();
      return;
    }

    this.demoRunning = false;
    clearTimeout(this.demoTimer);
    this.$liveBtn.textContent = 'Disconnect';
    this.$liveBtn.classList.add('active');
    this.$status.textContent  = 'Connecting…';
    this.$status.className    = 'badge demo';

    try {
      this.ws = new WebSocket(WEBSOCKET_URL);

      this.ws.onopen = () => {
        this.$status.textContent  = 'Live';
        this.$status.className    = 'badge live';
        this.$sessionId.textContent = '—';
      };

      this.ws.onmessage = (e) => {
        try { this.handleLive(JSON.parse(e.data)); } catch (_) {}
      };

      this.ws.onclose = () => {
        this.$liveBtn.textContent = 'Connect Live';
        this.$liveBtn.classList.remove('active');
        this.ws = null;
        this.startDemo();
      };

      this.ws.onerror = () => this.ws && this.ws.close();

    } catch (_) {
      this.startDemo();
    }
  }

  handleLive(data) {
    const speedMph = parseFloat(data.speed_kph) * KPH_TO_MPH;
    this.$speed.textContent      = speedMph.toFixed(0);
    this.$satellites.textContent = data.satellites || '—';
    this.$sessionId.textContent  = data.session_id || '—';

    const lat = parseFloat(data.lat);
    const lon = parseFloat(data.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      this.carMarker.setLatLng([lat, lon]);
      this.map.panTo([lat, lon]);
    }
  }

  // ── Session timer ────────────────────────────────────

  startSessionTimer() {
    setInterval(() => {
      const s   = Math.floor((Date.now() - this.sessionStart) / 1000);
      const m   = Math.floor(s / 60).toString().padStart(2, '0');
      const sec = (s % 60).toString().padStart(2, '0');
      this.$sessionTime.textContent = `${m}:${sec}`;
    }, 1000);
  }

  // ── Helpers ──────────────────────────────────────────

  fmtLap(ms) {
    const s = ms / 1000;
    const m = Math.floor(s / 60);
    const r = (s % 60).toFixed(1).padStart(4, '0');
    return `${m}:${r}`;
  }

  haversine([lat1, lon1], [lat2, lon2]) {
    const R    = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a    = Math.sin(dLat / 2) ** 2 +
                 Math.cos(lat1 * Math.PI / 180) *
                 Math.cos(lat2 * Math.PI / 180) *
                 Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

document.addEventListener('DOMContentLoaded', () => new TelemetryDashboard());
