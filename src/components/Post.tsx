import React, { useEffect, useState } from "react";
import styles from "./Post.module.css";
import { db } from "../firebase";
import firebase from "firebase/app";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { Avatar, makeStyles } from "@material-ui/core";
import { Message, Send } from "@material-ui/icons";

interface Props {
  postId: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: any;
  username: string;
}

interface Comment {
  id: string;
  avatar: string;
  text: string;
  username: string;
  timestamp: any;
}

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));

const Post: React.FC<Props> = (props) => {
  const classes = useStyles();
  const user = useSelector(selectUser);
  const { postId, avatar, image, text, timestamp, username } = props;
  const [comment, setComment] = useState("");
  const [commentList, setCommentList] = useState<Comment[]>([
    {
      id: "",
      avatar: "",
      text: "",
      username: "",
      timestamp: null,
    },
  ]);
  const [openComment, setOpenComment] = useState(false);
  useEffect(() => {
    const unSub = db
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setCommentList(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            avatar: doc.data().avatar,
            text: doc.data().comment,
            timestamp: doc.data().timestamp,
            username: doc.data().username,
          }))
        );
      });
    return () => {
      unSub();
    };
  }, [postId]);
  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    db.collection("posts").doc(postId).collection("comments").add({
      avatar: user.photoUrl,
      comment: comment,
      username: user.displayName,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    setComment("");
  };
  return (
    <div className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar src={avatar} />
      </div>
      <div className={styles.post_body}>
        <div>
          <div className={styles.post_header}>
            <h3>
              <span className={styles.post_headerUser}>@{username}</span>
              <span className={styles.post_headerTime}>
                {new Date(timestamp?.toDate()).toLocaleString()}
              </span>
            </h3>
          </div>
          <div className={styles.post_tweet}>
            <p>{text}</p>
          </div>
        </div>
        {image && (
          <div className={styles.post_tweetImage}>
            <img src={image} alt="tweet" />
          </div>
        )}
        <Message
          className={styles.post_commentIcon}
          onClick={() => setOpenComment(!openComment)}
        />
        {openComment && (
          <>
            {commentList.map((comment) => (
              <div key={comment.id} className={styles.post_comment}>
                <Avatar className={classes.small} src={comment.avatar} />
                <span className={styles.post_commentUser}>
                  @{comment.username}
                </span>
                <span className={styles.post_commentText}>{comment.text}</span>
                <span className={styles.post_headerTime}>
                  {new Date(comment.timestamp?.toDate()).toLocaleString()}
                </span>
              </div>
            ))}
            <form onSubmit={(e) => newComment(e)}>
              <div className={styles.post_form}>
                <input
                  type="text"
                  className={styles.post_input}
                  placeholder="Type new comment..."
                  value={comment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setComment(e.target.value);
                  }}
                />
                <button
                  disabled={!comment}
                  className={
                    comment ? styles.post_button : styles.post_buttonDisable
                  }
                  type="submit"
                >
                  <Send className={styles.post_sendIcon} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Post;
