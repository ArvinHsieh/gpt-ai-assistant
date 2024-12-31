
import express from 'express';
import path from 'path';
import { handleEvents, printPrompts } from '../app/index.js';
import config from '../config/index.js';
import { validateLineSignature, redisMiddleware } from '../middleware/index.js';
import storage from '../storage/index.js';
import { fetchVersion, getVersion } from '../utils/index.js';
import { 
  addUserByRedis,
  removeUserByRedis,
  getStopBotUsersIdByRedis,
  addStopBotUserByRedis,
  removeStopUserByRedis,
 } from '../app/repository/monitor.js';
import { createClient } from 'redis';
import { getUsersByRedis } from '../app/repository/monitor.js';

var redisTimer;
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve('./'), "./views")); // 指定模板檔案位置

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  },
}));

// Redis 客戶端初始化函數，帶自動重連功能
const createRedisClient = () => {
  const client = createClient({
      url: config.REDIS_URL,
      socket: {
          keepAlive: true,
          connectTimeout: 10000,
          reconnectStrategy: (retries) => {
              console.log(`Redis reconnect attempt: ${retries}`);
              if (retries > 10) {
                  console.error('Max reconnect attempts reached. Exiting...');
                  process.exit(1); // 達到最大重連次數，退出程序
              }
              return Math.min(retries * 100, 3000); // 每次重連間隔增加，最大 3 秒
          },
      },
  });

  // 監控錯誤事件
  client.on('error', (err) => {
      console.error('Redis error:', err.message);
  });

  // 監控連線事件
  client.on('connect', () => {
      console.log('Connected to Redis');

      redisTimer = setInterval(async () => {
        try {
            await client.ping();
            //console.log('Ping successful');
        } catch (err) {
            console.error('Redis Ping failed:', err);
        }
      }, 60000); // 每分鐘發送一次 PING
  });

  // 監控重連事件
  client.on('reconnecting', () => {
      console.log('Reconnecting to Redis...');
  });

  // 監控關閉事件
  client.on('end', () => {
      console.log('Redis connection closed');
      clearInterval(redisTimer);
  });

  return client;
};

(async () => {
  // 創建 Redis 客戶端
  const redisClient = createRedisClient();

  try {
      // 連接 Redis
      await redisClient.connect();

      // 將 Redis 客戶端注入到 Express app，供全局使用
      app.locals.redisClient = redisClient;

      app.get('/', async (req, res) => {
        if (config.APP_URL) {
          res.redirect(config.APP_URL);
          return;
        }
        const currentVersion = getVersion();
        const latestVersion = await fetchVersion();
        res.status(200).send({ status: 'OK', currentVersion, latestVersion });
      });
      
      app.get('/monitor', (req, res) => {
        try {
          // const serverVariable = { name: 'John Doe', age: 30 };
          res.render('monitor'); // { data: serverVariable }
        } catch (error) {
          console.error(err.message);
          res.sendStatus(500);
        }
      });
      
      app.post(config.APP_WEBHOOK_PATH, validateLineSignature, redisMiddleware, async (req, res) => {
        try {
          const client = req.redisClient;
          await storage.initialize();
          await handleEvents(req.body.events, client);
          res.sendStatus(200);
        } catch (err) {
          console.error(err.message);
          res.sendStatus(500);
        }
        if (config.APP_DEBUG) printPrompts();
      });
      
      app.get('/users', redisMiddleware, async (req, res) => {
        try {
          const client = req.redisClient;
          const us = await getUsersByRedis(client);
          res.status(200).send(us);
        } catch (err) {
          console.error(err.message);
          res.sendStatus(500);
        }
        if (config.APP_DEBUG) printPrompts();
      });
      
      app.post('/addUser', redisMiddleware, async (req, res) => {
        try {
          const client = req.redisClient;
          const r = await addUserByRedis({
            displayName: "TEST",
            userId: "abcd12345",
            pictureUrl: "",
            statusMessage: "active",
            lastMessageTime: new Date().getTime()
          }, client);
          res.sendStatus(200);
        } catch (err) {
          console.error(err.message);
          res.sendStatus(500);
        }
        if (config.APP_DEBUG) printPrompts();
      });

      app.delete('/removeUser/:id', redisMiddleware, async (req, res) => {
        try {
          const client = req.redisClient;
          const userId = req.params.id;
          const r = await removeUserByRedis(userId, client);
          res.sendStatus(200);
        } catch (err) {
          console.error(err.message);
          res.sendStatus(500);
        }
        if (config.APP_DEBUG) printPrompts();
      });
      
      app.get('/stopUsers', redisMiddleware, async (req, res) => {
        try {
          const client = req.redisClient;
          const u = await getStopBotUsersIdByRedis(client);
          res.status(200).send(u);
        } catch (err) {
          console.error(err.message);
          res.sendStatus(500);
        }
        if (config.APP_DEBUG) printPrompts();
      });
      
      app.post('/addStopUser/:id', redisMiddleware, async (req, res) => {
        try {
          const client = req.redisClient;
          const userId = req.params.id;
          const s = await addStopBotUserByRedis(userId, client);
          res.sendStatus(200);
        } catch (err) {
          console.error(err.message);
          res.sendStatus(500);
        }
        if (config.APP_DEBUG) printPrompts();
      });
      
      app.delete('/removeStopUser/:id', redisMiddleware, async (req, res) => {
        try {
          const client = req.redisClient;
          const userId = req.params.id;
          removeStopUserByRedis(userId, client);
          res.sendStatus(200);
        } catch (err) {
          console.error(err.message);
          res.sendStatus(500);
        }
        if (config.APP_DEBUG) printPrompts();
      });

      // 啟動伺服器
      if (config.APP_PORT) {
        app.listen(config.APP_PORT);
      }
  } catch (err) {
      console.error('Error connecting to Redis:', err);
      process.exit(1); // 無法連線時退出
  }

  // 處理應用退出時的清理工作
  process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    if (app.locals.redisClient) {
      await app.locals.redisClient.quit();
      console.log('Redis client disconnected');
    }
    clearInterval(redisTimer);
    process.exit(0);
  });
})();

export default app;
