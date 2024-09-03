import React from "react";
import { BASE_URL, endpoints } from "../API";
import {
  Button,
  Carousel,
  Container,
  Form,
  FormControl,
  Nav,
  Navbar,
  Card,
  Image,
  Row,
  Col,
  Collapse,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/NewsDetails.css";
import { Link, useParams } from "react-router-dom";
import moment from "moment";

function NewsDetails() {
  const { postId } = useParams();
  const [post, setPost] = React.useState(null);
  const [categories, setCategories] = React.useState([]);
  const [comments, setComments] = React.useState([]);
  const [newComment, setNewComment] = React.useState("");
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const url = `${BASE_URL}${endpoints.category}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => setCategories(data));
  }, []);

  React.useEffect(() => {
    const url = `http://127.0.0.1:8000/postsTinTuc/1/comments/`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => setComments(data.results))
      .then((data) => console.log(data));
  }, []);

  React.useEffect(() => {
    const url = `http://127.0.0.1:8000/postsTinTuc/1/`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => setPost(data))
      .then((open) => setOpen(true))
      .catch((error) => console.error("Failed to fetch post details:", error));
  }, [postId]);

  const handleNewCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const handleNewCommentSubmit = (event) => {
    event.preventDefault();

    const url = `http://127.0.0.1:8000/postsTinTuc/1/comments/`;
    const data = {
      content: newComment,
    };

    const token = localStorage.getItem("token"); // Lấy token từ localStorage

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Sử dụng token trong header
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((newComment) => {
        setComments([...comments, newComment]);
        setNewComment("");
      })
      .catch((error) => console.error("Failed to create comment:", error));
  };

  if (!post) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Container>
        <Navbar expand="lg" className="bg-body-tertiary">
          <Navbar.Brand href="/news">TIN TỨC</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Nav className="me-auto">
            <Nav.Link href="#home">Trang chủ</Nav.Link>
            <Nav.Link href="#link">Link</Nav.Link>
          </Nav>
          <Form className="d-flex">
            <FormControl
              type="search"
              placeholder="Tìm kiếm"
              className="me-2"
              aria-label="Search"
            />
            <Button variant="outline-success">Tìm kiếm</Button>
          </Form>
        </Navbar>

        <Navbar expand="lg" className="bg-body-tertiary">
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Nav className="mr-auto">
            {categories.map((category) => (
              <Nav.Item key={category.id}>
                <Link
                  to={`/news/${category.name}`}
                  style={{
                    margin: "5px",
                    textDecoration: "none",
                    color: "black",
                    fontWeight: "bold",
                  }}
                >
                  <h4>| {category.name} |</h4>
                </Link>
              </Nav.Item>
            ))}
          </Nav>
        </Navbar>
      </Container>
      <Collapse in={open}>
        <div id="collapse-text" className="container mt-5 ">
          <div className="row">
            <div className="col-12 col-md-8 offset-md-2">
              <div className="card mb-3">
                <div className="card-header d-flex align-items-center">
                  <img
                    src={post.user_NV.avatar}
                    alt="User Avatar"
                    className="rounded-circle"
                    style={{ width: "50px", height: "50px" }}
                  />
                  <h5 className="mb-0 ml-2">{post.user_NV.username}</h5>
                </div>

                <div className="card-body">
                  <h2 className="card-title">{post.title}</h2>
                  <p className="text-muted">
                    {new Date(post.created_date).toLocaleString()}
                  </p>
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  <div className="mt-4">
                    <Carousel>
                      {post.pic.map((picture) => (
                        <Carousel.Item key={picture.id}>
                          <img
                            src={picture.picture}
                            alt="Post related"
                            className="img-fluid"
                          />
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Collapse>
      <div id="collapse-text" className="comments-section mt-5">
        <Container>
          <h3>Comments</h3>
          {localStorage.getItem("user") ? (
            <>
              <Form
                onSubmit={handleNewCommentSubmit}
                className="mt-4 mb-4 d-flex"
                style={{ width: "100%" }}
              >
                <div style={{ flex: 1, marginRight: "10px" }}>
                  {" "}
                  {/* Adjust the marginRight as needed */}
                  <Form.Group controlId="newComment">
                    <Form.Label>Add a Comment</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Write your comment here..."
                      style={{ width: "100%" }}
                      id="newComment"
                    />
                  </Form.Group>
                </div>
                <Button
                  variant="primary"
                  type="submit"
                  className="mt-2 align-self-end"
                  onSubmit={handleNewCommentChange}
                >
                  Submit
                </Button>
              </Form>
            </>
          ) : (
            <p>Please log in to leave a comment</p>
          )}

          {comments.map((comment) => (
            <Card key={comment.id} className="mb-3">
              <Card.Body>
                <Row className="d-flex align-items-center">
                  <Col xs={2} md={1} className="d-flex justify-content-center">
                    <Image
                      src={comment.user.avatar}
                      roundedCircle
                      style={{ width: "50px", height: "50px" }}
                    />
                  </Col>
                  <Col xs={10} md={11}>
                    <h6>{comment.user.username}</h6>
                    <p>{comment.content}</p>
                    <p className="text-muted" style={{ textAlign: "right" }}>
                      {moment(comment.created_at).format("DD/MM/YYYY hh:mm:ss")}
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Container>
      </div>
    </>
  );
}

export default NewsDetails;
