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
  previewText: (props) => ({
    letterSpacing: -0.17,
    lineHeight: 1,
    color: props.unreadCount > 0 ? (
      theme.palette.text.primary
    ) : (
      theme.palette.text.secondary
    ),
    fontWeight: props.unreadCount > 0 ? (
      theme.typography.fontWeightBold
    ) : (
      theme.typography.fontWeightRegular
    ),
  }),
  unreadBadge: {
    height: theme.spacing(2.5),
    minWidth: theme.spacing(2.5),
    borderRadius: theme.spacing(2),
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    alignSelf: "center",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  unreadBadgeText: {
    fontWeight: theme.typography.fontWeightBold,
  },
}));

const ChatContent = (props) => {
  const classes = useStyles(props);

  const { conversation } = props;
  const { latestMessageText, otherUser, unreadCount } = conversation;

  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>
          {otherUser.username}
        </Typography>
        <Typography variant='caption' className={classes.previewText}>
          {latestMessageText}
        </Typography>
      </Box>
      {unreadCount > 0 && (
        <Badge className={classes.unreadBadge}>
          <Typography variant='caption' align='center' className={classes.unreadBadgeText}>
            {unreadCount}
          </Typography>
        </Badge>
      )}
    </Box>
  );
};

export default ChatContent;
