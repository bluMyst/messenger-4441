import React from "react";
import { Box } from "@material-ui/core";
import { BadgeAvatar, ChatContent } from "../Sidebar";
import { makeStyles } from "@material-ui/core/styles";
import { activateChat } from "../../store/utils/thunkCreators";
import { connect } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: "0 2px 10px 0 rgba(88,133,196,0.05)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "grab"
    }
  }
}));

const Chat = (props) => {
  const classes = useStyles();
  const { conversation } = props;
  const { otherUser } = conversation;

  const handleClick = async (conversation) => {
    await props.activateChat(conversation.otherUser.username);
  };

  const unreadCount = conversation.messages.reduce((unreadCount, message) => {
    if (message.senderId === otherUser.id && !message.readByRecipient) {
      return unreadCount+1;
    }

    return unreadCount;
  }, 0);

  return (
    <Box onClick={() => handleClick(conversation)} className={classes.root}>
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent conversation={conversation} unreadCount={unreadCount} />
    </Box>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    activateChat: (id) => {
      dispatch(activateChat(id));
    }
  };
};

export default connect(null, mapDispatchToProps)(Chat);
