const { spawn, exec } = require('child_process');
const path = require('path');

class StreamlitManager {
  constructor() {
    this.server = null;
    this.isRunning = false;
  }

  startServer() {
    return new Promise((resolve, reject) => {
      if (this.isRunning) {
        resolve('Server already running');
        return;
      }

      const streamlitPath = path.join(__dirname, 'Disease ML Model', 'multiple-disease-prediction-streamlit-app');
      const appPath = path.join(streamlitPath, 'app.py');

      console.log('Starting Streamlit server...');
      console.log(`Working directory: ${streamlitPath}`);
      console.log(`App file: ${appPath}`);

      this.server = spawn('streamlit', ['run', 'app.py', '--server.port', '8505', '--server.headless', 'true'], {
        cwd: streamlitPath,
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
      });

      this.server.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Streamlit stdout:', output);
        if (output.includes('Local URL: http://localhost:8505')) {
          this.isRunning = true;
          resolve('Server started successfully');
        }
      });

      this.server.stderr.on('data', (data) => {
        console.error('Streamlit stderr:', data.toString());
      });

      this.server.on('close', (code) => {
        console.log(`Streamlit process exited with code ${code}`);
        this.isRunning = false;
      });

      this.server.on('error', (error) => {
        console.error('Failed to start Streamlit server:', error);
        reject(error);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!this.isRunning) {
          reject(new Error('Server startup timeout'));
        }
      }, 30000);
    });
  }

  stopServer() {
    return new Promise((resolve) => {
      if (this.server && this.isRunning) {
        console.log('Stopping Streamlit server...');
        this.server.kill('SIGTERM');

        // Force kill after 5 seconds
        setTimeout(() => {
          if (this.server) {
            this.server.kill('SIGKILL');
          }
        }, 5000);

        this.server.on('close', () => {
          this.isRunning = false;
          resolve('Server stopped');
        });
      } else {
        resolve('Server not running');
      }
    });
  }

  checkStatus() {
    return new Promise((resolve) => {
      exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:8505', (error, stdout) => {
        if (error) {
          resolve(false);
        } else {
          resolve(stdout.trim() === '200');
        }
      });
    });
  }
}

// CLI interface
if (require.main === module) {
  const manager = new StreamlitManager();
  const command = process.argv[2];

  switch (command) {
    case 'start':
      manager.startServer()
        .then(result => {
          console.log(result);
          process.exit(0);
        })
        .catch(error => {
          console.error('Error:', error.message);
          process.exit(1);
        });
      break;

    case 'stop':
      manager.stopServer()
        .then(result => {
          console.log(result);
          process.exit(0);
        });
      break;

    case 'status':
      manager.checkStatus()
        .then(isRunning => {
          console.log(isRunning ? 'Server is running' : 'Server is not running');
          process.exit(isRunning ? 0 : 1);
        });
      break;

    default:
      console.log('Usage: node streamlit-manager.js [start|stop|status]');
      process.exit(1);
  }
}

module.exports = StreamlitManager;