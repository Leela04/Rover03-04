/**
 * This file demonstrates how a rover client would be implemented.
 * In a real implementation, this would typically run on the rover hardware 
 * and could use rclnodejs to communicate with ROS2.
 * 
 * This is a simplified implementation for demonstration purposes.
 */

import WebSocket from 'ws';

interface SensorData {
  temperature?: number;
  humidity?: number;
  pressure?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  tilt?: number;
  latitude?: number;
  longitude?: number;
  batteryLevel?: number;
  signalStrength?: number;
}

class RoverClient {
  private ws: WebSocket | null = null;
  private roverId: number | null = null;
  private roverIdentifier: string;
  private serverUrl: string;
  private connected = false;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  
  constructor(serverUrl: string, roverIdentifier: string) {
    this.serverUrl = serverUrl;
    this.roverIdentifier = roverIdentifier;
  }
  
  async initialize() {
    try {
      console.log(`Initializing rover client ${this.roverIdentifier}`);
      
      // Connect to server
      this.connect();
    } catch (error) {
      console.error('Failed to initialize rover client:', error);
    }
  }
  
  private connect() {
    if (this.ws) {
      this.ws.terminate();
      this.ws = null;
    }
    
    this.ws = new WebSocket(this.serverUrl);
    
    this.ws.on('open', () => {
      console.log('Connected to server');
      this.connected = true;
      
      // Send connection message
      this.sendMessage({
        type: 'CONNECT',
        payload: {
          type: 'rover',
          identifier: this.roverIdentifier
        }
      });
      
      // Set up ping interval to keep connection alive
      this.pingInterval = setInterval(() => {
        this.sendSensorData();
      }, 2000);
    });
    
    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    });
    
    this.ws.on('close', () => {
      console.log('Disconnected from server');
      this.connected = false;
      this.roverId = null;
      
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
      
      // Attempt to reconnect
      if (!this.reconnectInterval) {
        this.reconnectInterval = setInterval(() => {
          console.log('Attempting to reconnect...');
          this.connect();
        }, 5000);
      }
    });
    
    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }
  
  private handleMessage(message: any) {
    switch (message.type) {
      case 'CONNECT':
        // Handle connection response
        if (message.payload.success) {
          console.log('Connection successful');
          this.roverId = message.payload.roverId;
          
          if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
          }
        }
        break;
      
      case 'COMMAND':
        // Handle command request
        this.handleCommand(message);
        break;
      
      case 'ERROR':
        console.error('Server error:', message.payload);
        break;
    }
  }
  
  private handleCommand(message: any) {
    const command = message.payload.command;
    const commandId = message.payload.commandId;
    
    console.log(`Received command: ${command} (ID: ${commandId})`);
    
    // Process command
    let response = '';
    let status = 'success';
    
    try {
      // Parse and execute command
      const parts = command.split(' ');
      const action = parts[0].toLowerCase();
      
      switch (action) {
        case 'move':
          // Handle movement command
          const direction = parts[1];
          const distance = parseFloat(parts[2]);
          
          console.log(`Moving ${direction} ${distance} units`);
          response = `Moving ${direction} ${distance} units`;
          
          // In a real implementation, this would communicate with the rover's movement system
          // Here we just log the command
          break;
        
        case 'stop':
          console.log('Emergency stop');
          response = 'Emergency stop engaged';
          
          // In a real implementation, this would communicate with the rover's movement system
          // Here we just log the command
          break;
        
        case 'camera':
          // Handle camera command
          const cameraAction = parts[1];
          response = `Camera ${cameraAction} command executed`;
          break;
        
        default:
          response = `Unknown command: ${action}`;
          status = 'failed';
      }
    } catch (error) {
      console.error('Command execution error:', error);
      status = 'failed';
      response = `Error executing command: ${(error as Error).message}`;
    }
    
    // Send response back to server
    this.sendMessage({
      type: 'COMMAND',
      roverId: this.roverId,
      payload: {
        commandId,
        status,
        response
      }
    });
  }
  
  private generateSensorData(): SensorData {
    // In a real implementation, this would read from actual sensors via ROS2
    // Here we're generating mock data for demonstration
    return {
      temperature: 23.4 + (Math.random() * 2 - 1), // 22.4 to 24.4 °C
      humidity: 42 + (Math.random() * 6 - 3), // 39% to 45%
      pressure: 1013 + (Math.random() * 10 - 5), // 1008 to 1018 hPa
      altitude: 124 + (Math.random() * 4 - 2), // 122m to 126m
      heading: 275 + (Math.random() * 10 - 5), // 270° to 280°
      speed: 0.4 + (Math.random() * 0.2 - 0.1), // 0.3 to 0.5 m/s
      tilt: 2.1 + (Math.random() * 1 - 0.5), // 1.6° to 2.6°
      latitude: 34.0522 + (Math.random() * 0.001 - 0.0005), // Small variation
      longitude: -118.2437 + (Math.random() * 0.001 - 0.0005), // Small variation
      batteryLevel: 87 - (Math.random() * 0.1), // Slowly decreasing battery
      signalStrength: 85 + (Math.random() * 10 - 5) // 80% to 90%
    };
  }
  
  private sendSensorData() {
    if (!this.connected || !this.roverId) return;
    
    // Get sensor data
    const sensorData = this.generateSensorData();
    
    // Send telemetry data to server
    this.sendMessage({
      type: 'TELEMETRY',
      roverId: this.roverId,
      payload: {
        sensorData
      }
    });
    
    // Update rover status
    this.sendMessage({
      type: 'STATUS_UPDATE',
      roverId: this.roverId,
      payload: {
        status: 'active'
      }
    });
  }
  
  private sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
  
  async shutdown() {
    // Clear intervals
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    // Close WebSocket connection
    if (this.ws) {
      this.ws.terminate();
      this.ws = null;
    }
    
    // In a real implementation, we would clean up any hardware resources here
    
    console.log('Rover client shutdown complete');
  }
}

// Example usage
const SERVER_URL = process.env.SERVER_URL || 'ws://localhost:5000/ws';
const ROVER_ID = process.env.ROVER_ID || 'R-001';

const roverClient = new RoverClient(SERVER_URL, ROVER_ID);
roverClient.initialize().catch(console.error);

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Shutting down rover client...');
  await roverClient.shutdown();
  process.exit(0);
});
