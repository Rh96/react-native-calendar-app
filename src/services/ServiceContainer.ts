/**
 * Service Container
 * Centralized service creation and management using singleton pattern
 * Enables dependency injection and easy mocking for testing
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, any> = new Map();
  private factories: Map<string, () => any> = new Map();

  private constructor() {}

  /**
   * Get singleton instance of ServiceContainer
   */
  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Register a service factory
   * @param key - Unique key for the service
   * @param factory - Factory function that creates the service instance
   */
  register<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory);
  }

  /**
   * Resolve a service instance
   * Creates the instance if it doesn't exist (lazy initialization)
   * @param key - Key of the service to resolve
   * @returns The service instance
   */
  resolve<T>(key: string): T {
    // Return existing instance if available
    if (this.services.has(key)) {
      return this.services.get(key) as T;
    }

    // Create new instance using factory
    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`Service with key "${key}" is not registered`);
    }

    const instance = factory() as T;
    this.services.set(key, instance);
    return instance;
  }

  /**
   * Clear all registered services (useful for testing)
   */
  clear(): void {
    this.services.clear();
    this.factories.clear();
  }

  /**
   * Remove a specific service instance (useful for testing)
   */
  remove(key: string): void {
    this.services.delete(key);
    this.factories.delete(key);
  }
}
