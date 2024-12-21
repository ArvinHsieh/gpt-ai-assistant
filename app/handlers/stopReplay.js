import Context from '../context.js';
import { getUsers, addUser, getStopBotUserId, addStopUser, removeStopUser } from '../repository/monitor.js';

/**
 * @param {Context} context
 * @returns {Promise<Context>}
 */
const exec = (context) => (
  async () => {
    try {
        
        const stopUsers = getStopBotUserId();
        if (stopUsers.length > 0) {
            if (stopUsers.indexOf(context.userId) != -1) {
                context.pushText("");    
            }
        }
    } catch (err) {
      context.pushError(err);
    }
    return context;
  }
)();

export default exec;
