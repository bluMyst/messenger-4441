export const addMessageToStore = (state, payload) => {
  const { message, sender } = payload;
  // if sender isn't null, that means the message needs to be put in a brand new convo
  // it also means that the sender isn't the current user
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      messages: [message],
    };
    newConvo.latestMessageText = message.text;
    newConvo.unreadCount = 1;
    return [newConvo, ...state];
  }

  return state.map((convo) => {
    if (convo.id === message.conversationId) {
      const convoCopy = { ...convo };
      convoCopy.messages = [...convo.messages, message];
      convoCopy.latestMessageText = message.text;

      if (message.senderId === convo.otherUser.id) {
        convoCopy.unreadCount++;
      } else if (message.readByRecipient) {
        // with the current code, it should be impossible for this condition to
        // be met. but it doesn't hurt to make sure, in case the circumstances
        // under which this reducer function is called change in the future.
        convoCopy.otherUser.lastReadMessageId = message.id;
      }

      return convoCopy;
    } else {
      return convo;
    }
  });
};

// this function assumes that the messages are in chronological order
const getLatestMessageIdNotByUser = (messages, userId) => {
  for (let i = messages.length-1; i >= 0; i--) {
    if (messages[i].senderId !== userId) {
      return messages[i].id;
    }
  }

  return null;
}

export const readConversationInStore = (state, payload) => {
  const { convoId, userId } = payload;

  return state.map((convo) => {
    if (convo.id === convoId) {
      const convoCopy = { ...convo };

      convoCopy.messages = convoCopy.messages.map((message) => {
        if (message.senderId !== userId) {
          const messageCopy = { ...message };
          messageCopy.readByRecipient = true;
          return messageCopy;
        } else {
          return message;
        }
      });

      if (userId === convoCopy.otherUser.id) {
        const otherUserCopy = { ...convoCopy.otherUser };
        otherUserCopy.lastReadMessageId = getLatestMessageIdNotByUser(convoCopy.messages, userId);
        convoCopy.otherUser = otherUserCopy;
      } else {
        convoCopy.unreadCount = 0;
      }

      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addOnlineUserToStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = true;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const removeOfflineUserFromStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = false;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addSearchedUsersToStore = (state, users) => {
  const currentUsers = {};

  // make table of current users so we can lookup faster
  state.forEach((convo) => {
    currentUsers[convo.otherUser.id] = true;
  });

  const newState = [...state];
  users.forEach((user) => {
    // only create a fake convo if we don't already have a convo with this user
    if (!currentUsers[user.id]) {
      let fakeConvo = { otherUser: user, messages: [] };
      newState.push(fakeConvo);
    }
  });

  return newState;
};

// this is only called for outgoing messages. incoming messages use
// addMessageToStore
export const addNewConvoToStore = (state, recipientId, message) => {
  return state.map((convo) => {
    if (convo.otherUser.id === recipientId) {
      const convoCopy = { ...convo };
      convoCopy.id = message.conversationId;
      convoCopy.messages = [...convo.messages, message];
      convoCopy.latestMessageText = message.text;
      return convoCopy;
    } else {
      return convo;
    }
  });
};
