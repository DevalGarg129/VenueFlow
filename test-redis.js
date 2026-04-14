const createRedisClient = require('./shared/utils/redis.util');
require('dotenv').config();

console.log('--- Environment Check ---');
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('DOCKER_ENV:', process.env.DOCKER_ENV);

console.log('\n--- Testing Redis Connection Utility ---');
const redis = createRedisClient();

setTimeout(() => {
    process.exit(0);
}, 2000);
