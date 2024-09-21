import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FirstPage from './FirstPage';
import SecondPage from './SecondPage';
import JourneyTable from './PostTable';
import { ProgressBar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const PostForm = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    diemDi: '',
    diemDen: '',
    ngayDi: '',
    ngayDen: '',
    chiPhi: 0,
    chiPhiTreEm: 0,
    soluong:0,
    diaDiemTrungGian: [],
    pictureDaChon: [],
    pictureUserSelect: [],
    anhTam: [],
    phuongtien: '',
    tag:[],
  });

  const [isPageChanged, setIsPageChanged] = useState(false);

  useEffect(() => {
    console.log("is",isPageChanged)
    if (isPageChanged==true) {
      console.log("vo may lanss")

      // Trì hoãn việc gọi renderPage() để đảm bảo các cập nhật thanh tiến trình hoàn tất
      const timer = setTimeout(() => {
        console.log("vo may lanss")
        renderPage();
        setIsPageChanged(false); // Reset state
      }, 30000); // Điều chỉnh thời gian trì hoãn nếu cần

      return () => clearTimeout(timer); // Dọn dẹp timer khi component bị unmount hoặc isPageChanged thay đổi
    }
  }, [isPageChanged]);

  const saveFormData = () => {
    const tempFormData = { ...formData };
    setFormData(tempFormData);
  };

  const handlePressBack = () => {
    saveFormData();
    setPage(page - 1);
  };

  const handlePressNext = () => {
    saveFormData();
    setIsPageChanged(true); // Đánh dấu trang đã thay đổi
    setPage(page + 1);
  };

  const handleChangeText = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const renderPage = () => {
    switch (page) {
      case 0:
        return <FirstPage formData={formData} onChangeText={handleChangeText} onPressNext={handlePressNext} />;
      case 1:
        return <SecondPage formData={formData} onChangeText={handleChangeText} onPressBack={handlePressBack} onPressNext={handlePressNext} />;
      case 2:
        navigate("/journeys", { state: { formData } });
        break;
      default:
        return <JourneyTable formData={formData} />;
    }
  };

  const getProgress = (step) => {
    switch(step) {
      case 1: return 33.33;
      case 2: return 66.66;
      case 3: return 100;
      default: return 0;
    }
  };

  return (
    <>
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 20, color: "red", textAlign: "center" }}>Vui lòng hoàn thành các bước đăng bài tour</h3>
      </div>
      <div style={{ marginRight: '20px', width: "90%", position: 'relative' }}>
        <ProgressBar style={{ height: '20px',marginLeft:"90px" }} variant="info">
          <ProgressBar
            striped
            variant={page==0?"warning":"success"}
            now={page == 0 ? 33.33 : 10}
            key={1}
            label={page==0?"Bước 1":"Hoàn tất bước 1"}
            style={page === 0 ? { width: '10%' } : { width: '33.33%' }}
            ></ProgressBar>
         {page==1 &&
          <ProgressBar
            striped
            variant={page==1?"warning":"success"}
            now={page == 1 ? 33.33 : 0}
            key={2}
            label="Bước 2"
            style={page === 1 ? { width: '50%' } : { width: '10%' }}
          />
         }
       
        </ProgressBar>
      </div>
      {renderPage()}
      <div>
        <div style={styles.pageInfo}>
          <h3 style={styles.counter}>Page {page + 1} of 3</h3>
        </div>
      </div>
    </>
  );
};

const styles = {
  counter: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign:"center"
  },
  pageInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
};

export default PostForm;