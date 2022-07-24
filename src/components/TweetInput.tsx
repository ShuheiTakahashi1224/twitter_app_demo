import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { auth } from "../firebase";
import { Avatar } from "@material-ui/core";
import styles from "./TweetInput.module.css";

const TweetInput = () => {
  const user = useSelector(selectUser);
  return (
    <div>
      <Avatar
        className={styles.tweet_avatar}
        src={user.photoUrl}
        onClick={async () => {
          await auth.signOut();
        }}
      />
    </div>
  );
};

export default TweetInput;
