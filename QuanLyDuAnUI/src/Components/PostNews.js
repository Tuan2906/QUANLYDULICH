import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL, endpoints } from "../API";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Card, Form, FormControl } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";

function PostNews() {
  const [categories, setCategories] = React.useState([]);
  const [q, setQ] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [posts, setPosts] = React.useState([]);
  const cate = useParams().cate;

  React.useEffect(() => {
    // Fetch the categories from the API with get request
    const url = `${BASE_URL}${endpoints.category}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => setCategories(data));
  }, []);

  React.useEffect(() => {
    // Fetch the categories from the API with get request
    let url = `${BASE_URL}${endpoints.post}?q=${q}`;
    if (cate) {
      url = `${BASE_URL}${endpoints.post}?danhMuc=${cate}`;
    }
    fetch(url)
      .then((response) => response.json())
      .then((data) => setPosts(data));
  }, [cate, q]);

  function handleSearchInputChange(event) {
    setSearchQuery(event.target.value);
  }

  // Hàm xử lý sự kiện onClick cho nút tìm kiếm
  function handleSearch() {
    setQ(searchQuery);
  }

  function truncateTo30Words(text) {
    const words = text.split(/\s+/); // Split by any whitespace
    if (words.length > 10) {
      return words.slice(0, 10).join(" ") + "..."; // Join the first 30 words and add ellipsis
    }
    return text; // Return original text if it's 30 words or less
  }

  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  }

  return (
    <>
      <script
        src="https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js"
        crossorigin
      ></script>

      <script
        src="https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.production.min.js"
        crossorigin
      ></script>

      <script
        src="https://cdn.jsdelivr.net/npm/react-bootstrap@next/dist/react-bootstrap.min.js"
        crossorigin
      ></script>

      <div style={{ display: "flex", marginTop: "100px" }}>
        {categories.map((category) => (
          <Link
            to={`/news/${category.name}`}
            style={{
              margin: "5px" /* Adjust the margin as needed for distance */,
              textDecoration: "none",
              color: "black",
              fontWeight: "bold",
            }}
          >
            <h3>| {category.name} |</h3>
          </Link>
        ))}
      </div>
      <Form className="d-flex">
        <FormControl
          type="search"
          placeholder="Tìm kiếm"
          className="me-2"
          aria-label="Search"
          onChange={handleSearchInputChange}
        />
        <Button variant="outline-success" onClick={handleSearch}>
          Tìm kiếm
        </Button>
      </Form>

      <Container>
        <h1>Tin mới nhất</h1>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {posts.map(
            (post) =>
              post.pic.length > 0 && (
                <>
                  <Card
                    style={{
                      flexBasis: "calc(33.333% - 20px)",
                      marginBottom: "20px",
                      height: "600px", // Fixed height
                      overflow: "hidden", // Hides the overflow content
                    }}
                    key={post.id}
                  >
                    <Card.Img
                      style={{
                        height: "50%",
                        objectFit: "cover",
                      }}
                      variant="left"
                      src={post.pic[0].picture}
                    />
                    <Card.Body variant="right">
                      <Card.Title variant="right">{post.title}</Card.Title>
                      <Card.Text
                        style={{
                          height: "20%",
                        }}
                      >
                        <p
                          dangerouslySetInnerHTML={{
                            __html: truncateTo30Words(post.content),
                          }}
                        ></p>
                        <div style={{ textAlign: "right" }}>
                          Ngày đăng: {formatDate(post.created_date)}
                        </div>
                        <div
                          style={{
                            textAlign: "right",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            marginTop: "10px",
                          }}
                        >
                          <img
                            src={post.user_NV.avatar}
                            alt="User"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                              marginRight: "10px",
                            }}
                          />
                          <span>
                            Đăng bởi:{" "}
                            <p style={{ fontWeight: "bold" }}>
                              {post.user_NV.username}
                            </p>
                          </span>
                        </div>
                      </Card.Text>
                    </Card.Body>
                    <Link
                      to={`/news/details/${post.id}`}
                      className="btn btn-info pd-auto"
                      variant="primary"
                    >
                      Doc them tin tuc
                    </Link>
                  </Card>
                </>
              )
          )}
        </div>
      </Container>
    </>
  );
}

export default PostNews;
