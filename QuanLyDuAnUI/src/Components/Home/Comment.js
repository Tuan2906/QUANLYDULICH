import cookies from 'react-cookies';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import APIs, { endpoints } from '../../config/APIs';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import MySpinner from '../Common/Spiner';
import CommentBody from './CommentBody';

const CommentsLoop = ({ comments }) => {
  const [replyPosts, setReplyPosts] = useState({});
  const [toggleRep, setToggleRep] = useState({});
  const [commentId, setCommentId] = useState(null);

  const loadCommentRepPosts = async (commentId) => {
    try {
      let res = await APIs.get(endpoints['reply'](commentId));
      setReplyPosts(prevState => ({
        ...prevState,
        [commentId]: res.data
      }));
    } catch (ex) {
      console.error(ex);
    }
  };

  useEffect(() => {

    if (commentId != null) {
        console.log('vo commmmmadma')
        loadCommentRepPosts(commentId);
    }
  }, [commentId,toggleRep]);

  const handleToggleRep = (commentId) => {
    setToggleRep(prevState => ({
      ...prevState,
      [commentId]: !prevState[commentId]
    }));
    setCommentId(commentId);
  };

  return (
    <Row>
      {comments.map((comment, index) => (
        <CommentBody
          key={comment.id}
          comment={comment}
          isReply={false}
          toggleRep={toggleRep[comment.id]}
          handleToggleRep={handleToggleRep}
          replyPosts={replyPosts[comment.id] || []}
          setReplyPosts={setReplyPosts}
        />
      ))}
    </Row>
  );
};

export default CommentsLoop;