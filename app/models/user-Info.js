class UserInfo {
    displayName;
    userId;
    pictureUrl;
    statusMessage;
    lastMessageTime;

    constructor({
        displayName,
        userId,
        pictureUrl,
        statusMessage,
        lastMessageTime,
    }) {
      this.displayName = displayName;
      this.userId = userId;
      this.pictureUrl = pictureUrl;
      this.statusMessage = statusMessage;
      this.lastMessageTime = lastMessageTime;
    }
  }
  
  export default UserInfo;
  