import Context from '../context.js';
import { getStopBotUsersIdByRedis } from '../repository/monitor.js';
import { checkIncludeStopBotByRestApi } from '../repository/monitor-restapi.js';

/**
 * @param {Context} context
 * @returns {boolean}
 */
const check = async (context) => {
  const exist = await checkIncludeStopBotByRestApi(context.redisClient, context.userId);
  return exist;
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
