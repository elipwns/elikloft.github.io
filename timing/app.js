// LoRa Timing Dashboard - Client-side JavaScript
// Connects to WebSocket server or runs in demo mode

class TimingDashboard {
    constructor() {
        this.runs = [];
        this.currentRun = null;
        this.startTime = null;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        this.initElements();
        this.initWebSocket();
        this.initDemoMode();
    }
    
    initElements() {
        this.connectionStatus = document.getElementById('connection-status');
        this.totalRuns = document.getElementById('total-runs');
        this.bestTime = document.getElementById('best-time');
        this.runStatus = document.getElementById('run-status');
        this.currentTime = document.getElementById('current-time');
        this.runsTbody = document.getElementById('runs-tbody');
    }
    
    initWebSocket() {
        // Try to connect to local WebSocket server
        // Change this URL to match your server
        const wsUrl = 'ws://localhost:8765';
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.updateConnectionStatus(true);
                this.reconnectAttempts = 0;
            };
            
            this.ws.onmessage = (event) => {
                this.handleMessage(event.data);
            };
            
            this.ws.onerror = (error) => {
                console.log('WebSocket error:', error);
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.updateConnectionStatus(false);
                this.attemptReconnect();
            };
        } catch (error) {
            console.log('WebSocket not available, use demo mode');
            this.updateConnectionStatus(false);
        }
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
            setTimeout(() => this.initWebSocket(), 3000);
        }
    }
    
    handleMessage(data) {
        console.log('Received:', data);
        
        // Parse messages from Arduino
        // Format: "START:1" or "RESULT:1:2.345"
        if (data.startsWith('START:')) {
            const runNumber = parseInt(data.split(':')[1]);
            this.handleStart(runNumber);
        } else if (data.startsWith('RESULT:')) {
            const parts = data.split(':');
            const runNumber = parseInt(parts[1]);
            const time = parseFloat(parts[2]);
            this.handleFinish(runNumber, time);
        }
    }
    
    handleStart(runNumber) {
        this.currentRun = runNumber;
        this.startTime = Date.now();
        
        this.runStatus.textContent = `Run #${runNumber} in progress...`;
        this.runStatus.classList.add('active');
        this.currentTime.textContent = '0.000s';
        this.currentTime.classList.remove('finished');
        
        // Start live timer
        this.startLiveTimer();
    }
    
    startLiveTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            if (this.startTime) {
                const elapsed = (Date.now() - this.startTime) / 1000;
                this.currentTime.textContent = elapsed.toFixed(3) + 's';
            }
        }, 50);
    }
    
    handleFinish(runNumber, time) {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.runStatus.textContent = `Run #${runNumber} complete!`;
        this.runStatus.classList.remove('active');
        this.currentTime.textContent = time.toFixed(3) + 's';
        this.currentTime.classList.add('finished');
        
        // Add to runs list
        const run = {
            number: runNumber,
            time: time,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.runs.unshift(run);
        this.updateStats();
        this.updateTable();
        
        // Reset after 3 seconds
        setTimeout(() => {
            this.runStatus.textContent = 'Waiting for start...';
            this.currentTime.textContent = '--';
            this.currentTime.classList.remove('finished');
        }, 3000);
    }
    
    updateConnectionStatus(connected) {
        if (connected) {
            this.connectionStatus.textContent = 'Connected';
            this.connectionStatus.classList.remove('disconnected');
            this.connectionStatus.classList.add('connected');
        } else {
            this.connectionStatus.textContent = 'Disconnected';
            this.connectionStatus.classList.remove('connected');
            this.connectionStatus.classList.add('disconnected');
        }
    }
    
    updateStats() {
        this.totalRuns.textContent = this.runs.length;
        
        if (this.runs.length > 0) {
            const best = Math.min(...this.runs.map(r => r.time));
            this.bestTime.textContent = best.toFixed(3) + 's';
        }
    }
    
    updateTable() {
        if (this.runs.length === 0) {
            this.runsTbody.innerHTML = `
                <tr class="no-data">
                    <td colspan="3">No runs yet. Press START button to begin.</td>
                </tr>
            `;
            return;
        }
        
        this.runsTbody.innerHTML = this.runs.map((run, index) => {
            const isBest = run.time === Math.min(...this.runs.map(r => r.time));
            const rowClass = index === 0 ? 'new-run' : '';
            const timeClass = isBest ? 'best-time' : '';
            
            return `
                <tr class="${rowClass}">
                    <td class="run-number">#${run.number}</td>
                    <td class="run-time ${timeClass}">${run.time.toFixed(3)}s</td>
                    <td>${run.timestamp}</td>
                </tr>
            `;
        }).join('');
    }
    
    // Demo mode for testing without hardware
    initDemoMode() {
        let demoRunNumber = 0;
        const pendingRuns = new Map(); // Track runs waiting for finish
        
        document.getElementById('demo-start').addEventListener('click', () => {
            demoRunNumber++;
            const startTime = Date.now();
            pendingRuns.set(demoRunNumber, startTime);
            this.handleStart(demoRunNumber);
        });
        
        document.getElementById('demo-finish').addEventListener('click', () => {
            // Finish the oldest pending run
            if (pendingRuns.size > 0) {
                const oldestRun = Math.min(...pendingRuns.keys());
                const startTime = pendingRuns.get(oldestRun);
                const elapsed = (Date.now() - startTime) / 1000;
                
                pendingRuns.delete(oldestRun);
                this.handleFinish(oldestRun, elapsed);
            }
        });
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new TimingDashboard();
});
