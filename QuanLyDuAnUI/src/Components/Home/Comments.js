import cookies from 'react-cookies';
import { Row, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import APIs, { authApi, endpoints } from '../../config/APIs';
import { FaArrowLeft, FaArrowRight, FaThumbsUp, FaThumbsDown, FaStar } from 'react-icons/fa';
import MySpinner from '../Common/Spiner';
import CommentsLoop from './Comment';


const PostComments = ({ id_post,rate }) => {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  const loadCommentsPost = async () => {
    setLoading(true);
    try {
      let res = await APIs.get(`${endpoints['comments'](id_post)}?page=${page}`);
      setMaxPage(res.data.max_page);
      setComments(res.data.results);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    try {
      let token = await cookies.load('access-token');
      let res = await authApi(token).post(endpoints['add-comment'](id_post), {
        'content': newCommentText
      });
      setComments([res.data, ...comments]);
      setNewCommentText('');
    } catch (ex) {
      console.error(ex);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      addComment();
    }
  };

  useEffect(() => {
    loadCommentsPost();
  }, [id_post, page]);

  const setIdxPage = (index) => {
    setPage(index);
  };

  return (
    <Row style={{ marginTop: 100, marginBottom: 50 }}>
      <div style={{display:'flex'}}>
      <h1>Bình luận</h1>
      <div className="rating-container" style={{marginTop:10, marginLeft:10}}>
      {Array.from({ length: 5 }, (v, i) => (
        <FaStar
          key={i}
          size={30}
          color={i < rate ? "#ffd700" : "#e4e5e9"}
        />
      ))}
    </div>
      </div>
      <Row className='Comment'>
        <div className='Comment'>
          <img src={cookies.load('user').avatar} alt='user' width={39} height={30} style={{ borderRadius: '50%' }} />
          <input
            type='text'
            className='input-field'
            placeholder='Nhập bình luận...'
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onKeyPress={handleKeyPress}
          />
           {maxPage === null ? <MySpinner /> : (
        <div style={{ display: 'flex' }}>
          { maxPage > 0 && <Button variant="primary" disabled={page === 1 || loading} onClick={() => setPage(page - 1)}><FaArrowLeft /></Button>}
          {Array.from({ length: maxPage }, (_, i) => (
            <div key={i} className='Comment' style={{ margin: 5 }}>
              {i + 1 === page ? (
                <Button onClick={() => setIdxPage(i + 1)}
                  style={{ backgroundColor: 'blue', color: 'white', width: 40, height: 40, border: 'solid 2px black', textAlign: 'center', padding: 5, fontSize: 20 }}>
                  <span>{i + 1}</span>
                </Button>
              ) : (
                <Button onClick={() => setIdxPage(i + 1)}
                  style={{ backgroundColor: 'transparent', color: 'black', width: 40, height: 40, border: 'solid 2px black', textAlign: 'center', padding: 5, fontSize: 20 }}>
                  <span>{i + 1}</span>
                </Button>
              )}
            </div>
          ))}
          {maxPage > 0 && <Button variant="primary" disabled={page === maxPage || loading} onClick={() => setPage(page + 1)}><FaArrowRight /></Button>}
        </div>
      )}
        </div>
       
      </Row>
     
      <div>
        {comments.length > 0 &&
            <CommentsLoop comments={comments} />
        }
      </div>
    </Row>
  );
};

export default PostComments;
