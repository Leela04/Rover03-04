/**
 * Mock implementation of rclnodejs for development purposes.
 * This allows the rover client to work without requiring an actual ROS installation.
 */

export class Publisher {
  private topic: string;
  private messageType: string;

  constructor(messageType: string, topic: string) {
    this.messageType = messageType;
    this.topic = topic;
    console.log(`[MOCK ROS] Created Publisher for ${messageType} on topic ${topic}`);
  }

  publish(message: any): void {
    console.log(`[MOCK ROS] Publishing to ${this.topic}: ${JSON.stringify(message)}`);
  }
}

export class Subscription {
  private topic: string;
  private messageType: string;
  private callback: Function;

  constructor(messageType: string, topic: string, callback: Function) {
    this.messageType = messageType;
    this.topic = topic;
    this.callback = callback;
    console.log(`[MOCK ROS] Created Subscription for ${messageType} on topic ${topic}`);
  }
}

export class Node {
  private name: string;

  constructor(name: string) {
    this.name = name;
    console.log(`[MOCK ROS] Created Node: ${name}`);
  }

  createPublisher(messageType: string, topic: string): Publisher {
    return new Publisher(messageType, topic);
  }

  createSubscription(messageType: string, topic: string, callback: Function): Subscription {
    return new Subscription(messageType, topic, callback);
  }

  spin(): void {
    console.log(`[MOCK ROS] Node ${this.name} is spinning`);
  }

  destroy(): void {
    console.log(`[MOCK ROS] Node ${this.name} destroyed`);
  }
}

export async function init(): Promise<void> {
  console.log('[MOCK ROS] ROS Node initialized (mock implementation)');
  return Promise.resolve();
}

export async function shutdown(): Promise<void> {
  console.log('[MOCK ROS] ROS Node shutdown (mock implementation)');
  return Promise.resolve();
}

export function createNode(name: string): Node {
  return new Node(name);
}