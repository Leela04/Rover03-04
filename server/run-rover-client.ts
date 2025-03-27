/**
 * This script can be used to start a simulated rover client that connects to the server.
 * It starts a simplified version of the rover client that sends simulated sensor data.
 */

import { exec } from 'child_process';

// Start the rover client
console.log('Starting simulated rover client...');
exec('npx tsx server/rover-client.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing rover client: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Rover client stderr: ${stderr}`);
    return;
  }
  
  console.log(`Rover client output: ${stdout}`);
});

console.log('Rover client process started in background');
console.log('Press Ctrl+C to exit');

// Keep the script running
process.stdin.resume();

// Handle termination
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  process.exit(0);
});