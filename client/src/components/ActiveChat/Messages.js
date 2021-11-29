import React from "react";
import { Box } from "@material-ui/core";
import moment from "moment";

import { SenderBubble, OtherUserBubble } from "../ActiveChat";

const Messages = (props) => {
  const { messages, otherUser, userId } = props;

  // we need to know what the newest consecutive read message is, so that we
  // can put the ReadIndicator just after it.
  let newestConsecutiveReadMessage;
  for (const message of messages) {
    if (message.senderId !== userId) {
      continue;
    }

    if (!message.readByRecipient) {
      break;
    }

    newestConsecutiveReadMessage = message;
  }

  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format("h:mm");

        return message.senderId === userId ? (
          <SenderBubble
            key={message.id}
            text={message.text}
            time={time}
            otherUser={otherUser}
            hasReadIndicator={message.id === newestConsecutiveReadMessage?.id}
          />
        ) : (
          <OtherUserBubble key={message.id} text={message.text} time={time} otherUser={otherUser} />
        );
      })}
    </Box>
  );
};

export default Messages;
