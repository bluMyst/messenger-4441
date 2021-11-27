import React from "react";
import { Box, Badge, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: 20,
    flexGrow: 1,
  },
  username: {
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
  previewText: {
    fontSize: 12,
    color: "#9CADC8",
    letterSpacing: -0.17,
  },
  unreadPreviewText: {
    color: "#000",
    fontWeight: "bold",
  },
  unreadBadge: {
    height: 20,
    minWidth: 20,
    margin: 10,
    borderRadius: 10,
    backgroundColor: "#3F92FF",
    alignSelf: "center",
    paddingLeft: 7,
    paddingRight: 7,
    lineHeight: 2,
    color: "#FFF",
    textAlign: "center",
    fontSize: 10,
    fontWeight: "bold",
  },
}));

const ChatContent = (props) => {
  const classes = useStyles();

  const { conversation, nUnread } = props;
  const { latestMessageText, otherUser } = conversation;

  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>
          {otherUser.username}
        </Typography>
        <Typography className={`${classes.previewText} ${nUnread > 0 ? classes.unreadPreviewText : ""}`}>
          {latestMessageText}
        </Typography>
      </Box>
      {nUnread > 0 ? (
        <Badge className={classes.unreadBadge}>{nUnread}</Badge>
      ) : (
        null
      )}
    </Box>
  );
};

export default ChatContent;
