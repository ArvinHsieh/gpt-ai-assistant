import { GENERAL_COMMANDS } from '../commands/index.js';
import { TYPE_SYSTEM } from '../../constants/command.js';
import Context from '../context.js';
import config from '../../config/index.js';
import Command from '../commands/command.js';
/**
 * @param {Context} context
 * @returns {boolean}
 */
const check = (context) => {
  if (config.IGNORE_WORD == null) return false;
  const keys = config.IGNORE_WORD.split(',');
  const cmd = new Command({
    type: TYPE_SYSTEM,
    label: "",
    text: "關鍵字忽略",
    reply: "",
    aliases: [
      ...keys,
    ],
  });
  
  return context.hasCommand(cmd);
}
/**
 * @param {Context} context
 * @returns {Promise<Context>}
 */
const exec = (context) => check(context) && (
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
