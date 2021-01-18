/**
 * Runs Promise returning task over and over until it succeeds or maximum attempts is reached, with an optional delay between attempts.
 * @param task A function - must return a Promise
 * @param maxAttempts Number of retries for the given task. Defaults to 10.
 * @param retryTimeout Delay between retries in ms. Defaults to 200ms;
 */
export async function retry<T = any>(task: () => Promise<T>, maxAttempts: number = 10, retryTimeout: number = 200): Promise<T> {
    try {
        return await task();
    } catch (err) {
        if (maxAttempts) {
            await delay(delay);
            return retry(task, maxAttempts - 1, retryTimeout);
        } else {
            return Promise.reject(err);
        }
    }
}

/**
 * Returns a new Promise which will resolve in specified delay.
 * @param delay Delay in ms before executing promise.
 * */
export async function delay(delay): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    });
}

/**
 * Behaves like Promise.all but takes a map of promises as input instead.
 * Outputs a new map sharing the same keys linked to the promises results.
 */
export async function mappedAll<T = any>(map: Map<string, T>): Promise<Map<string, T>> {
    const results = await Promise.all(map.values());
    const resultMap = new Map();
    const keys = map.keys();
    for (let i = 0; i < map.size; i++) {
        resultMap.set(keys.next().value, results[i]);
    }
    return resultMap;
}

export interface IDeferObject<T> {
    promise: Promise<T>,

    resolve(value: T | PromiseLike<T>): void

    reject(reason: any): void
}

/** Creates a deferred object to be resolved or rejected manually later.
 *
 * @return {{promise: Promise, resolve: function, reject: function}}
 */
export function defer<T = any>(): IDeferObject<T> {
    let res, rej;
    const promise = new Promise<T>(function (resolve, reject) {
        res = resolve;
        rej = reject;
    });
    return {
        promise,
        resolve: res,
        reject: rej
    };
}
