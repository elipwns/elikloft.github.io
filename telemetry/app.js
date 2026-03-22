// Race Telemetry Dashboard
// Demo: animated car around Portland International Raceway
// Live: connects to AWS WebSocket (update WEBSOCKET_URL after terraform apply)

const WEBSOCKET_URL = 'wss://REPLACE_ME.execute-api.us-west-2.amazonaws.com/prod';

const KPH_TO_MPH = 0.621371;

// Portland International Raceway — GPS centerline from OpenStreetMap
// OSM way IDs: 5529392, 1184207349, 1315957509
// Back-straight gap filled using pit-road way (118127468) nodes.
// S/F reference: 45.595, -122.694 (TrackAddict)
// 91 nodes, starts near S/F, runs clockwise.
const PIR = [
  // S/F area → connector (way 5529392 nodes 31–36)
  [45.5950254, -122.6945231],
  [45.5950478, -122.6946062],
  [45.5954080, -122.6959840],
  [45.5956470, -122.6969340],
  [45.5957439, -122.6972912],
  [45.5959808, -122.6981651],
  // Connector (way 1184207349)
  [45.5964368, -122.6998466],
  // Carousel loop (way 1315957509 all 52 nodes)
  [45.5970240, -122.7020120],
  [45.5971360, -122.7024030],
  [45.5972290, -122.7026650],
  [45.5972850, -122.7027800],
  [45.5973740, -122.7029050],
  [45.5974410, -122.7029700],
  [45.5975890, -122.7030600],
  [45.5978150, -122.7031300],
  [45.5979220, -122.7031390],
  [45.5981310, -122.7030820],
  [45.5982660, -122.7029830],
  [45.5983630, -122.7028690],
  [45.5985260, -122.7026140],
  [45.5986270, -122.7024200],
  [45.5987370, -122.7021020],
  [45.5987520, -122.7019140],
  [45.5987400, -122.7017620],
  [45.5987124, -122.7016351],
  [45.5986680, -122.7015190],
  [45.5985680, -122.7013390],
  [45.5981330, -122.7008670],
  [45.5980410, -122.7007290],
  [45.5979520, -122.7004950],
  [45.5979270, -122.7003080],
  [45.5979360, -122.7001450],
  [45.5979740, -122.6999900],
  [45.5980600, -122.6998140],
  [45.5981960, -122.6996700],
  [45.5983190, -122.6995920],
  [45.5986470, -122.6994780],
  [45.5990770, -122.6994710],
  [45.5996040, -122.6995230],
  [45.5997190, -122.6995090],
  [45.5998530, -122.6994420],
  [45.5999210, -122.6993630],
  [45.5999530, -122.6992890],
  [45.5999720, -122.6991530],
  [45.5999610, -122.6990120],
  [45.5999040, -122.6987710],
  [45.5996080, -122.6977850],
  [45.5995660, -122.6976040],
  [45.5995230, -122.6972650],
  [45.5995071, -122.6968111],
  [45.5994790, -122.6962250],
  [45.5994647, -122.6960986],
  [45.5994550, -122.6960130],
  [45.5993030, -122.6951690],
  [45.5992250, -122.6948680],
  [45.5991370, -122.6946020],
  [45.5989690, -122.6941790],
  [45.5986980, -122.6936530],
  [45.5985130, -122.6933600],
  // Main straight → T1 complex (way 5529392 nodes 1–29)
  [45.5980270, -122.6926670],
  [45.5977270, -122.6922650],
  [45.5973540, -122.6918070],
  [45.5959050, -122.6902230],
  [45.5955150, -122.6897710],
  [45.5954270, -122.6896440],
  [45.5953420, -122.6894790],
  [45.5952920, -122.6893430],
  [45.5951380, -122.6887430],
  [45.5950360, -122.6885030],
  [45.5949560, -122.6883820],
  [45.5947310, -122.6881740],
  [45.5945209, -122.6880327],
  [45.5943250, -122.6879010],
  [45.5941900, -122.6878350],
  [45.5940750, -122.6878080],
  [45.5939950, -122.6878140],
  [45.5938600, -122.6878760],
  [45.5937860, -122.6879480],
  [45.5937250, -122.6880420],
  [45.5936800, -122.6881510],
  [45.5936370, -122.6883590],
  [45.5936270, -122.6885380],
  [45.5936360, -122.6887040],
  [45.5936584, -122.6888623],
  [45.5937340, -122.6893977],
  // Back straight — gap filled from pit-road way 118127468
  [45.5938266, -122.6899558],
  [45.5939500, -122.6904270],
  [45.5939923, -122.6901589],
  [45.5942250, -122.6909708],
  [45.5947449, -122.6929182],
  // Reconnect way 5529392 node 30
  [45.5946322, -122.6930642],
];

// Speed in kph at each waypoint (displayed as mph). 91 entries.
const PIR_SPEED_KPH = [
  // S/F → connector (0–6)
  128, 115, 102, 90, 85, 82, 82,
  // Carousel entry NW (7–13)
  78, 76, 75, 75, 76, 78, 80,
  // Carousel apex (14–22)
  83, 86, 88, 90, 92, 94, 95, 95, 94,
  // Carousel top → exit (23–32)
  93, 92, 90, 88, 88, 88, 90, 93, 95, 97,
  // Carousel exit NE (33–42)
  100, 103, 106, 109, 112, 115, 116, 118, 120, 122,
  // Main straight (43–57)
  125, 128, 130, 133, 135, 137, 138, 138, 138, 139,
  142, 144, 146, 148, 150,
  // Main straight peak → T1 entry (58–62)
  155, 158, 155, 148, 120,
  // T1 braking and apex (63–71)
  95, 88, 82, 76, 70, 66, 64, 63, 63,
  // T1 exit → back straight with gap fill (72–90)
  65, 68, 70, 70, 72, 74, 76, 78, 79,
  80, 82, 83, 85, 88, 90, 93, 96, 99, 102,
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
      .setView([45.5968, -122.6955], 15);

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 19 }
    ).addTo(this.map);

    // Track outline (polygon auto-closes the loop)
    L.polygon(PIR, { color: '#58a6ff', weight: 3, opacity: 0.45, fill: false }).addTo(this.map);

    // Start/finish dot (TrackAddict S/F: 45.595, -122.694)
    L.circleMarker([45.595, -122.694], {
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
