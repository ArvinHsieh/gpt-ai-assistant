import config from '../config/index.js';
import { createEnvironment, ENV_TYPE_PLAIN, updateEnvironment } from '../services/vercel.js';
import { fetchEnvironment } from '../utils/index.js';
import { createClient } from 'redis';

const ENV_KEY = 'APP_STORAGE';

class Storage {
  env;

  data = {};

  redisClient;

  async initialize() {
    if (!config.VERCEL_ACCESS_TOKEN) return;
    this.env = await fetchEnvironment(ENV_KEY);
    if (!this.env) {
      const { data } = await createEnvironment({
        key: ENV_KEY,
        value: JSON.stringify(this.data),
        type: ENV_TYPE_PLAIN,
      });
      this.env = data.created;
    }
    this.data = JSON.parse(this.env.value);
  }

  async initializeRedis() {
    // 創建 Redis 客戶端
    this.redisClient = createClient();
    // 監控連線錯誤
    this.redisClient.on('error', (err) => console.error('Redis Client Error', err));

    await this.redisClient.connect(); // 連接 Redis 伺服器
    console.log('Connected to Redis');
  }

  /**
   * @param {string} key
   * @returns {string}
   */
  getItem(key) {
    return this.data[key];
  }

  /**
   * @param {string} key
   * @param {string} value
   */
  async setItem(key, value) {
    this.data[key] = value;
    if (!config.VERCEL_ACCESS_TOKEN) return;
    await updateEnvironment({
      id: this.env.id,
      value: JSON.stringify(this.data, null, config.VERCEL_ENV ? 0 : 2),
      type: ENV_TYPE_PLAIN,
    });
  }

  async getCache(key) {
    try {
      // 讀取資料 (Read)
      const userData = await client.get(key);
      console.log('Data Read:', JSON.parse(userData)); // { id: 1, name: 'Alice', age: 25 }
    } catch (err) {
      console.error('Redis Client Error:', err);
    }
  }

  async setCache(key, objData) {
    try {
      // 1. 建立資料 (Create)
      await client.set(key, JSON.stringify(objData));
      console.log('Data Created: ....');
    } catch (err) {
      console.error('Redis Client Error:', err);
    }
  }

}

const storage = new Storage();

export default storage;
