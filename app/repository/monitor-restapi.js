const REDIS_HASHKEY = 'monitor';

const getUsersByRestApi = async (redisClient) => {
  const users = await redisClient.hgetall(`${REDIS_HASHKEY}:users`) || {};
  if (users) {
    let d = Object.entries(users).map(value => value[1]);
    d.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    return d;
  } else {
    return [];
  }
}

const addUserByRestApi = async (redisClient, userInfo) => {
  return await redisClient.hset(`${REDIS_HASHKEY}:users`, {[userInfo.userId]: JSON.stringify(userInfo)});
};

const removeUserByRestApi = async (redisClient, userId) => {
  return await redisClient.hdel(`${REDIS_HASHKEY}:users`, userId);
};

const checkIncludeStopBotByRestApi = async (redisClient, userId) => {
  const exist = await redisClient.hexists(`${REDIS_HASHKEY}:stop_bot_users`, userId);
  if (exist) {
    return true;
  } else {
    return false;
  }
}

/**
 * @returns {[{key, value}]>}
 */
const getStopBotUsersIdByRestApi = async (redisClient) => {
  const stop_bot_users = await redisClient.hgetall(`${REDIS_HASHKEY}:stop_bot_users`) || {};
  if (stop_bot_users) {
    let d = Object.entries(stop_bot_users).map(([key, value]) => ({key,value}));
    d.sort((a, b) => b.value - a.value);
    return d;
  } else {
    return [];
  }
}

/**
 * @param {Object.<string, string>} userId
 */
const addStopBotUserByRestApi = async (redisClient, userId) => {
  const tk = new Date().getTime();
  return await redisClient.hset(`${REDIS_HASHKEY}:stop_bot_users`, { [userId]: tk});
};

/**
 * @param {Object.<string, string>} userId
 */
const removeStopUserByRestApi = async (redisClient, userId) => {
  return await redisClient.hdel(`${REDIS_HASHKEY}:stop_bot_users`, ...userId);
};

export {
  getUsersByRestApi,
  addUserByRestApi,
  removeUserByRestApi,
  getStopBotUsersIdByRestApi,
  addStopBotUserByRestApi,
  removeStopUserByRestApi,
  checkIncludeStopBotByRestApi
};
