import { t } from '../../locales/index.js';
import { SOURCE_TYPE_GROUP } from '../../services/line.js';

class Source {
  type;
      
  userId;

  pictureUrl;

  name;

  statusMessage;

  bot;

  createdAt;

  constructor({
    type,
    pictureUrl,
    userId,
    name,
    statusMessage,
    bot,
  }) {
    this.type = type;
    this.pictureUrl = pictureUrl;
    this.userId = userId;
    this.name = name || (type === SOURCE_TYPE_GROUP ? t('__SOURCE_NAME_SOME_GROUP') : t('__SOURCE_NAME_SOMEONE'));
    this.statusMessage = statusMessage;
    this.bot = bot;
    this.createdAt = Math.floor(Date.now() / 1000);
  }
}

export default Source;
