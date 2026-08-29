const redis = require("redis");
const redisClient = redis.createClient({
    username: 'default',
    password: process.env.REDIS_KEY,
   socket: {
        host: 'redis-12163.c246.us-east-1-4.ec2.cloud.redislabs.com',
        port: 12163
   }
});
async function redisC() {
 redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
}
module.exports = {redisC,redisClient};
