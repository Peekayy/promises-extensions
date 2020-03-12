/**Runs Promise returning task over and over until it succeeds or maximum attempts is reached, with an optional delay between attempts.
 * @param task A function - must return a Promise
 * @param maxAttempts Number of retries for the given task. Defaults to 10.
 * @param delay Delay between retries in ms. Defaults to 200ms;
 */
Promise.retry = function(task, maxAttempts, delay) {
    maxAttempts = maxAttempts || maxAttempts === 0 ? maxAttempts : 10;
    delay = delay || 200;
    return task().catch(function(err) {
        if (maxAttempts) {
            console.log("Promise failed, retrying... " + maxAttempts + " attempts left.", err);
            return Promise.delay(delay).then(function() {
                return Promise.retry(task, maxAttempts - 1, delay);
            });
        } else {
            console.log("Reached max attempts.");
            return Promise.reject(err);
        }
    });
};

/**Inserts a timeout in promises chain.
 *
 * @param timeout Timeout duration in ms.
 */
Promise.prototype.delay = function(timeout) {
    return this.then(function(value) {
        return new Promise(function(resolve) {
            setTimeout(function() {
                resolve(value);
            }, timeout);
        });
    });
};

/**Returns a new Promise which will resolve in specified delay.
 * @param delay Delay in ms before executing promise.
 * */
Promise.delay = function(delay) {
    return Promise.resolve().delay(delay);
};

if (!Promise.prototype.finally) {
    /**
     * Does the same action for then and catch
     */
    Promise.prototype.finally = function(f) {
        return this.then(function(value) {
            return Promise.resolve(f()).then(function() {
                return value;
            });
        }, function(err) {
            return Promise.resolve(f()).then(function() {
                return Promise.reject(err);
            });
        });
    };
}

/** Behaves like Promise.all but takes a map of promises as input instead.
 * Outputs a new map sharing the same keys linked to the promises results.
 * @param {Map<String,Promise>} map
 * @returns {Promise<Map<String,*>>}
 */
Promise.mappedAll = function(map) {
    return Promise.all(map.values()).then(function(results) {
        const resultMap = new Map();
        const keys = map.keys();
        for (let i = 0; i < map.size; i++) {
            resultMap.set(keys.next().value, results[i]);
        }
        return resultMap;
    });
};

/** Creates a deferred object to be resolved or rejected manually later.
 *
 * @return {{promise: Promise, resolve: function, reject: function}}
 */
Promise.defer = () => {
    let res, rej;
    const promise = new Promise(function(resolve, reject) {
        res = resolve;
        rej = reject;
    });
    return {
        promise: promise,
        resolve: res,
        reject: rej
    };
};
