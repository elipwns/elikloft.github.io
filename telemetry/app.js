// Race Telemetry Dashboard
// Demo mode: animated car around Portland International Raceway
// Live mode: connects to AWS WebSocket (update WEBSOCKET_URL after terraform apply)

const WEBSOCKET_URL = 'wss://REPLACE_ME.execute-api.us-west-2.amazonaws.com/prod';

// Portland International Raceway — approximate waypoints (clockwise)
// These are approximate. Record precise coords on-site and update TRACKS.md.
const PIR = [
  [45.5958, -122.6960],  //  0: Start/finish line
  [45.5958, -122.6935],  //  1: Main straight mid
  [45.5957, -122.6910],  //  2: Main straight, approaching T1
  [45.5951, -122.6893],  //  3: Turn 1 entry
  [45.5944, -122.6882],  //  4: Turn 1 apex
  [45.5934, -122.6876],  //  5: T1 exit / onto back straight
  [45.5920, -122.6875],  //  6: Back straight mid
  [45.5905, -122.6876],  //  7: Back straight end
  [45.5897, -122.6884],  //  8: Turn 3 entry
  [45.5892, -122.6898],  //  9: Turn 3 apex
  [45.5889, -122.6914],  // 10: Chicane left
  [45.5887, -122.6928],  // 11: Chicane right
  [45.5884, -122.6943],  // 12: Approaching hairpin
  [45.5882, -122.6957],  // 13: Hairpin entry
  [45.5880, -122.6965],  // 14: Hairpin apex
  [45.5886, -122.6975],  // 15: Hairpin exit
  [45.5898, -122.6978],  // 16: Infield straight
  [45.5913, -122.6978],  // 17: Turn before carousel
  [45.5924, -122.6975],  // 18: Carousel entry
  [45.5935, -122.6972],  // 19: Carousel mid
  [45.5943, -122.6967],  // 20: Carousel exit
  [45.5951, -122.6964],  // 21: Rejoining pit straight
];

// Speed (kph) at each waypoint — lower in corners, higher on straights
const PIR_SPEED = [
  110, 130, 145,  // main straight
  90, 75, 95,     // T1
  150, 155, 95,   // back straight + T3
  75, 65, 60,     // chicane
  55, 45, 40, 70, // hairpin
  85, 80, 70,     // infield
  90, 100, 105,   // carousel + back to start
];

// Simulated weather (Portland, typical spring race day)
const DEMO_WEATHER = { temp: 16, humidity: 62, pressure: 1012 };

class TelemetryDashboard {
  constructor() {
    this.ws            = null;
    this.demoRunning   = false;
    this.demoIdx       = 0;
    this.demoInterval  = null;
    this.lapStart      = null;
    this.lapCount      = 0;
    this.bestLap       = null;
    this.sessionStart  = Date.now();

    this.initMap();
    this.initUI();
    this.startSessionTimer();
    this.startDemo();
  }

  // ── Map ──────────────────────────────────────────────────

  initMap() {
    this.map = L.map('map', { zoomControl: true }).setView(
      [45.5920, -122.6928], 15
    );

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(this.map);

    // Draw track outline
    this.trackLine = L.polyline(PIR, {
      color: '#58a6ff',
      weight: 3,
      opacity: 0.5,
    }).addTo(this.map);

    // Start/finish marker
    L.circleMarker(PIR[0], {
      radius: 6,
      color: '#3fb950',
      fillColor: '#3fb950',
      fillOpacity: 1,
      weight: 2,
    })
      .bindTooltip('Start / Finish', { permanent: false })
      .addTo(this.map);

    // Car marker
    const carIcon = L.divIcon({ className: 'car-dot', iconSize: [12, 12] });
    this.carMarker = L.marker(PIR[0], { icon: carIcon }).addTo(this.map);

    // Live path trail
    this.livePath = L.polyline([], {
      color: '#f78166',
      weight: 2,
      opacity: 0.8,
    }).addTo(this.map);
  }

  // ── UI elements ──────────────────────────────────────────

  initUI() {
    this.$speed      = document.getElementById('speed');
    this.$lapTime    = document.getElementById('lap-time');
    this.$lapCount   = document.getElementById('lap-count');
    this.$bestLap    = document.getElementById('best-lap');
    this.$satellites = document.getElementById('satellites');
    this.$sessionTime = document.getElementById('session-time');
    this.$sessionId  = document.getElementById('session-id');
    this.$status     = document.getElementById('connection-status');
    this.$liveBtn    = document.getElementById('live-btn');

    document.getElementById('temp').textContent     = DEMO_WEATHER.temp;
    document.getElementById('humidity').textContent = DEMO_WEATHER.humidity;
    document.getElementById('pressure').textContent = DEMO_WEATHER.pressure + ' hPa';
    this.$satellites.textContent = '8';

    this.$liveBtn.addEventListener('click', () => this.toggleLive());
  }

  // ── Demo simulation ───────────────────────────────────────

  startDemo() {
    this.demoRunning = true;
    this.lapStart    = Date.now();
    this.lapCount    = 1;
    this.$lapCount.textContent = this.lapCount;
    this.$status.textContent   = 'Demo Mode';
    this.$status.className     = 'badge disconnected';

    // Step through waypoints — interval varies by speed
    this.stepDemo();
  }

  stepDemo() {
    if (!this.demoRunning) return;

    const idx   = this.demoIdx % PIR.length;
    const pos   = PIR[idx];
    const speed = PIR_SPEED[idx] || 100;

    this.carMarker.setLatLng(pos);
    this.$speed.textContent = speed.toFixed(0);

    // Lap counter — crossing waypoint 0
    if (idx === 0 && this.demoIdx > 0) {
      const lapMs  = Date.now() - this.lapStart;
      this.lapStart = Date.now();
      this.lapCount++;
      this.$lapCount.textContent = this.lapCount;

      const lapStr = this.formatLap(lapMs);
      this.$lapTime.textContent = lapStr;

      if (this.bestLap === null || lapMs < this.bestLap) {
        this.bestLap = lapMs;
        this.$bestLap.textContent = lapStr;
      }
    }

    // Live elapsed lap time
    if (this.lapStart) {
      const elapsed = Date.now() - this.lapStart;
      this.$lapTime.textContent = this.formatLap(elapsed);
    }

    this.demoIdx++;

    // Time to next waypoint based on distance and speed
    const nextIdx = this.demoIdx % PIR.length;
    const dist    = this.haversine(pos, PIR[nextIdx]); // metres
    const mps     = (speed * 1000) / 3600;             // m/s
    const delay   = Math.max(50, (dist / mps) * 1000); // ms, min 50

    this.demoTimer = setTimeout(() => this.stepDemo(), delay);
  }

  // ── Live WebSocket ────────────────────────────────────────

  toggleLive() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.$liveBtn.textContent = 'Connect Live';
      this.$liveBtn.classList.remove('active');
      this.startDemo();
      return;
    }

    this.demoRunning = false;
    clearTimeout(this.demoTimer);

    this.$liveBtn.textContent = 'Disconnect';
    this.$liveBtn.classList.add('active');
    this.$status.textContent  = 'Connecting…';

    try {
      this.ws = new WebSocket(WEBSOCKET_URL);

      this.ws.onopen = () => {
        this.$status.textContent = 'Live';
        this.$status.className   = 'badge connected';
        this.$sessionId.textContent = '—';
        this.livePath.setLatLngs([]);
      };

      this.ws.onmessage = (e) => {
        try { this.handleLive(JSON.parse(e.data)); } catch (_) {}
      };

      this.ws.onclose = () => {
        this.$status.textContent = 'Demo Mode';
        this.$status.className   = 'badge disconnected';
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
    const lat  = parseFloat(data.lat);
    const lon  = parseFloat(data.lon);
    const speed = parseFloat(data.speed_kph);
    const sats  = parseInt(data.satellites);

    this.$speed.textContent      = speed.toFixed(0);
    this.$satellites.textContent = sats;
    this.$sessionId.textContent  = data.session_id || '—';

    if (!isNaN(lat) && !isNaN(lon)) {
      const ll = [lat, lon];
      this.carMarker.setLatLng(ll);
      this.livePath.addLatLng(ll);
      this.map.panTo(ll);
    }
  }

  // ── Session timer ─────────────────────────────────────────

  startSessionTimer() {
    setInterval(() => {
      const s = Math.floor((Date.now() - this.sessionStart) / 1000);
      const m = Math.floor(s / 60).toString().padStart(2, '0');
      const sec = (s % 60).toString().padStart(2, '0');
      this.$sessionTime.textContent = `${m}:${sec}`;
    }, 1000);
  }

  // ── Helpers ───────────────────────────────────────────────

  formatLap(ms) {
    const totalSec = ms / 1000;
    const m   = Math.floor(totalSec / 60);
    const s   = (totalSec % 60).toFixed(1).padStart(4, '0');
    return `${m}:${s}`;
  }

  haversine([lat1, lon1], [lat2, lon2]) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) *
              Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

document.addEventListener('DOMContentLoaded', () => new TelemetryDashboard());
