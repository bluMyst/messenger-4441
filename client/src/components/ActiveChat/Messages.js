import React from "react";
import { Box } from "@material-ui/core";
import moment from "moment";

import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import ReadIndicator from "./ReadIndicator";

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

        const bubble = message.senderId === userId ? (
          <SenderBubble key={message.id} text={message.text} time={time} />
        ) : (
          <OtherUserBubble key={message.id} text={message.text} time={time} otherUser={otherUser} />
        );

        const readIndicator = message.id === newestConsecutiveReadMessage?.id ? (
          <ReadIndicator
            key="ReadIndicator"
            username={otherUser.username}
            photoUrl={otherUser.photoUrl}
          />
        ) : (
          null
        );

        return (
          <>
            {bubble}
            {readIndicator}
          </>
        );
      })}
    </Box>
  );
};

export default Messages;
