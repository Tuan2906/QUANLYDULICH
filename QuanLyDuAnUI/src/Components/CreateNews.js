import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

import {
  Form,
  Button,
  Container,
  Card,
  Navbar,
  Nav,
  FormControl,
} from "react-bootstrap";
import { BASE_URL, endpoints } from "../API";
import axios from "axios";
import { Link } from "react-router-dom";

const NewsPostForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: "",
    pics: [],
  });
  const [categories, setCategories] = React.useState([]);
  const nav = useNavigate();
  React.useEffect(() => {
    const url = `${BASE_URL}${endpoints.category}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => setCategories(data));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "pics") {
      setFormData({
        ...formData,
        [name]: Array.from(files),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };


  const handleSubmit = async (e) => {
    const token = localStorage.getItem("access-token");
    const url = `${BASE_URL}${endpoints.postnews}`;
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("danhmuc", formData.categoryId);
    formData.pics.forEach((file, index) => {
      data.append(`pic${index}`, file);
    });

    try {
      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      alert("Success");
      nav('/journeys')
    } catch (error) {
      console.error(error);
      alert("Failed", error);
    }
  };

  return (
    <>
      <Container className="mt-5">
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>Tạo bài đăng</Card.Title>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formTitle" className="mb-3">
                <Form.Label>Tiêu đề</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter title"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formContent" className="mb-3">
                <Form.Label>Nội dung</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Enter content"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formCategoryId" className="mb-3">
                <Form.Label>Loại bài đăng</Form.Label>
                <Form.Control
                  as="select"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn loại</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="formPics" className="mb-3">
                <Form.Label>Hình ảnh đính kèm</Form.Label>
                <Form.Control
                  type="file"
                  name="pics"
                  multiple
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100" >
                Tạo
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default NewsPostForm;
