import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { auth, db, storage } from "../firebase";
import { Avatar } from "@material-ui/core";
import firebase from "firebase";
import styles from "./TweetInput.module.css";

const TweetInput = () => {
  const user = useSelector(selectUser);
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [tweetMessage, setTweetMessage] = useState<string>("");
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setTweetImage(e.target.files![0]);
      e.target.value = "";
    }
  };
  const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tweetImage) {
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomCar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const filename = randomCar + "_" + tweetImage.name;
      const uploadTweetImage = storage
        .ref(`images/${filename}`)
        .put(tweetImage);
      uploadTweetImage.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        () => {},
        (error) => {
          alert(error.message);
        },
        async () => {
          await storage
            .ref("images")
            .child(filename)
            .getDownloadURL()
            .then(async (url) => {
              await db.collection("posts").add({
                avatar: user.photoUrl,
                image: url,
                text: tweetMessage,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                username: user.displayName,
              });
            });
        }
      );
    } else {
      db.collection("posts").add({
        avatar: user.photoUrl,
        image: "",
        text: tweetMessage,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        username: user.displayName,
      });
    }
    setTweetImage(null);
    setTweetMessage("");
  };
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
