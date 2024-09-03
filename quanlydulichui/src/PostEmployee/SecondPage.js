import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faLocation, faTimesCircle, faCalendarCheck, faCheck, faTag, faCar, faBus, faBicycle, faMotorcycle, faPlane, faTrain } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import APIs, { endpoints } from '../configs/APIs';
import { Alert, Button } from 'react-bootstrap';
import JourneyTable from './PostTable';
var tam=0;
const SecondPage = ({ formData, onChangeText, onPressBack, onPressNext }) => {
  const [startingDestination, setStartingDestination] = useState(null);
  const [endingDestination, setEndingDestination] = useState(null);
  const [showDestinationPicker, setShowDestinationPicker] = useState(false);
  const [timeDung, setTimeDung] = useState([]);
  const [transports, setTransports] = useState([]);
  const [transport, setTransport] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [tick, setTick] = useState(false);
  const [demAdd, setDemAdd] = useState(0);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [dateNgayDi, setDateNgayDi] = useState(new Date());
  const [dateNgayDen, setDateNgayDen] = useState(new Date());
  const [dateNgayDenTrungGian, setDateNgayDenTrungGian] = useState(new Map().set('date', new Date()));
  const [tags, setTags] = useState([]);
  const [isDatePickerNgayDiVisible, setDatePickerNgayDiVisibility] = useState(false);
  const [isDatePickerNgayDenVisible, setDatePickerNgayDenVisibility] = useState(false);
  const [isDatePickerNgayDenTGVisible, setDatePickerNgayDenTGVisibility] = useState(false);

// Fetch  lay cac tag
  const loadTag= async () => {
    try {
        let res = await APIs.get(endpoints['tag']);
        console.log(res.data);
        setTags(res.data);
    } catch(ex) {
        console.error(ex);
    }
  }
 // Fetch lay transport
 const loadTransport= async () => {
  try {
      let res = await APIs.get(endpoints['transport']);
      console.log(res.data);
      setTransport(res.data);
  } catch(ex) {
      console.error(ex);
  }
}
// fetch lay destination
const loadDestination= async () => {
  try {
      let res = await APIs.get(endpoints['local']);
      
      setDestinations(res.data);
  } catch(ex) {
      console.error(ex);
  }
}
 useEffect(()=>{
  loadTag()
  loadTransport()
  loadDestination()
  },[])  

 


// Xử lý datatime


  const showDateNgayDiPicker = () => {
    setDatePickerNgayDiVisibility(true);

  };
  const showDateNgayDenPicker = () => {
    setDatePickerNgayDenVisibility(true);

  };
  const showDateNgayDenTGPicker = (i) => {
    setDatePickerNgayDenTGVisibility(true);

  };
  const hideDateNgayDiPicker = () => {
    setDatePickerNgayDiVisibility(false);
  };
  const hideDateNgayDenPicker = () => {
    setDatePickerNgayDenVisibility(false);
  };
  const hideDateNgayDenTGPicker = (i) => {
    setDatePickerNgayDenTGVisibility(i,false);
  };

  const handleConfirmNgayDi = (dateNgayDi) => {
    console.log("how to loaf")
    setDateNgayDi(dateNgayDi);
    hideDateNgayDiPicker();
  };
  const handleConfirmNgayDen = (dateNgayDen) => {
    console.log("vao duloc");
    console.log(dateNgayDen)
    setDateNgayDen(dateNgayDen);
    hideDateNgayDenPicker();
  };
  const handleConfirmNgayDenTrungGian = (dateNgayDenTG, i) => {
    console.log("check tam:",tam);
    console.log("Dem Add",demAdd);
    console.log("vao tg");
    console.log(i);
   //phần chỉnh sửa thêm
    console.log(dateNgayDenTG)
    setDateNgayDenTrungGian(new Map(dateNgayDenTrungGian.set(i, dateNgayDenTG)));
    setTimeDung(prevTimeDung => {
      const newTimeDung = [...prevTimeDung];
      newTimeDung[i] = dateNgayDenTG;
      return newTimeDung;
    });
    console.log("ddss", timeDung);
    hideDateNgayDenTGPicker();
  };
  const handleValidDate=(dateValid)=>{
    const date= new Date(dateValid);
    const dateString =  date.toISOString().split('T')[0];
    const timeString =  date.toTimeString().split(' ')[0];
    const dateTimeString = `${dateString} ${timeString}`;
    return dateTimeString;
  }

  // Xu ly tag
  const [tagSelections, setTagSelections] = useState([]);
  const handleTagSelection = (tag) => {
      setTagSelections({ ...tagSelections, [tag.id]: !tagSelections[tag.id] });
    console.log(tagSelections)
  };
  const handleSelectDestination = (id, isStartingPoint) => {

    if (isStartingPoint) {
      console.log("vao di",id)
      if (id !== endingDestination) {
        setStartingDestination(id === startingDestination ? null : id);
        onChangeText('diemDi', id);
        setShowDestinationPicker(true);
      }
    } 
    else {  
      console.log("vao duoc",id)
      console.log(endingDestination)
      if(endingDestination==null)
      {
        console.log("check")
        setEndingDestination(1);
        onChangeText('diemDen', 1);
      }
      if (id !== startingDestination) {
        console.log("diem den",id);
        setEndingDestination(id === endingDestination ? null : id);
        onChangeText('diemDen', id);
        setShowDestinationPicker(false);
      }
    }
  };
  // Xử lý địa điểm trung gian
  const handleAddDestination = () => {
    setDemAdd(demAdd + 1);
    console.log(tam);
  setShowDestinationPicker(true);
  };
   
  // const handleClose = (index) => {
  //   console.log("id",index)
  //   setDemAdd(index)
  //   const newSelectedDestinations = [...selectedDestinations];
  //   console.log(timeDung);
  //  if(dateNgayDenTrungGian != undefined)
  //   {
  //     console.log("dat",dateNgayDenTrungGian);
  //     dateNgayDenTrungGian.delete(index);
  //     console.log("delete dat",dateNgayDenTrungGian);

  //       timeDung.splice(index,1);
  //     console.log(timeDung);
  //   }
  //   newSelectedDestinations.splice(index, 1);
  //   console.log("new",newSelectedDestinations);
  //   setSelectedDestinations(newSelectedDestinations);
  // };
  const handleClose = (index) => {
    setDemAdd(index)
    const newSelectedDestinations = [...selectedDestinations];
    console.log(timeDung);
    if(dateNgayDenTrungGian != undefined)
      {
        timeDung.splice(index,1);
        console.log(timeDung);
      }
      newSelectedDestinations.splice(index, 1);
      setSelectedDestinations(newSelectedDestinations);
  };
  // xu ly transport
  const handleTrSelection = (data) => {
    if (tick === true) {
      setTick(false)
      setTransports([]);
      if (tick==false)
      {
        setTransports({ ...transports, [data.id]: !transports[data.id] });
        console.log(transports);
      }
     
    }
    else{
      setTick(true)
      setTransports({ ...transports, [data.id]: !transports[data.id] });
    }
    console.log(transports);
  };
  


const handleDestinationChange = (value, index) => {
  console.log("vo nay",selectedDestinations)
  const newSelectedDestination = destinations.find(d => d.id === parseInt(value));
  const newSelectedDestinations = [...selectedDestinations];
  console.log("ada",typeof(newSelectedDestination.id))
  console.log("Soo sanh",newSelectedDestination.id !== startingDestination)
  if ( newSelectedDestination.id !== parseInt(endingDestination) && newSelectedDestination.id !== parseInt(startingDestination)) {
      // Cập nhật giá trị của iddiaDiem trong diaDiemTrungGian
        console.log("update",newSelectedDestinations)
        newSelectedDestinations[index] = newSelectedDestination;
        setSelectedDestinations(newSelectedDestinations);
    }else{
      console.log("bao loi");
      alert("Dia Diem khong trung nhau");
    }
  }
  const [error, setError] = useState(null);
  const formatISODate = (date) => {
    const tzoffset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
    const localISOTime = new Date(date - tzoffset).toISOString().slice(0, 16);
    return localISOTime;
  };
 
  // Xử lý tag
  const handleSubmit = async() => {
    const newDiaDiemTrungGian = [...formData.diaDiemTrungGian];
    console.log("Du lieu submit diem trung gian",selectedDestinations)
    console.log("dad",timeDung);
    
    // Phần chỉnh sửa check ngày
    if(moment(dateNgayDen).isBefore(moment(dateNgayDi))) {
      alert("Lỗi ngày đi hoặc ngày đến không hợp lệ");
        return ;
    }
    for (let i = 1; i < timeDung.length; i++) {
      console.log("sos sanh ",moment(timeDung[i - 1]).fromNow())
      if (moment(timeDung[i - 1]).isAfter(moment(timeDung[i]))) {
       alert(`Lỗi địa điểm trung gian ${i} và ${i+1}:\n
        Ngày ${moment(timeDung[i - 1]).format("DD/MM/YYYY hh:mm:ss")} \n
        không được nhỏ hơn \n
        Ngày ${moment(timeDung[i]).format("DD/MM/YYYY hh:mm:ss")}\n`);
       return;
      }
    }
    if (timeDung.length>0 && (moment(dateNgayDen).isBefore(moment(timeDung[timeDung.length - 1])) || 
      moment(dateNgayDi).isAfter(moment(timeDung[0])))) {
        alert("Lỗi ngày đi hoặc ngày đến không hợp lệ hoặc ngày trung gian không hợp lệ");
        return ;
      }
    selectedDestinations.forEach((destination, index) => {
      if (index >= newDiaDiemTrungGian.length) {
        newDiaDiemTrungGian.push({ iddiaDiem: destination.id, timedung: handleValidDate(timeDung[index]) });
      } else {
        newDiaDiemTrungGian[index].iddiaDiem = destination.id;
      }
    });
    console.log("tagse",tagSelections)

    let updatedTags = [...formData.tag]; // Sao chép mảng tag hiện tại

    for (const id in tagSelections) {
      if (tagSelections[id] === true) {
        console.log("Vo", id);
        // Thêm id vào mảng tag nếu chưa tồn tại
        if (!updatedTags.includes(id)) {
          updatedTags.push(id);
        }
      }
    }
    console.log("iii",updatedTags)
    formData.tag=updatedTags;
    console.log("dadadaddadad",formData.tag)
    for (const id in transports) {
      if(transports[id]==true)
      {
        console.log('Dat la phuong tine');
        console.log(id)
         formData.phuongtien=id
      }
      
    }
    const dateDi = handleValidDate(dateNgayDi);
    const dateDen = handleValidDate(dateNgayDen);
    formData.diaDiemTrungGian=newDiaDiemTrungGian
    formData.ngayDi= dateDi;
    formData.ngayDen= dateDen;
    
    const newFormData = { ...formData};
    console.log("Du lieu trong submiit:",newFormData);
    const formData2 = new FormData();

    Object.keys(newFormData).forEach(key => {
      if (key === 'pictureUserSelect') {
        newFormData[key].forEach((image) => {
          formData2.append('pictureUserSelect', {
            uri: image.uri,
            name: image.uri.split('/').pop(), // Đặt tên cho tệp hình ảnh
            type: 'image/jpeg', // Đặt kiểu MIME cho tệp hình ảnh
          });
        });
      } else if (typeof newFormData[key] === 'object') {
        if (key === 'tag' || key === 'pictureDaChon') {
          const arr = newFormData[key].map(i => parseInt(i));
          arr.forEach(i => {
            formData2.append(key, i);
          });
        } else {
          formData2.append(key, JSON.stringify(newFormData[key]));
        }
      } else {
        formData2.append(key, newFormData[key]);
      }
    });
    console.log("fomdata2",formData2);
    // Chuyển đổi FormData thành đối tượng để in ra console
    const formDataObject = {};
    formData2.forEach((value, key) => {
      formDataObject[key] = value;
    });
    
    
    console.log('Day la form data', formDataObject);

    // try {
    //   let token = await AsyncStorage.getItem('access-token');
    //   let res = await authApi(token).post(endpoints['UpPost'],formData2,{
    //     headers: {
    //       'Content-Type':'multipart/form-data',
    //     },
    //   })
    //   } catch (ex) {
    //       console.error(ex);
    //       return;
    //   }
     return onPressNext(()=>JourneyTable(newFormData));
  };
  const getTransportIcon = (type) => {
    switch (type) {
      case 'XE ĐÒ':
        return faCar;
      case 'XE ĐÒ':
        return faBus;
      case 'MAY BAY':
        return faPlane;
      case 'TAU LUA':
        return faTrain;
      default:
        return faUser; // Biểu tượng mặc định nếu loại phương tiện không khớp
    }
  }
  
  return (
    <div style={{ padding: '10px' }}>
      <div>
                <h4>
                <FontAwesomeIcon icon={faTag} onClick={handleAddDestination} style={{ cursor: 'pointer', fontSize: '24px', color: 'green', marginBottom: '-1px', marginTop: '-2px' }} />
                  Chọn tag:</h4>
        <div style={{ display: 'flex', overflowX: 'scroll', marginTop: '2px' }}>
          {tags.length === 0 && <div>Loading...</div>}
          {tags.map((tag, index) => (
            <div key={index} onClick={() => handleTagSelection(tag)} style={{ position: 'relative', padding: '10px', border: '1px solid black',backgroundColor: tagSelections[tag.id] === tag.id ? 'red' : 'lightgray', borderRadius: '10px', margin: '5px', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'lightgoldenrodyellow'} // Màu sáng hơn khi hover
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'lightgray'} // Trở về màu gốc khi không hover
            >
              <span>{tag.name}</span>
              {tagSelections[tag.id] && <FontAwesomeIcon icon={faCheck} size={16} color="green" style={{ position: 'absolute', top: '0', right: '1px', marginTop: '-7px', marginRight: '-11px' }} />}
            </div>
          ))}
        </div>
      </div>
  
      <div>
        <h4>
          Chọn phương tiện di chuyển:</h4>
        <div style={{ display: 'flex', overflowX: 'scroll', marginTop: '2px' }}>
        {transport.map((tr, index) => (
        <div
          key={index}
          onClick={() => handleTrSelection(tr)}
          style={{
            position: 'relative',
            padding: '10px',
            border: '1px solid black',
            backgroundColor: 'lightgray',
            borderRadius: '10px',
            margin: '5px',
            cursor: 'pointer',
          }}
        >
          <FontAwesomeIcon
            icon={getTransportIcon(tr.loai)}
            size="1px"
            color="blue"
            style={{ marginRight: '10px' }}
          />
          <span>{tr.loai}</span>
          {transports[tr.id] && (
            <FontAwesomeIcon
              icon={faUser}
              size="1x"
              color="green"
              style={{
                position: 'absolute',
                top: '0',
                right: '1px',
                marginTop: '-8px',
                marginRight: '-11px',
              }}
            />
          )}
        </div>
      ))}
        </div>
        <h4>Chi phí và số lượng tour:</h4>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
          <div style={{ marginRight: '20px' }}>
            <h6>Chi phí người lớn</h6>
            <input
              style={styles.textInput}
              placeholder="Nhập chi phí người lớn này nếu có"
              type="number"
              value={formData.chiPhi}
              onChange={e => onChangeText('chiPhi', e.target.value)}
            />
          </div>
          <div>
            <h6>Chi phí trẻ em</h6>
            <input
              style={styles.textInput}
              placeholder="Nhập chi phí trẻ em này nếu có"
              type="number"
              value={formData.chiPhiTreEm}
              onChange={e => onChangeText('chiPhiTreEm', e.target.value)}
            />
          </div>
          
          <div style={{ marginLeft: '50px' }}>
            <h6>Số lượng tour:</h6>
            <input
              style={styles.textInput}
              placeholder="Nhập số lượng tour"
              type="number"
              value={formData.soluong}
              onChange={e => onChangeText('soluong', e.target.value)}
            />
          </div>
        </div>
      </div>
  
      <div style={styles.container}>
        <h4>Chọn hành trình bắt đầu:</h4>
        <select
          style={styles.select}
          value={startingDestination}
          onChange={(e) => handleSelectDestination(e.target.value, true)}
        >
          {destinations.map((dest) => (
            <option key={dest.id} value={dest.id}>
              {dest.diaChi}
            </option>
          ))}
        </select>
        <div>
          <h4>Chọn ngày khởi hành:</h4>
          <div className=" text-dark">
            <input
              type="datetime-local"
              min="2024-01-01T00:00"
              max="2024-12-31T23:59"
              className="form-control p-1 m-1"
              value={formatISODate(dateNgayDi)}
              onChange={(e) => handleConfirmNgayDi(new Date(e.target.value))}
              required
            />
          </div>
          <p style={{ color: 'red' }}>Ngày đi dự kiến: {dateNgayDi.toLocaleString()}</p>
        </div>
      </div>
  
      <div style={styles.container}>
        <h4>Chọn hành trình kết thúc:</h4>
        <select
          style={styles.select}
          value={endingDestination}
          onChange={(e) => handleSelectDestination(e.target.value, false)}
        >
          {destinations.map((dest) => (
            <option key={dest.id} value={dest.id}>
              {dest.diaChi}
            </option>
          ))}
        </select>
        <div>
          <h4>Chọn ngày đến:</h4>
          <input
            type="datetime-local"
            min="2024-01-01T00:00"
            max="2024-12-31T23:59"
            className="form-control p-1 m-1"
            value={formatISODate(dateNgayDen)}
            onChange={(e) => handleConfirmNgayDen(new Date(e.target.value))}
            required
          />
          <p style={{ color: 'red' }}>Ngày đến dự kiến: {dateNgayDen.toLocaleString()}</p>
        </div>
      </div>
  
      <div style={styles.container}>
        <div style={styles.intermediateDestinationsContainer}>
          <h4>Địa điểm trung gian</h4>
          <FontAwesomeIcon icon={faLocation} onClick={handleAddDestination} style={{ cursor: 'pointer', fontSize: '24px', color: 'green', marginBottom: '-1px', marginTop: '-2px' }} />
        </div>
        <div>
          {showDestinationPicker &&
            Array(demAdd).fill(2).map((_, i) => (
              <div key={i} style={styles.intermediateDestinationsPickerContainer}>
                <div style={{ border: '1px solid black', margin: '5px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', padding: '10px' }}>
                    <span style={styles.headerText}>Chọn hành trình trung gian</span>
                    <FontAwesomeIcon icon={faTimesCircle} onClick={() => handleClose(i)} style={{ cursor: 'pointer', fontSize: '24px', color: 'red', marginBottom: '-1px', marginTop: '-2px' }} />
                  </div>
                  <div style={styles.pickerContainer}>
                    <select style={styles.select}
                      value={selectedDestinations[i] ? selectedDestinations[i].id : ''}
                      onChange={(e) => handleDestinationChange(e.target.value, i)}
                    >
                      {destinations.map(dest => (
                        <option key={dest.id} value={dest.id}>{dest.diaChi}</option>
                      ))}
                    </select>
                    <div>
                      {/* <button style={styles.iconButton} onClick={()=>
                          {tam=i;showDateNgayDenTGPicker(i)}}>
                        <FontAwesomeIcon icon={faCalendarCheck} />
                        <span>Chọn thời gian dự kiến đến :</span>
                      </button> */}
                       <span>Ngày đến tham quan:</span>
                        <input
                        type="datetime-local"
                        min="2024-01-01T00:00"
                        max="2024-12-31T23:59"
                        className="form-control p-1 m-1"
                        value={formatISODate(dateNgayDenTrungGian.get(i)|| new Date())}
                        onChange={(e) => {tam=i; handleConfirmNgayDenTrungGian(new Date(e.target.value), tam)}}
                        required
                      />
                       
                      <p style={{ color: 'red' }}>Ngày đến dự kiến: {dateNgayDenTrungGian.get(i)?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
  
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="primary" onClick={onPressBack}>Back</Button>
        <Button variant="primary" onClick={handleSubmit}>Finish</Button>
      </div>
    </div>
  );
}
  
  const styles = {
    textInput: {
      width: '400px',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
    },
    container: {
      border: '1px solid #ccc',
      borderRadius: '5px',
      padding: '10px',
      marginBottom: '20px',
    },
    select: {
      width: '100%',
      padding: '8px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      marginBottom: '10px',
    },

     intermediateDestinationsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '5px',
  },
  intermediateDestinationsPickerContainer: {
    marginTop: '10px',
  },
  pickerContainer: {
    padding: '10px',
  },
    iconButton: {
      backgroundColor: 'white',
      borderRadius: '35px',
      width: '125px',
      height: '40px',
      padding: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
    },
  };
  
export default SecondPage;