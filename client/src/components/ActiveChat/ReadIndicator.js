import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Avatar } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },

  avatar: {
    width: 20,
    height: 20,
    margin: 9,
  },
}));

const ReadIndicator = (props) => {
  const classes = useStyles();
  const { username, photoUrl } = props;

  return (
    <Box className={classes.root}>
      <Avatar className={classes.avatar} alt={username} src={photoUrl}></Avatar>
    </Box>
  );
};

export default ReadIndicator;
