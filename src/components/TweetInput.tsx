import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { auth, db, storage } from "../firebase";
import { Avatar, Button, IconButton } from "@material-ui/core";
import firebase from "firebase";
import styles from "./TweetInput.module.css";
import { AddAPhoto } from "@material-ui/icons";

const TweetInput: React.FC = () => {
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
    <>
      <form onSubmit={sendTweet}>
        <div className={styles.tweet_form}>
          <Avatar
            className={styles.tweet_avatar}
            src={user.photoUrl}
            onClick={async () => {
              await auth.signOut();
            }}
          />
          <input
            className={styles.tweet_input}
            placeholder="What's happening?"
            type="text"
            autoFocus
            value={tweetMessage}
            onChange={(e) => {
              setTweetMessage(e.target.value);
            }}
          />
          <IconButton>
            <label>
              <AddAPhoto
                className={
                  tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
                }
              />
              <input
                type="file"
                onChange={onChangeImageHandler}
                className={styles.tweet_hiddenIcon}
              />
            </label>
          </IconButton>
        </div>
        <Button
          type="submit"
          disabled={!tweetMessage}
          className={
            tweetMessage ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn
          }
        >
          Tweet
        </Button>
      </form>
    </>
  );
};

export default TweetInput;
