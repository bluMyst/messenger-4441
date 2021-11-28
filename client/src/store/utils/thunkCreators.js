import axios from "axios";
import socket from "../../socket";
import {
  gotConversations,
  addConversation,
  setNewMessage,
  setSearchedUsers,
  readMessages,
} from "../conversations";
import { setActiveChat } from "../activeConversation";
import { gotUser, setFetchingStatus } from "../user";

axios.interceptors.request.use(async function (config) {
  const token = await localStorage.getItem("messenger-token");
  config.headers["x-access-token"] = token;

  return config;
});

// USER THUNK CREATORS

export const fetchUser = () => async (dispatch) => {
  dispatch(setFetchingStatus(true));
  try {
    const { data } = await axios.get("/auth/user");
    dispatch(gotUser(data));
    if (data.id) {
      socket.emit("go-online", data.id);
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setFetchingStatus(false));
  }
};

export const register = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/register", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/login", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const logout = (id) => async (dispatch) => {
  try {
    await axios.delete("/auth/logout");
    await localStorage.removeItem("messenger-token");
    dispatch(gotUser({}));
    socket.emit("logout", id);
  } catch (error) {
    console.error(error);
  }
};

// CONVERSATIONS THUNK CREATORS

export const fetchConversations = () => async (dispatch) => {
  try {
    const { data } = await axios.get("/api/conversations");
    dispatch(gotConversations(data));
  } catch (error) {
    console.error(error);
  }
};

const saveMessage = async (body) => {
  const { data } = await axios.post("/api/messages", body);
  return data;
};

const sendMessage = (data, body) => {
  socket.emit("new-message", {
    message: data.message,
    recipientId: body.recipientId,
    sender: data.sender,
  });
};

// message format to send: {recipientId, text, conversationId}
// conversationId will be set to null if its a brand new conversation
export const postMessage = (body) => async (dispatch) => {
  try {
    const data = await saveMessage(body);

    if (!body.conversationId) {
      dispatch(addConversation(body.recipientId, data.message));
    } else {
      dispatch(setNewMessage(data.message));
    }

    sendMessage(data, body);
  } catch (error) {
    console.error(error);
  }
};

export const searchUsers = (searchTerm) => async (dispatch) => {
  try {
    const { data } = await axios.get(`/api/users/${searchTerm}`);
    dispatch(setSearchedUsers(data));
  } catch (error) {
    console.error(error);
  }
};

const saveReadMessages = async (conversationId) => {
  try {
    const { data } = await axios.patch(
      `/api/messages`,
      {conversationId}
    );
    return data;
  } catch (error) {
    console.error(error);
  }
}

const sendReadMessages = (conversationId, messageIds) => {
  socket.emit("read-messages", {conversationId, messageIds});
}

// the current user has read this conversation
export const readConversation = (conversation) => async (dispatch) => {
  const messageIds = [];
  // get all message ids that aren't from us - since we obviously don't want
  // to mark our own messages as read
  conversation.messages.forEach((message) => {
    if (message.senderId === conversation.otherUser.id && message.readByRecipient === false) {
      messageIds.push(message.id);
    }
  });

  if (messageIds.length <= 0) {
    return;
  }

  dispatch(readMessages(conversation.id, messageIds));

  await saveReadMessages(conversation.id);
  sendReadMessages(conversation.id, messageIds);
}

// set the given chat as active and mark all messages in that conversation as read.
export const activateChat = (username) => (dispatch, getState) => {
  dispatch(setActiveChat(username));

  const conversation = getState().conversations.find((conversation) => {
    return conversation.otherUser.username === username;
  });

  // now that the chat is activated, we've read everything in it.
  dispatch(readConversation(conversation));
}

export const handleNewMessageSocketEvent = (message, sender) => (dispatch, getState) => {
  dispatch(setNewMessage(message, sender));

  const conversation = getState().conversations.find((conversation) => {
    return conversation.id === message.conversationId;
  });

  // if we can't find the conversation, that means this message isn't for us
  // and we can safely ignore it
  if (conversation === undefined) {
    return;
  }

  // if we just got a new message in the active conversation (the one the user
  // is currently looking at) we should automatically mark it as read.
  if (conversation.otherUser.username === getState().activeConversation) {
    dispatch(readConversation(conversation));
  }
}
