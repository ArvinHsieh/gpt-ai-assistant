import storage from '../../storage/index.js';
import { Monitor, UserInfo } from '../models/index.js';

const FIELD_KEY = 'Monitor';
const REDIS_HASHKEY = 'monitor';

/**
 * @returns {Object.<string, UserInfo>}
 */
const getUsers = () => {
  const monitor = storage.getItem(FIELD_KEY) || {};
  if ("users" in monitor) {
    return monitor.users.sort(x => x.lastMessageTime);
  } else {
    return [];
  }
}

/**
 * @param {Object.<string, UserInfo>} UserInfo
 */
const addUser = (userInfo) => {
  var monitor = storage.getItem(FIELD_KEY) || {};
  if ("users" in monitor) {
    var index = monitor.users.findIndex(x => x.userId == userInfo.userId);
    if (index != -1) {
      monitor.users.splice(index, 1);
      monitor.users.push(userInfo);
    }
    return;
  } else {
    monitor["users"] = [];
    monitor.users.push(userInfo);
  }
  storage.setItem(FIELD_KEY, monitor);
};

/**
 * @returns {Object.<string, UserInfo>}
 */
const getStopBotUserId = () => {
  const monitor = storage.getItem(FIELD_KEY) || {};
  if ("stopBotUserId" in monitor) {
    return monitor.stopBotUserId;
  } else {
    return [];
  }
}

/**
 * @param {Object.<string, string>} UserInfo
 */
const addStopUser = (userId) => {
  var monitor = storage.getItem(FIELD_KEY) || {};
  if ("stopBotUserId" in monitor) {
    var index = monitor.stopBotUserId.indexOf(userId);
    if (index != -1) {
      return;
    } else {
      monitor.stopBotUserId.push(userId);
    }
  } else {
    monitor["stopBotUserId"] = [];
    monitor.stopBotUserId.push(userId);
  }
  storage.setItem(FIELD_KEY, monitor);
};

/**
 * @param {Object.<string, string>} UserInfo
 */
const removeStopUser = (userId) => {
  var monitor = storage.getItem(FIELD_KEY) || {};
  if ("stopBotUserId" in monitor) {
    const index = monitor.stopBotUserId.indexOf(userId);
    if (index != -1) {
      monitor.stopBotUserId.splice(userId, 1);
    }
  }
};

const getUsersByRedis = async (redisClient) => {
  const users = await redisClient.hGetAll(`${REDIS_HASHKEY}:users`) || {};
  if (users) {
    return Object.entries(users).map(value => JSON.parse(value[1]));
  } else {
    return [];
  }
}

const addUserByRedis = async (userInfo, redisClient) => {
  return await redisClient.hSet(`${REDIS_HASHKEY}:users`, userInfo.userId, JSON.stringify(userInfo));
};

const removeUserByRedis = async (userId, redisClient) => {
  return await redisClient.hDel(`${REDIS_HASHKEY}:users`, userId);
};

/**
 * @returns {[{key, value}]>}
 */
const getStopBotUsersIdByRedis = async (redisClient) => {
  const stop_bot_users = await redisClient.hGetAll(`${REDIS_HASHKEY}:stop_bot_users`) || {};
  if (stop_bot_users) {
    return Object.entries(stop_bot_users).map(([key, value]) => ({key,value}));
  } else {
    return [];
  }
}

/**
 * @param {Object.<string, string>} userId
 */
const addStopBotUserByRedis = async (userId, redisClient) => {
  const tk = new Date().getTime();
  return await redisClient.hSet(`${REDIS_HASHKEY}:stop_bot_users`, userId, tk);
};

/**
 * @param {Object.<string, string>} userId
 */
const removeStopUserByRedis = async (userId, redisClient) => {
  return await redisClient.hDel(`${REDIS_HASHKEY}:stop_bot_users`, userId);
};

export {
  getUsers,
  addUser,
  getStopBotUserId,
  addStopUser,
  removeStopUser,
  getUsersByRedis,
  addUserByRedis,
  removeUserByRedis,
  getStopBotUsersIdByRedis,
  addStopBotUserByRedis,
  removeStopUserByRedis
};
