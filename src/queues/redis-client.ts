import IORedis from "ioredis";
import config from "../config/config";

interface CustomRedisGlobal extends Global {
  redisClient: IORedis;
}

declare const global: CustomRedisGlobal;

const redisClient =
  global.redisClient ??
  new IORedis({
    host: config.redisHost,
    port: config.redisPort,
    maxRetriesPerRequest: null,
  });

if (!global.redisClient) global.redisClient = redisClient;

export default redisClient;
