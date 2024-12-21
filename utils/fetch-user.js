import config from '../config/index.js';
import { mockUsers } from '../constants/mock.js';
import { t } from '../locales/index.js';
import { fetchProfile } from '../services/line.js';

class User {
  displayName; 
  userId; 
  pictureUrl; 
  statusMessage;

  constructor({
    displayName,
    userId,
    pictureUrl,
    statusMessage
  }) {
    this.displayName = displayName;
    this.userId = userId;
    this.pictureUrl = pictureUrl;
    this.statusMessage = statusMessage;
  }
}

/**
 * @param {string} userId
 * @returns {Promise<User>}
 */
const fetchUser = async (userId) => {
  if (config.APP_ENV !== 'production') return new User(mockUsers[userId]);
  try {
    const { data } = await fetchProfile({ userId });
    return new User(data);
  } catch {
    return new User({ displayName: t('__SOURCE_NAME_SOMEONE') });
  }
};

export default fetchUser;
