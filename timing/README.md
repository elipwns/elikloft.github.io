# LoRa Timing System Dashboard

Live web dashboard for the LoRa-based motorsports timing system.

## Features

- 🔴 **Live timing display** - See elapsed time in real-time
- 📊 **Run history** - Leaderboard of all runs
- 📈 **Statistics** - Best time, total runs
- 🎮 **Demo mode** - Test without hardware
- 📱 **Responsive** - Works on phone, tablet, desktop

## Quick Start

### Option 1: Demo Mode (No Hardware)

1. Open `timing/index.html` in your browser
2. Click "Simulate START" and "Simulate FINISH" buttons
3. Watch the dashboard update in real-time

### Option 2: Live with Hardware

1. **Install Python dependencies:**
   ```bash
   pip install pyserial websockets
   ```

2. **Connect Arduino to computer via USB**

3. **Edit `timing_server.py`:**
   - Change `SERIAL_PORT` to your Arduino port (check Arduino IDE)
   - Windows: `COM3`, `COM4`, etc.
   - Mac/Linux: `/dev/ttyUSB0`, `/dev/cu.usbserial-*`, etc.

4. **Run the WebSocket server:**
   ```bash
   python timing_server.py
   ```

5. **Open dashboard:**
   - Local: `http://localhost:8000/timing`
   - Or open `timing/index.html` directly in browser

6. **Press buttons on Arduino boards** - Dashboard updates automatically!

## Architecture

```
[Start Board] --LoRa--> [Finish Board]
                             |
                        USB Serial
                             |
                    timing_server.py
                             |
                        WebSocket
                             |
                    Web Dashboard
```

## Message Format

The Arduino boards send these messages over serial:

- `START:1` - Run #1 started
- `RESULT:1:2.345` - Run #1 finished in 2.345 seconds

The dashboard parses these and updates the UI.

## Deployment

### GitHub Pages (Current)

1. Push to your branch
2. Merge to main
3. Dashboard available at `https://elikloft.com/timing`

**Note:** WebSocket server must run locally. For remote access, see AWS option below.

### AWS IoT Core (Future)

For cloud-based timing with remote access:

1. Arduino publishes to AWS IoT Core via MQTT
2. Dashboard subscribes to IoT Core topics
3. Works from anywhere with internet

See `aws-iot-core-explained.md` for details.

## Customization

### Change Colors

Edit `timing/style.css`:
- Line 8: Background gradient
- Line 91: Primary color (purple)
- Line 97: Success color (green)

### Change WebSocket URL

Edit `timing/app.js`:
- Line 23: Change `ws://localhost:8765` to your server

### Add Features

The dashboard is vanilla JavaScript - no build tools needed. Just edit `app.js`!

## Troubleshooting

**Dashboard shows "Disconnected":**
- Make sure `timing_server.py` is running
- Check WebSocket URL in `app.js` matches server
- Use demo mode to test dashboard without server

**No serial data:**
- Check Arduino is connected
- Verify correct COM port in `timing_server.py`
- Open Arduino Serial Monitor to confirm data is being sent

**Dashboard not updating:**
- Open browser console (F12) to see errors
- Check WebSocket connection status
- Try demo mode to isolate issue

## Demo for Presentation

1. Run `timing_server.py` on laptop
2. Connect both Arduino boards
3. Open dashboard on laptop screen
4. Press START button on first board
5. Press FINISH button on second board
6. Dashboard shows time with animation!

**Backup:** Use demo mode if hardware fails during presentation.

## Future Enhancements

- [ ] AWS IoT Core integration
- [ ] Multi-lane support
- [ ] GPS lap timing
- [ ] Mobile app
- [ ] Historical data storage
- [ ] "Race your friends" feature

---

Built with ❤️ for motorsports enthusiasts
