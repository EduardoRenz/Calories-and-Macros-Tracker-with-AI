/**
 * ConcurrencyRequestManager ensures that multiple concurrent requests for the same
 * resource (identified by a unique key) share the same promise, preventing
 * redundant operations.
 */
export class ConcurrencyRequestManager {
    private inFlightRequests: Map<string, Promise<any>> = new Map();

    /**
     * Runs a task or returns an existing in-flight promise if the key matches.
     * @param key A unique identifier for the request (e.g., URL + params + body)
     * @param task A function that returns a promise for the actual operation
     * @returns The result of the operation
     */
    async run<T>(key: string, task: () => Promise<T>): Promise<T> {
        const existingRequest = this.inFlightRequests.get(key);

        if (existingRequest) {
            console.log(`[ConcurrencyRequestManager] Reusing in-flight request for key: ${key}`);
            return existingRequest;
        }

        const promise = task().finally(() => {
            this.inFlightRequests.delete(key);
        });

        this.inFlightRequests.set(key, promise);
        return promise;
    }
}
