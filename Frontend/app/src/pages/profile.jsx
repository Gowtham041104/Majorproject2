import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Form,
  ListGroup,
} from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import Loader from "../components/Loader";
import Message from "../components/Message";
import QRCode from "qrcode";
//import UserPosts from "../components/Posts/UserPosts";
import { resolveImageUrl } from "../utils/imageUrl";
import Avatar from "../components/Avatar";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const handleClose = () => setMessage("");
  const [userPosts, setUserPosts] = useState([]); // State for user posts

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userInfo = localStorage.getItem("userInfo");

        if (!userInfo) {
          navigate("/login");
          return;
        }
        else {

        }
        const pasredUser = JSON.parse(userInfo);
        const { data } = await api.get("/api/users/profile");
        setUser(data);

        const {data:postsData} = await api.get(`/api/posts/user/${pasredUser._id}`);
        setUserPosts(postsData)

        if (data.twoFactorAuthSecret) {
          const otpauthurl = `otpauth://totp/SecretKey?secret=${data.twoFactorAuthSecret}`;
          QRCode.toDataURL(
            otpauthurl,
            { width: 200, margin: 2 },
            (err, url) => {
              if (!err) {
                setQrCodeUrl(url);
              }
            }
          );
        }
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        );
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("userInfo");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const searchHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const userInfo = localStorage.getItem("userInfo");

      if (!userInfo) {
        navigate("/login");
        return;
      }

      const { data } = await api.get(`/api/users/search?keyword=${keyword}`);
      setResults(data);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };



  const startChartHandler = async (userId)=>{
    try{
      setLoading(true);
      const {data} = await api.post('/api/chat',{userId});
      navigate(`/chat/${data._id}`);
  
    }
    catch (error) {
      setError(error.response && error.response.data.message ? error.response.data.message : error.message);
    } finally {
      setLoading(false);
    }
  }


  const uploadProfilePictureHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const userInfo = localStorage.getItem("userInfo");

      if (!userInfo) {
        navigate("/login");
        return;
      }

      const formData = new FormData();
      formData.append("profilePicture", profilePicture);

      const { data } = await api.post(
        "/api/users/profile/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage("Profile Picture Updated Successfully");
      // Cache-bust to ensure latest image is shown after navigation
      const cacheBusted = `${data.profilePicture}?t=${Date.now()}`;
      setUser({ ...user, profilePicture: cacheBusted });
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const enable2FA = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const { data } = await api.post("/api/auth/enable-2fa", {});
      const otpauthUrl = data.secret;
      QRCode.toDataURL(otpauthUrl, { width: 200, margin: 2 }, (err, url) => {
        if (err) {
          setError("Failed to generate QR Code");
        } else {
          setQrCodeUrl(url);
        }
      });
      setMessage("Two Factor authentication enabled successfully...");
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (userId) => {
    try {
      setLoading(true);

      await api.post(`/api/users/follow/${userId}`, {});
      setMessage("User followed Successfully");

      const { data } = await api.get("/api/users/profile");
      setUser(data);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };
  const unfollowUser = async (userId) => {
    try {
      setLoading(true);

      await api.post(`/api/users/unfollow/${userId}`, {});
      setMessage("User followed Successfully");

      const { data } = await api.get("/api/users/profile");
      setUser(data);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row>
        <Col md="5">
          <Card className="mt-4 p-3">
            <h3 className="text-center bg-light text-dark mt-2">Welcome</h3>
            {message && (
              <Message variant="success" onClose={() => setMessage("")}>
                {message}
              </Message>
            )}
            {error && (
              <Message variant="danger" onClose={() => setError(null)}>
                {error}
              </Message>
            )}

            {/* profile pic */}

            <div className="text-center">
              <Avatar src={user.profilePicture} alt="Profile" size={100} />
            </div>

            <Form onSubmit={uploadProfilePictureHandler}>
              <Form.Group>
                <Form.Control
                  type="file"
                  onChange={(e) => setProfilePicture(e.target.files[0])}
                ></Form.Control>
              </Form.Group>
              <Button type="submit" variant="light" className="mt-3 btn-sm">
                Upload/Edit Profile Picture
              </Button>
            </Form>

            <ul className="list-group mt-3">
              <li className="list-group-item list-group-item-light  d-flex justify-content-between align-items-center">
                <strong>Username:</strong> {user.username}
              </li>
              <li className="list-group-item list-group-item-secondary d-flex justify-content-between align-items-center">
                <strong>Email:</strong> {user.email}
              </li>
              {!user.twoFactorAuth && (
                <Button onClick={enable2FA} variant="primary" className="mt-3">
                  Enable 2FA
                </Button>
              )}

              {qrCodeUrl && (
                <div
                  className="accordion accordion-flush"
                  id="accordionFlushExample"
                >
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#flush-collapseOne"
                        aria-expanded="false"
                        aria-controls="flush-collapseOne"
                      >
                        Authenticate QR Code
                      </button>
                    </h2>
                    <div
                      id="flush-collapseOne"
                      className="accordion-collapse collapse"
                      data-bs-parent="#accordionFlushExample"
                    >
                      <div className="accordion-body">
                        <img src={qrCodeUrl} alt="2FA QR Code" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ul>
          </Card>
        </Col>

        <Col md="7">
          <Card className="mt-4 p-3">
            <h3 className="text-center bg-light text-dark mt-2">
              Search Users
            </h3>
            <Form onSubmit={searchHandler} className="d-flex">
              <Form.Group controlId="keyword">
                <Form.Control
                  type="text"
                  placeholder="Search by username"
                  value={keyword}
                  className="form-control me-sm-2"
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </Form.Group>
              <Button className="btn btn-primary my-2 my-sm-0" type="submit">
                Search
              </Button>
            </Form>
            {loading && <Loader />}
            {error && <Message variant="danger">{error}</Message>}
            <ListGroup className="mt-4">
              {results.map((result) => (
                <ListGroup.Item key={result._id}>
                  <Link to={`/user/${result._id}`}>
                    <span>{result.username} : </span>
                  </Link>
                  <Button variant="success" className="ml-4" onClick={()=>followUser(result._id)}>
                    Follow
                  </Button>

                  <Button variant="light" onClick={()=>startChartHandler(result._id)}>Chat</Button>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <Row>
              <Col md={6}>
                <h5 className="mt-4 bg-light p-2 text-center">
                  Followers{" "}
                  <span class="badge bg-primary rounded-pill">
                    {user.followers?.length}
                  </span>
                </h5>

                {user.followers?.map((follower) => (
                  <Row className="g-2">
                    <Col key={follower._id}>
                      <Card className="h-100 text-center">
                        <Card.Body className="d-flex align-items-center">
                          <Link to={`/user/${follower._id}`}>
                            <Avatar src={follower.profilePicture} alt={follower.username} size={50} className="me-2" />
                          </Link>
                          <Card.Title className="mb-0">
                            <Link to={`/user/${follower._id}`}>
                              {follower.username}
                            </Link>
                          </Card.Title>

                          
                          <Button
                              variant="success"
                              className="ms-2 btn-sm"
                              onClick={() => followUser(follower._id)}
                            >
                              Unfollow
                            </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                ))}
              </Col>

              <Col md={6}>
                <h5 className="mt-4 bg-light p-2 text-center">
                  Following{" "}
                  <span class="badge bg-primary rounded-pill">
                    {user.following?.length}
                  </span>
                </h5>

                
                {user.following?.map((following) => (
                  <Row className="g-2">
                    <Col key={following._id}>
                      <Card className="h-100 text-center">
                        <Card.Body className="d-flex align-items-center">
                          <Link to={`/user/${following._id}`}>
                            <Avatar src={following.profilePicture} alt={following.username} size={50} className="me-2" />
                          </Link>
                          <Card.Title className="mb-0">
                            <Link to={`/user/${following._id}`}>
                              {following.username}
                            </Link>
                          </Card.Title>

                          <Button
                              variant="danger"
                              className="ms-2 btn-sm"
                              onClick={() => unfollowUser(following._id)}
                            >
                              Unfollow
                            </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                ))}
              </Col>
            </Row>
<hr />
            <h3 className="text-center mt-4">Your Posts</h3>
            <Row className="g-2">
                {userPosts.map((post) => (
                  <Col key={post._id} xs={4}>
                    <Card>
                      <Link to={`/post/${post._id}`}>
                        <Card.Img
                          variant="top"
                          src={resolveImageUrl(post.image)}
                          alt="Post image"
                          className="img-fluid"
                          style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://via.placeholder.com/300";
                          }}
                        />
                      </Link>
                    </Card>
                  </Col>
                ))}
              </Row>
            
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Profile;