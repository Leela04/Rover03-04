import { 
  users, type User, type InsertUser,
  customers, type Customer, type InsertCustomer,
  roverCustomerMatrix, type RoverCustomerMatrix, type InsertRoverCustomerMatrix, 
  rovers, type Rover, type InsertRover,
  trips, type Trip, type InsertTrip,
  sensorData, type SensorData, type InsertSensorData,
  commandLogs, type CommandLog, type InsertCommandLog,
  roverClients, type RoverClient, type InsertRoverClient
} from "@shared/schema";
import { MySqlStorage } from './mysql-storage';
import { initializeDatabase } from './db';
import { log } from './vite';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '@shared/schema';

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customer operations
  getCustomer(id: number): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer | undefined>;
  
  // Rover-Customer Matrix operations
  getRoverCustomerMatrix(id: number): Promise<RoverCustomerMatrix | undefined>;
  getRoverCustomerMatrixByRoverId(roverId: number): Promise<RoverCustomerMatrix | undefined>;
  getRoverCustomerMatrixByCustomerId(customerId: number): Promise<RoverCustomerMatrix[]>;
  createRoverCustomerMatrix(entry: InsertRoverCustomerMatrix): Promise<RoverCustomerMatrix>;
  updateRoverCustomerMatrix(id: number, entry: Partial<RoverCustomerMatrix>): Promise<RoverCustomerMatrix | undefined>;
  
  // Rover operations
  getRover(id: number): Promise<Rover | undefined>;
  getRoverByIdentifier(identifier: string): Promise<Rover | undefined>;
  getAllRovers(): Promise<Rover[]>;
  getRoversByMatrixId?(matrixId: number): Promise<Rover[]>;
  createRover(rover: InsertRover): Promise<Rover>;
  updateRover(id: number, rover: Partial<Rover>): Promise<Rover | undefined>;
  
  // Trip operations
  getTrip(id: number): Promise<Trip | undefined>;
  getTripsByRoverId(roverId: number, limit?: number): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: number, trip: Partial<Trip>): Promise<Trip | undefined>;
  
  // Sensor data operations
  getSensorData(id: number): Promise<SensorData | undefined>;
  getSensorDataByRoverId(roverId: number, limit?: number): Promise<SensorData[]>;
  getSensorDataByTripId(tripId: number, limit?: number): Promise<SensorData[]>;
  createSensorData(data: InsertSensorData): Promise<SensorData>;
  
  // Command log operations
  getCommandLog(id: number): Promise<CommandLog | undefined>;
  getCommandLogsByRoverId(roverId: number, limit?: number): Promise<CommandLog[]>;
  createCommandLog(log: InsertCommandLog): Promise<CommandLog>;
  updateCommandLog(id: number, log: Partial<CommandLog>): Promise<CommandLog | undefined>;
  
  // Rover client operations
  getRoverClient(id: number): Promise<RoverClient | undefined>;
  getRoverClientByRoverId(roverId: number): Promise<RoverClient | undefined>;
  getRoverClientBySocketId(socketId: string): Promise<RoverClient | undefined>;
  getAllRoverClients(): Promise<RoverClient[]>;
  createRoverClient(client: InsertRoverClient): Promise<RoverClient>;
  updateRoverClient(id: number, client: Partial<RoverClient>): Promise<RoverClient | undefined>;
  deleteRoverClient(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private roverCustomerMatrices: Map<number, RoverCustomerMatrix>;
  private rovers: Map<number, Rover>;
  private trips: Map<number, Trip>;
  private sensorDataItems: Map<number, SensorData>;
  private commandLogs: Map<number, CommandLog>;
  private roverClients: Map<number, RoverClient>;
  
  private userCurrentId: number;
  private customerCurrentId: number;
  private matrixCurrentId: number;
  private roverCurrentId: number;
  private tripCurrentId: number;
  private sensorDataCurrentId: number;
  private commandLogCurrentId: number;
  private roverClientCurrentId: number;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.roverCustomerMatrices = new Map();
    this.rovers = new Map();
    this.trips = new Map();
    this.sensorDataItems = new Map();
    this.commandLogs = new Map();
    this.roverClients = new Map();
    
    this.userCurrentId = 1;
    this.customerCurrentId = 1;
    this.matrixCurrentId = 1;
    this.roverCurrentId = 1;
    this.tripCurrentId = 1;
    this.sensorDataCurrentId = 1;
    this.commandLogCurrentId = 1;
    this.roverClientCurrentId = 1;
    
    // Add a sample customer
    const customer = this.createCustomer({
      companyName: "ABC Industries",
      location: "New York",
      contactPerson: "John Smith",
      contactEmail: "john@example.com",
      contactPhone: "555-123-4567"
    });
    
    // Add some sample rovers
    // this.createRover({
    //   name: "Rover Alpha",
    //   identifier: "R-001",
    //   ipAddress: "192.168.1.101",
    //   matrixId: 1
    // });
    
    // this.createRover({
    //   name: "Rover Beta",
    //   identifier: "R-002",
    //   ipAddress: "192.168.1.102",
    //   matrixId: 1
    // });
    
    // this.createRover({
    //   name: "Rover Delta",
    //   identifier: "R-004",
    //   ipAddress: "192.168.1.104",
    //   matrixId: 1
    // });
    
    log('Using in-memory storage', 'storage');
  }
  
  // Customer operations
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }
  
  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }
  
  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.customerCurrentId++;
    const now = new Date();
    const customer: Customer = { 
      id,
      companyName: insertCustomer.companyName,
      location: insertCustomer.location,
      contactPerson: insertCustomer.contactPerson || null,
      contactEmail: insertCustomer.contactEmail || null,
      contactPhone: insertCustomer.contactPhone || null,
      createdAt: now, 
      updatedAt: now 
    };
    this.customers.set(id, customer);
    return customer;
  }
  
  async updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer | undefined> {
    const existingCustomer = await this.getCustomer(id);
    if (!existingCustomer) return undefined;
    
    const updatedCustomer = { 
      ...existingCustomer, 
      ...customer, 
      updatedAt: new Date() 
    };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }
  
  // Rover-Customer Matrix operations
  async getRoverCustomerMatrix(id: number): Promise<RoverCustomerMatrix | undefined> {
    return this.roverCustomerMatrices.get(id);
  }
  
  async getRoverCustomerMatrixByRoverId(roverId: number): Promise<RoverCustomerMatrix | undefined> {
    return Array.from(this.roverCustomerMatrices.values()).find(
      matrix => matrix.roverId === roverId.toString()
    );
  }
  
  async getRoverCustomerMatrixByCustomerId(customerId: number): Promise<RoverCustomerMatrix[]> {
    return Array.from(this.roverCustomerMatrices.values())
      .filter(matrix => matrix.customerId === customerId);
  }
  
  async createRoverCustomerMatrix(insertMatrix: InsertRoverCustomerMatrix): Promise<RoverCustomerMatrix> {
    const id = this.matrixCurrentId++;
    const matrix: RoverCustomerMatrix = { 
      ...insertMatrix, 
      id, 
      assignmentDate: new Date(),
      isActive: insertMatrix.isActive ?? true
    };
    this.roverCustomerMatrices.set(id, matrix);
    return matrix;
  }
  
  async updateRoverCustomerMatrix(id: number, matrix: Partial<RoverCustomerMatrix>): Promise<RoverCustomerMatrix | undefined> {
    const existingMatrix = await this.getRoverCustomerMatrix(id);
    if (!existingMatrix) return undefined;
    
    const updatedMatrix = { ...existingMatrix, ...matrix };
    this.roverCustomerMatrices.set(id, updatedMatrix);
    return updatedMatrix;
  }
  
  // Trip operations
  async getTrip(id: number): Promise<Trip | undefined> {
    return this.trips.get(id);
  }
  
  async getTripsByRoverId(roverId: number, limit = 100): Promise<Trip[]> {
    return Array.from(this.trips.values())
      .filter(trip => trip.roverId === roverId)
      .sort((a, b) => {
        const timeA = a.startTime?.getTime() || 0;
        const timeB = b.startTime?.getTime() || 0;
        return timeB - timeA;
      })
      .slice(0, limit);
  }
  
  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const id = this.tripCurrentId++;
    const now = new Date();
    
    const trip: Trip = {
      id,
      roverId: insertTrip.roverId,
      startTime: now,
      endTime: null,
      startLatitude: insertTrip.startLatitude || null,
      startLongitude: insertTrip.startLongitude || null,
      endLatitude: null,
      endLongitude: null,
      distanceTraveled: 0,
      avgSpeed: null,
      maxSpeed: null,
      status: "in_progress",
      notes: null
    };
    
    this.trips.set(id, trip);
    return trip;
  }
  
  async updateTrip(id: number, trip: Partial<Trip>): Promise<Trip | undefined> {
    const existingTrip = await this.getTrip(id);
    if (!existingTrip) return undefined;
    
    const updatedTrip = { ...existingTrip, ...trip };
    this.trips.set(id, updatedTrip);
    return updatedTrip;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Rover operations
  async getRover(id: number): Promise<Rover | undefined> {
    return this.rovers.get(id);
  }
  
  async getRoverByIdentifier(identifier: string): Promise<Rover | undefined> {
    return Array.from(this.rovers.values()).find(
      (rover) => rover.identifier === identifier
    );
  }
  
  async getAllRovers(): Promise<Rover[]> {
    return Array.from(this.rovers.values());
  }
  
  async createRover(insertRover: InsertRover): Promise<Rover> {
    const id = this.roverCurrentId++;
    const now = new Date();
    
    const rover: Rover = { 
      ...insertRover, 
      id, 
      connected: false, 
      status: "disconnected",
      batteryLevel: 100,
      lastSeen: now,
      ipAddress: insertRover.ipAddress || null,
      currentLatitude: null,
      currentLongitude: null,
      currentAltitude: null,
      totalDistanceTraveled: 0,
      totalTrips: 0,
      createdAt: now,
      updatedAt: now,
      metadata: {}
    };
    this.rovers.set(id, rover);
    return rover;
  }
  
  async updateRover(id: number, rover: Partial<Rover>): Promise<Rover | undefined> {
    const existingRover = await this.getRover(id);
    if (!existingRover) return undefined;
    
    const updatedRover = { ...existingRover, ...rover };
    this.rovers.set(id, updatedRover);
    return updatedRover;
  }
  
  // Sensor data operations
  async getSensorData(id: number): Promise<SensorData | undefined> {
    return this.sensorDataItems.get(id);
  }
  
  async getSensorDataByRoverId(roverId: number, limit = 100): Promise<SensorData[]> {
    return Array.from(this.sensorDataItems.values())
      .filter(data => data.roverId === roverId)
      .sort((a, b) => {
        // Handle potential null timestamps
        const timeA = a.timestamp?.getTime() || 0;
        const timeB = b.timestamp?.getTime() || 0;
        return timeB - timeA;
      })
      .slice(0, limit);
  }
  
  async getSensorDataByTripId(tripId: number, limit = 100): Promise<SensorData[]> {
    return Array.from(this.sensorDataItems.values())
      .filter(data => data.tripId === tripId)
      .sort((a, b) => {
        // Handle potential null timestamps
        const timeA = a.timestamp?.getTime() || 0;
        const timeB = b.timestamp?.getTime() || 0;
        return timeB - timeA;
      })
      .slice(0, limit);
  }
  
  async createSensorData(insertData: InsertSensorData): Promise<SensorData> {
    const id = this.sensorDataCurrentId++;
    
    // Ensure all fields have proper values according to schema
    const data: SensorData = {
      id,
      roverId: insertData.roverId,
      timestamp: new Date(),
      batteryLevel: insertData.batteryLevel || null,
      temperature: insertData.temperature || null,
      humidity: insertData.humidity || null,
      pressure: insertData.pressure || null,
      altitude: insertData.altitude || null,
      heading: insertData.heading || null,
      speed: insertData.speed || null,
      tilt: insertData.tilt || null,
      latitude: insertData.latitude || null,
      longitude: insertData.longitude || null,
      signalStrength: insertData.signalStrength || null,
      tripId: insertData.tripId || null
    };
    
    this.sensorDataItems.set(id, data);
    return data;
  }
  
  // Command log operations
  async getCommandLog(id: number): Promise<CommandLog | undefined> {
    return this.commandLogs.get(id);
  }
  
  async getCommandLogsByRoverId(roverId: number, limit = 100): Promise<CommandLog[]> {
    return Array.from(this.commandLogs.values())
      .filter(log => log.roverId === roverId)
      .sort((a, b) => {
        // Handle potential null timestamps
        const timeA = a.timestamp?.getTime() || 0;
        const timeB = b.timestamp?.getTime() || 0;
        return timeB - timeA;
      })
      .slice(0, limit);
  }
  
  async createCommandLog(insertLog: InsertCommandLog): Promise<CommandLog> {
    const id = this.commandLogCurrentId++;
    
    const log: CommandLog = {
      id,
      roverId: insertLog.roverId,
      command: insertLog.command,
      timestamp: new Date(),
      status: insertLog.status || null,
      response: insertLog.response || null,
      tripId: insertLog.tripId || null,
      userId: insertLog.userId || null
    };
    
    this.commandLogs.set(id, log);
    return log;
  }
  
  async updateCommandLog(id: number, log: Partial<CommandLog>): Promise<CommandLog | undefined> {
    const existingLog = await this.getCommandLog(id);
    if (!existingLog) return undefined;
    
    const updatedLog = { ...existingLog, ...log };
    this.commandLogs.set(id, updatedLog);
    return updatedLog;
  }
  
  // Rover client operations
  async getRoverClient(id: number): Promise<RoverClient | undefined> {
    return this.roverClients.get(id);
  }
  
  async getRoverClientByRoverId(roverId: number): Promise<RoverClient | undefined> {
    return Array.from(this.roverClients.values()).find(
      client => client.roverId === roverId
    );
  }
  
  async getRoverClientBySocketId(socketId: string): Promise<RoverClient | undefined> {
    return Array.from(this.roverClients.values()).find(
      client => client.socketId === socketId
    );
  }
  
  async getAllRoverClients(): Promise<RoverClient[]> {
    return Array.from(this.roverClients.values());
  }
  
  async createRoverClient(insertClient: InsertRoverClient): Promise<RoverClient> {
    const id = this.roverClientCurrentId++;
    const now = new Date();
    
    const client: RoverClient = {
      id,
      roverId: insertClient.roverId,
      lastPing: now,
      connected: insertClient.connected || null,
      socketId: insertClient.socketId || null,
      connectTime: now,
      disconnectTime: null
    };
    
    this.roverClients.set(id, client);
    return client;
  }
  
  async updateRoverClient(id: number, client: Partial<RoverClient>): Promise<RoverClient | undefined> {
    const existingClient = await this.getRoverClient(id);
    if (!existingClient) return undefined;
    
    const updatedClient = { ...existingClient, ...client };
    this.roverClients.set(id, updatedClient);
    return updatedClient;
  }
  
  async deleteRoverClient(id: number): Promise<boolean> {
    return this.roverClients.delete(id);
  }
}

// Default to in-memory storage initially
let storageImplementation: IStorage = new MemStorage();

/**
 * Initialize storage system based on environment configuration
 * If DATABASE_URL is provided, MySQL will be used
 * Otherwise, in-memory storage will be used
 */
export async function initializeStorage(): Promise<IStorage> {
  // Try to initialize MySQL database
  const db = await initializeDatabase();
  
  // If database connection was successful, use MySQL storage
  if (db) {
    log('Switching to MySQL storage', 'storage');
    storageImplementation = new MySqlStorage(db);
  }
  
  return storageImplementation;
}

// Export a reference to the current storage implementation
export const storage: IStorage = storageImplementation;
