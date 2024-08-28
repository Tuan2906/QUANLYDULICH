
import { useEffect, useRef, useState } from "react";
import { Button, Card, CardTitle, Col, Container, Image, NavDropdown, Row  } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Header from '../Common/Header';
import Footer from '../Common/Footer';
import APIs, { endpoints } from "../../config/APIs";
import getTags, { getPosts } from "../../LoadAPI";
import MySpinner from "../Common/Spiner";
import moment from "moment";
import { CustomCardImg } from "../Common/style";
import "../Common/Static/Styles.css"
import { FiFilter ,FiDollarSign } from 'react-icons/fi';
import VanillaTilt from 'vanilla-tilt';
import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
// ..
AOS.init();
AOS.refresh();

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [Tag, setTag] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const allTags= useRef(null);

  const nav = useNavigate();

  const loadTag= async () => {
    let data = await getTags();
    setTag(data);
    if (allTags.current === null) {
      allTags.current = data;
    }
  };

  const handleSelect = async (option) => {
    console.log('Selected option:', option);
    if (option !== null){
      let tag = allTags.current.filter(t => t.id == option);
      setTag(tag);
      let post = await getPosts(option, 1);
      setPosts([post]);
      setSelectedOption(tag.name);
    } else {
      setTag(allTags.current);
    }
  };

  const loadPosts= async () => {
    try {
      let datas = Tag.map(async(tag) => {
        let data = await getPosts(tag.id, 1);
        return data;
      });
      const result = await Promise.all(datas);
      setPosts(result);
    } catch(ex) {
      console.error(ex);
    }
  };

  useEffect(() => {
    if (Tag.length > 0) {
      loadPosts();
    }
  }, [Tag]);

  useEffect(() => {
    loadTag();
  }, []);

  useEffect(() => {
    VanillaTilt.init(document.querySelectorAll(".custom-card"), {
      max: 25,
      speed: 400
    });
  }, [posts]);

  return (
    <>
      <Container style={{ marginTop: 100 }}> 
        <div style={{ display: "flex" }}>
          <FiFilter style={{ fontSize: 30, marginTop: 10 }} /> 
          <NavDropdown title="Tag" id="basic-nav-dropdown" style={{ fontSize: 30 }}>
            {allTags.current == null ? Tag : allTags.current.map(c => (
              <NavDropdown.Item key={c.id} href="#" onClick={() => handleSelect(c.id)}>{c.name}</NavDropdown.Item>
            ))}
            <NavDropdown.Item key={Tag.length} href="#" onClick={() => handleSelect(null)}>All</NavDropdown.Item>
          </NavDropdown>
        </div>
        {loading ? (
          <MySpinner animation="border" variant="primary" />
        ) : (
          Tag.map((tag, index) => (
            <Row key={index} className="my-4"
            
              data-aos="fade-up"
              data-aos-offset="70"
              data-aos-delay="50"
              data-aos-duration="500"
              data-aos-easing="ease-in-out"
              data-aos-mirror="true"
              data-aos-once="false"
              data-aos-anchor-placement="top-center"
            >
              <Col style={{ display: "flex", color: "#000" }}>
                <h3>{tag.name}</h3>
                <Button variant="link">
                  Xem thêm
                </Button>
              </Col>
              <Col xs={12}>
                {posts[index] ? (
                  <Row>
                    {posts[index].map((post, postIndex) => (
                      <Col key={post.id} xs={12} md={3} className="my-3">
                        <Card className="custom-card" data-tilt>
                          <Card.Header className="d-flex align-items-center">
                            <Image src={post.user_NV.avatar} style={{ width: 20, height:20, borderRadius:'50%' }}/>
                            <CardTitle className="mt-2" style={{ marginLeft: '10px' }}>{post.user_NV.username}</CardTitle>
                          </Card.Header>
                          <CustomCardImg variant="top" src={post.pic[0] !== undefined ? post.pic[0].picture : ""} />
                          <Card.Body>
                            <Card.Title className="title">{post.title}</Card.Title>
                            <Row className="text-center">
                              <div style={{display:'flex',justifyContent:'space-around'}}>
                                <span><i className="fa fa-calendar"></i>  Khởi hành: {moment(post.journey.ngayDi).format("DD/MM/YYYY")}</span>
                                <span>{post.avgRate}<i className="fa fa-star"></i> </span>
                              </div>
                              <div>
                                <i className="fa fa-money" ><FiDollarSign/><span>Giá vé: {post.gia[0]}</span></i> 
                                <Button style={{ marginLeft: 10 }} variant="danger" onClick={() => nav(`detail/${post.id}`)}>
                                  Xem chi tiết
                                </Button>
                              </div>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <MySpinner animation="border" variant="primary" />
                )}
              </Col>
            </Row>
          ))
        )}
      </Container>

    </>
  );
};

export default Home;
