import io from "socket.io-client";
import store from "./store";
import {
  removeOfflineUser,
  addOnlineUser,
  readMessages,
} from "./store/conversations";
import { handleNewMessageSocketEvent } from "./store/utils/thunkCreators";

const socket = io(window.location.origin);

socket.on("connect", () => {
  console.log("connected to server");

  socket.on("add-online-user", (id) => {
    store.dispatch(addOnlineUser(id));
  });

  socket.on("remove-offline-user", (id) => {
    store.dispatch(removeOfflineUser(id));
  });

  socket.on("new-message", (data) => {
    store.dispatch(handleNewMessageSocketEvent(data.message, data.sender));
  });

  socket.on("read-messages", (data) => {
    store.dispatch(readMessages(data.conversationId, data.messageIds));
  });
});

export default socket;
