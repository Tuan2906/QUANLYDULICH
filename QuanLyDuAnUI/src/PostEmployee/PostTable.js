import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import JourneyDetails from './PostDetails';
// import PostInfoTable from './TiLePost';
import { Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import APIs, { authApi, endpoints } from '../configs/APIs'; // assuming API imports are correct
import { MyDispatchContext, MyUserContext } from '../configs/ContextEmployee';
import TinTucDetails from './PostTinTuc';

const JourneyTable = ({formData}) => {
  const navigate = useNavigate();
  const [currentJourney, setCurrentJourney] = useState(null);
  const [journeys, setJourneys] = useState([]);
  const [postInfo, setPostInfo] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelNote, setCancelNote] = useState('');
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [showCheckBaiVan, setShowCheckBaiVan] = useState(false);
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  const [tinTuc, setTinTuc] = useState([]);
  const [currentTinTuc, setCurrentTinTuc] = useState(null);


  const handleLogout = () => {
    dispatch({"type": "logout"})
    navigate('/login');
  };

  const loadPostXetDuyet = async () => {
    console.log("user",user);
    // let user_patse =  JSON.parse(user);
    // console.log("user.id",user_patse.id);

    console.log(localStorage.getItem("access-token"))
    try {
      const res = await authApi(localStorage.getItem("access-token")).get(endpoints['xetDuyet'](user.id));
      console.log("re",res.data.results);
      setJourneys(res.data.results);
    } catch (error) {
      console.error('Loi post:', error);
    }
  };
  const loadTinTucXetDuyet = async () => {
    console.log("user",user);
    // let user_patse = JSON.parse(user);

    try {
      const res = await authApi(localStorage.getItem("access-token")).get(endpoints['tinTuc'](user.id));
      setTinTuc(res.data.results);
    } catch (error) {
      console.error('Loi tin tuc', error);
    }
  };
  useEffect(()=>{
    loadPostXetDuyet();
    loadTinTucXetDuyet();
  },[])

  const viewDetails = (journey) => {
    if (currentJourney && currentJourney.id === journey.id) {
      setCurrentJourney(null);
    } else {
      setCurrentJourney(journey);
    }
  };
  const viewTinTucDetails = (tt) => {
    if (currentTinTuc && currentTinTuc.id === tt.id) {
      setCurrentTinTuc(null);
    } else {
      setCurrentTinTuc(tt);
    }
  };

  const sendEmail = (title, ghiChu, email) => {
    console.log("dada",email);
    APIs.post(endpoints['apiEmail'], {
      'title': title,
      'emailClient': email,
      "ghiChu": ghiChu
    });
  };

  const approveJourney = async (journey) => {
    console.log(journey);
    try {
      const res = await authApi(localStorage.getItem("access-token")).patch(endpoints['approveJourney'](journey.id), {
        state: "Publish",
      });
      loadPostXetDuyet();
      sendEmail(journey.title, "Bài viết đã được xét duyệt thành công", journey.user);
      setPostInfo(null); // Reset postInfo after approval
    } catch (error) {
      console.error('Error approving journey:', error);
    }
  };

  const checkBaiViet = async (journeyId) => {
    try {
      const res = await authApi(localStorage.getItem("access-token")).get(endpoints['xetDuyetPost'](journeyId));
      setShowCheckBaiVan(!showCheckBaiVan);
      setPostInfo(res.data);
    } catch (error) {
      console.error('Error checking post:', error);
    }
  };

  const cancelApproval = async () => {
    try {
      if (!selectedJourney) return;
      const res = await authApi(localStorage.getItem("access-token")).patch(endpoints['cancelApproval'](selectedJourney.id), {
        state: "Reject",
        note: cancelNote,
      });
      let note = "Bài viết của bạn đã bị hủy!!!" + "\n Lý do:" + cancelNote;
      sendEmail(selectedJourney.title, note, selectedJourney.user);
      setShowCancelModal(false);
      setCancelNote('');
      setPostInfo(null); // Reset postInfo when cancelling approval
      loadPostXetDuyet();
    } catch (error) {
      console.error('Error canceling approval:', error);
    }
  };

  const handleCancel = (journey) => {
    setSelectedJourney(journey);
    setShowCancelModal(true);
  };

  useEffect(() => {
    loadPostXetDuyet();
  }, []);

  return (
    <div className="container">
      <h1>QUẢN LÝ DU LỊCH</h1>
      {user && (
         <div className="d-flex align-items-center mb-3">
          <FontAwesomeIcon icon={faUser} size="lg" className="mr-2" />
          <span>Welcome, {user.username}</span>
        
          <button className="btn btn-link ml-2" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
          </button>
       </div>
      )}
        
      <table className="table table-bordered">
       <thead>
           <tr>
            <td colSpan="5">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{fontSize:"20px",color:"darkblue"}}>Danh sách tour</h3>
                <div>
                  <button className="btn btn-primary btn-sm ml-2 flex-1" onClick={() => navigate("/postDieuHuong")}>
                    <i className="fa fa-plus-circle" aria-hidden="true"></i> Tạo tour
                  </button>
                  <button className="btn btn-danger btn-sm ml-2 flex-1" onClick={() => navigate("/newscreate")}>
                    <i className="fa fa-plus-circle" aria-hidden="true"></i> Tạo tin tức
                  </button>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th>Tiêu đề</th>
            <th>Nội dung</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
         
        </thead>
        <tbody>
          {journeys.map(journey => (
            <React.Fragment key={journey.id}>
              <tr>
                <td>{journey.title}</td>
                <td>{journey.content}</td>
                <td>{new Date(journey.created_date).toLocaleString('en-GB')}</td>
                <td className="align-middle">
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-primary me-1"
                      type="button"
                      onClick={() => viewDetails(journey)}
                    >
                      Xem chi tiết
                    </button>
                   
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan="4">
                  <div className={currentJourney && currentJourney.id === journey.id ? 'collapse show' : 'collapse'} id={`collapse${journey.id}`}>
                    {currentJourney && currentJourney.id === journey.id && (
                      <JourneyDetails journey={journey.journey} pictures={journey.pic} tags={journey.tags} money={journey.gia} dsVisit={journey.travelCompanion} sl={journey.max}/>
                    )}
                  </div>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <table className="table table-bordered">
       <thead>
           <tr>
            <td colSpan="5">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{fontSize:"20px",color:"darkblue"}}>Danh sách tin tức</h3>
              </div>
            </td>
          </tr>
          <tr>
            <th>Tiêu đề</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
         
        </thead>
        <tbody>
          {tinTuc.map(news => (
            <React.Fragment key={news.id}>
              <tr>
                <td>{news.title}</td>
                <td>{new Date(news.created_date).toLocaleString('en-GB')}</td>
                <td className="align-middle">
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-primary me-1"
                      type="button"
                      onClick={() => viewTinTucDetails(news)}
                    >
                      Xem chi tiết
                    </button>
                   
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan="4">
                  <div className={currentTinTuc && currentTinTuc.id === news.id ? 'collapse show' : 'collapse'} id={`collapse${news.id}`}>
                    {currentTinTuc && currentTinTuc.id === news.id && (
                      <TinTucDetails  pictures={news.pic} danhmuc={news.danhmuc} content={news.content} />
                    )}
                  </div>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
      {/* { showCheckBaiVan && postInfo && (
        <div className="container mt-4">
          <PostInfoTable
            title={postInfo.title}
            content={postInfo.content}
            sensitiveContentProbabilities={postInfo.sensitive_content_probabilities}
          />
        </div>
      )} */}

      {/* <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Approval</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formCancelNote">
              <Form.Label>Note</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your note"
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={cancelApproval}>
            Cancel Approval
          </Button>
        </Modal.Footer>
      </Modal> */}
    </div>
  );
};

export default JourneyTable;
