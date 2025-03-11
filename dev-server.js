const { spawn } = require('child_process');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Setup Next.js
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Start WordPress Playground
function startWPPlayground() {
  console.log('\x1b[36m%s\x1b[0m', '🔄 Starting WordPress Playground server...');
  
  const wpProcess = spawn('npx', ['@wp-playground/cli', 'server', '--blueprint=blueprint.json'], {
    stdio: ['inherit', 'pipe', 'inherit'],
    shell: true
  });

  // Pipe WP Playground output to console with different color
  wpProcess.stdout.on('data', (data) => {
    console.log('\x1b[32m%s\x1b[0m', `[WP Playground] ${data}`);
  });

  wpProcess.on('error', (error) => {
    console.error('\x1b[31m%s\x1b[0m', `Error starting WordPress Playground: ${error.message}`);
  });

  wpProcess.on('close', (code) => {
    if (code !== 0) {
      console.log('\x1b[31m%s\x1b[0m', `WordPress Playground exited with code ${code}`);
    }
  });

  return wpProcess;
}

// Initialize and start both servers
app.prepare().then(() => {
  // Start WordPress Playground server
  const wpProcess = startWPPlayground();
  
  // Start Next.js server
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('\x1b[36m%s\x1b[0m', '🚀 Next.js ready on http://localhost:3000');
    console.log('\x1b[36m%s\x1b[0m', '🌐 Both servers are now running!');
  });

  // Handle termination
  const cleanup = () => {
    console.log('\x1b[36m%s\x1b[0m', '🛑 Shutting down servers...');
    if (wpProcess) {
      wpProcess.kill();
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
});