import express from 'express';
import { handleEvents, printPrompts } from '../app/index.js';
import config from '../config/index.js';
import { validateLineSignature } from '../middleware/index.js';
import storage from '../storage/index.js';
import { fetchVersion, getVersion } from '../utils/index.js';
import { getUsers, addUser, getStopBotUserId, addStopUser, removeStopUser } from '../app/repository/monitor.js';

const app = express();

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  },
}));

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
  res.sendfile('./api/monitor.html');
});

app.post(config.APP_WEBHOOK_PATH, validateLineSignature, async (req, res) => {
  try {
    await storage.initialize();
    await handleEvents(req.body.events);
    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
  if (config.APP_DEBUG) printPrompts();
});

app.get('/users', async (req, res) => {
  try {
    await storage.initialize();
    const u = getUsers();
    res.status(200).send(u);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
  if (config.APP_DEBUG) printPrompts();
});

app.get('/addUser', async (req, res) => {
  try {
    addUser({
      displayName: "TEST",
      userId: "abcd12345",
      pictureUrl: "",
      statusMessage: "active",
      lastMessageTime: new Date()
    });
    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
  if (config.APP_DEBUG) printPrompts();
});

app.get('/stopUsers', async (req, res) => {
  try {
    const u = getStopBotUserId();
    res.status(200).send(u);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
  if (config.APP_DEBUG) printPrompts();
});

app.post('/addStopUser/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    addStopUser(userId);
    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
  if (config.APP_DEBUG) printPrompts();
});

app.delete('/removeStopUser/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    removeStopUser(userId);
    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
  if (config.APP_DEBUG) printPrompts();
});



if (config.APP_PORT) {
  app.listen(config.APP_PORT);
}

export default app;
