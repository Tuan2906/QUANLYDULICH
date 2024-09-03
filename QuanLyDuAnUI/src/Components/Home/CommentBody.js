import cookies from 'react-cookies';
import { Row, Button } from 'react-bootstrap';
import { useState } from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import APIs, { authApi, endpoints } from '../../config/APIs';
import "./css/Comment.css";

const CommentBody = ({setReplyPosts, comment, isReply, toggleRep, handleToggleRep, replyPosts }) => {
  const [inputView, setInputView] = useState(false);
  const [newRepText, setNewRepText] = useState('');

  const handleClickPhanHoi = () => {
    setInputView(!inputView);
  };

  const addRep = async () => {
    try {
      let token = await cookies.load('access-token');
      let res = await authApi(token).post(endpoints['add-rep'](comment.id), {
        'content': newRepText
      });
      setNewRepText('');
      // Update the replyPosts state to include the new reply
      setReplyPosts([res.data, ...replyPosts]);
      console.log('Updated reply',toggleRep)
      handleToggleRep(comment.id);
    } catch (ex) {
      console.error(ex);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      addRep();
    }
  };

  return (
    <Row style={{ padding: 10, borderBottom: '2px solid black' }}>
      <div className='Comment'>
        <img src={comment.user.avatar} alt='user' width={39} height={30} style={{ borderRadius: '50%' }} />
        <span style={{ marginLeft: 10 }}>{comment.user.username}</span>
      </div>
      <div style={{ marginLeft: 100 }}>{comment.content}</div>
      <div style={{ marginLeft: 50, display: 'flex' }}>
        <FaThumbsUp style={{ marginRight: 10, marginTop: 5, cursor: 'pointer' }} />
        <FaThumbsDown style={{ cursor: 'pointer', marginTop: 5 }} />
        <Button
          style={{ backgroundColor: 'transparent', border: 'none', color: 'black', fontSize: 15 }}
          onClick={handleClickPhanHoi}
        >
          Phản hồi
        </Button>
      </div>
      {inputView &&
        <div className='Comment' style={{ marginLeft: 50 }}>
          <img src={cookies.load('user').avatar} alt='user' width={39} height={30} style={{ borderRadius: '50%' }} />
          <input
            type='text'
            className='input-field'
            placeholder='Nhập bình luận...'
            value={newRepText}
            onChange={(e) => setNewRepText(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
      }
      {!isReply &&
        <div>
          {comment.reply_count > 0 &&
            <input
              type='button'
              value={`▼ ${comment.reply_count} phản hồi`}
              style={{ backgroundColor: 'transparent', border: 'none', marginLeft: 50 }}
              onClick={() => handleToggleRep(comment.id)}
            />
          }
        </div>
      }
    {console.log('addadad',toggleRep)}
      {toggleRep && replyPosts.length > 0 &&
        replyPosts.map((reply, index) => (
          <div key={reply.id}>
            <div className='Comment' style={{ marginLeft: 100 }}>
              <img src={reply.user.avatar} alt='user' width={39} height={30} style={{ borderRadius: '50%' }} />
              <span style={{ marginLeft: 10 }}>{reply.user.username}</span>
            </div>
            <div style={{ marginLeft: 200 }}>{reply.content}</div>
          </div>
        ))
      }
    </Row>
  );
};

export default CommentBody;
