const Redis = require('ioredis');
const env = require('./env.js');

const redisClient = new Redis(env('redisURL'));
// const redisClient = new Redis("rediss://default:AVG-AAIjcDFiNjNiOTRkNjYwYTE0NjZkODNlMmNhODNhMGMyMTI3M3AxMA@quick-whale-20926.upstash.io:6379");

redisClient.on("connecting", () => {
    console.log("Redis Connecting...");
})

redisClient.on("connect", () => {
    console.log('redis running on port - ', redisClient.options.port);
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

// Initialize ioredis client
// const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
//     // Optional configuration
//     reconnectOnError: (err) => {
//         console.error('Redis reconnectOnError:', err);
//         return true; // Attempt to reconnect on error
//     },
//     retryStrategy: (times) => {
//         return Math.min(times * 50, 2000); // Reconnect with backoff
//     }
// });

//

module.exports = redisClient;
