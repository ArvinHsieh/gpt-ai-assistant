import Context from '../context.js';
import { getStopBotUsersIdByRedis } from '../repository/monitor.js';
import { getStopBotUsersIdByRestApi } from '../repository/monitor-restapi.js';

/**
 * @param {Context} context
 * @returns {boolean}
 */
const check = async (context) => {
  const stopBotUsers = await getStopBotUsersIdByRestApi(context.redisClient);
  if (stopBotUsers.length > 0) {
      if (stopBotUsers.filter(x => x.key == context.userId).length > 0) {
           return true;
      }
      return false;
  }
}

/**
 * @param {Context} context
 * @returns {Promise<Context>}
 */
const exec = async (context) => await check(context) && (
  async () => {
    try {
      context.pushText(""); 
    } catch (err) {
      context.pushError(err);
    }
    return context;
  }
)();

export default exec;
