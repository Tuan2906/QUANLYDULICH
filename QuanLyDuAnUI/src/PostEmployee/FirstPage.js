import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import './FirstPage.css';
import APIs, { endpoints } from '../configs/APIs';

const ImageList = ({ page, loadPicture, loading, images, onSelect, loadMore }) => {
  const [imageSelections, setImageSelections] = useState({});

  const handleImageSelection = (image) => {
    const updatedSelections = { ...imageSelections };
    updatedSelections[image.id] = !updatedSelections[image.id];
    setImageSelections(updatedSelections);
    onSelect(image);
  };

  return (
    <>
      <div>Choose image from library</div>
      <div className="scrollable-container" onScroll={loadMore}>
        {loading && <div className="loading">Loading...</div>}
        {images.map((image, index) => (
          <button key={index} onClick={() => handleImageSelection(image)} className="image-button">
            <div className="image-container">
              <img src={image.picture} alt="Selected" className="image" />
              {imageSelections[image.id] && (
                <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
              )}
            </div>
          </button>
        ))}
        {loading && page > 1 && <div className="loading">Loading more...</div>}
      </div>
    </>
  );
};

const FirstPage = ({ formData, onChangeText, onPressNext }) => {
  const [image, setImage] = useState(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [pictureDaChon, setPictureDaChon] = useState([]);
  const [picture, setPicture] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadPicture = async () => {
    if (page > 0) {
      setLoading(true);
      try {
        let res = await APIs.get(`${endpoints['picture']}?page=${page}`);
        if (res.data.next === null) {
          setPage(0);
        }
        if (page === 1) {
          setPicture(res.data.results);
        } else {
          setPicture((current) => [...current, ...res.data.results]);
        }
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadPicture();
  }, [page]);

  const isCloseToEnd = ({ target }) => {
    const { scrollWidth, clientWidth, scrollLeft } = target;
    return scrollWidth - clientWidth - scrollLeft < 20;
  };

  const loadMore = (e) => {
    if (!loading && page > 0 && isCloseToEnd(e)) {
      setPage(page + 1);
    }
  };
 // Phan xu ly user chon tu may tinh 
  const handleImageUser = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.style.display = 'none';

    input.onchange = (e) => {
      const files = (e.target.files[0]);
      console.log('files',files)
      const filesForm = Array.from(e.target.files)
      const selectedImages = filesForm.map((file) => URL.createObjectURL(file));
      const picTam =  filesForm.map((file) => ({
        uri: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
      }));

      formData.pictureUserSelect = [...formData.pictureUserSelect,files];
      formData.anhTam.push(
        ...picTam.map((pic) => ({
          id: 'device',
          picture: pic.uri,
        }))
      );
      setPictureDaChon([...formData.anhTam]);
      onChangeText(formData);
    };

    input.click();
  };
 // Phan chon anh tu he thong
  const handleImageSelect = (image) => {
    setImage(image);
    if (!formData.pictureDaChon.includes(image.id)) {
      formData.pictureDaChon.push(image.id);
      formData.anhTam.push({ id: image.id, picture: image.picture });
    }
    setPictureDaChon([...formData.anhTam]);
    onChangeText(formData);
  };

  const handlePressChooseImgFromLibrary = () => {
    setShowImagePicker(!showImagePicker);
  };

  const handleUnselectImage = (index) => {
    const updatedImages = [...pictureDaChon];
    updatedImages.splice(index, 1);
    setPictureDaChon(updatedImages);
    formData.anhTam = updatedImages;

    if (formData.anhTam.length === 0) {
      formData.pictureDaChon = [];
      formData.pictureUserSelect = [];
      return;
    }

    const filteredPictures = formData.anhTam.filter((image) => image.id !== 'device');
    formData.pictureDaChon = filteredPictures.map((image) => image.id);
    const selectedPictures = formData.anhTam.filter((image) => image.id === 'device');
    formData.pictureUserSelect = formData.pictureUserSelect.filter((picture) =>
      selectedPictures.some((selected) => selected.picture === picture.uri)
    );
    
  };

  return (
    <div className="container">
      <label>Post title:</label>
      <input
        type="text"
        className="input"
        value={formData.title}
        onChange={(e) => onChangeText('title', e.target.value)}
      />
      <label>Post content:</label>
      <textarea
        className="input inputContent"
        value={formData.content}
        onChange={(e) => onChangeText('content', e.target.value)}
        rows="5"
        maxLength="500"
        placeholder="Enter your content here"
      />
      <label>Post description:</label>
      <textarea
        className="input inputContent"
        value={formData.description}
        onChange={(e) => onChangeText('description', e.target.value)}
        rows="2"
      />
      <button className="imagePickerButton" onClick={handlePressChooseImgFromLibrary}>
        Choose images from application
      </button>
      {showImagePicker && picture ? (
        <ImageList images={picture} page={page} loadPicture={loadPicture} loading={loading} loadMore={loadMore} onSelect={handleImageSelect} />
      ) : (
        <div>Loading...</div>
      )}
      <button className="imagePickerButton" onClick={handleImageUser}>
        Choose images from phone
      </button>
      <div className="imageScroll">
        {formData.anhTam.map((image, index) => (
          <div key={index} className="imageContainer" onClick={() => handleUnselectImage(index)}>
            <img src={image.picture} className="image" alt="Selected" style={{ width: 80, height: 50, marginRight: 0 }} />
            <FontAwesomeIcon icon={faTimes} className="imageCloseIcon" />
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-end">
      <Button variant="primary" onClick={onPressNext}>
        Next
      </Button>
    </div>
    </div>
  );
};

export default FirstPage;
