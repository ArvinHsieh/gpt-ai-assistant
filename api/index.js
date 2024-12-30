
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

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve('./'), "./views")); // 指定模板檔案位置

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  },
}));


(async () => {
  // 創建 Redis 客戶端
  const redisClient = createClient({ url: process.env.REDIS_URL });

  // 監控連線錯誤
  redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
  });

  try {
      // 連接 Redis
      await redisClient.connect();
      console.log('Connected to Redis');

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
        // const serverVariable = { name: 'John Doe', age: 30 };
        res.render('monitor'); // { data: serverVariable }
      });
      
      //app.get('/monitor', (req, res) => {
      //  res.sendfile('./api/monitor.html');
      //});
      
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

      setInterval(async () => {
        try {
            await redisClient.ping();
            //console.log('Ping successful');
        } catch (err) {
            console.error('Redis Ping failed:', err);
        }
      }, 60000); // 每分鐘發送一次 PING

      // 啟動伺服器
      if (config.APP_PORT) {
        app.listen(config.APP_PORT);
      }
  } catch (err) {
      console.error('Error connecting to Redis:', err);
      process.exit(1); // 無法連線時退出
  }
})();

export default app;
