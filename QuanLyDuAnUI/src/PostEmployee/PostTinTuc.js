import React, { useState } from 'react';
import Gallery from './Gallery';
import './JourneyDetails.css'; // Import your CSS file
import { faMotorcycle, faCar, faBus, faBicycle,faTag, faComment, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TinTucDetails = ({ pictures, danhmuc,content }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  const displayContent = isExpanded ? content : content.slice(0,2);

 
  return (
    <div className="card card-body journey-details">
      <div className="container mt-3">
        <div className="row">
          <div className="col-md-6">
            <h2>Thông tin chi tiết về tin tức</h2>
            <hr />
            <h5><FontAwesomeIcon width={"5%"} color='green' icon={faPen} />Nội dung</h5>
            {content && (
              <div className="card mt-3">
                 <p>
                        {displayContent}
                        {!isExpanded && content.length > 2 && '...'}
                    </p>
                    {content.length > 2 && (
                        <button onClick={toggleExpand} className="btn btn-link">
                        {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                        </button>
                    )}
              </div>
            )}
            {danhmuc.id && (
              <div className="mt-3">
                <h5><FontAwesomeIcon width={"5%"} color='green' icon={faTag} />Danh Mục</h5>

                <ul className="list-inline" style={{marginLeft:"25px"}}>
                  
                    <li key={danhmuc.id} className="list-inline-item">
                      <span className="badge bg-secondary">{danhmuc.name}</span>
                    </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
        <h5 style={{'margin-left': "10px"}}>Pictures</h5>
        {pictures && pictures.length > 0 && (
          <Gallery pictures={pictures}/>
        )}
    </div>
  );
};

export default TinTucDetails;
