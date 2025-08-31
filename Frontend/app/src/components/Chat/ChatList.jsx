import React, { useEffect, useState } from "react";
import { ListGroup, Button } from "react-bootstrap";
import api from "../../utils/api";
import { Link, useNavigate } from "react-router-dom";
import Message from "../Message";
import Loader from "../Loader";
import Avatar from "../Avatar";

function ChatList() {
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleClose = () => setMessage("");
  const navigate = useNavigate();

  const fetchChats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/chat");
      setChats(data);
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
  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <>
      <br />
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="success" onClose={() => setMessage("")}>
          {message}
        </Message>
      ) : (
      <>
      <h5>Chat Users</h5>
      <hr />
        <ListGroup>
          {chats.map((chat) => (
            <ListGroup.Item key={chat._id}>
              <div className="d-flex align-items-center">
                {chat.users.map((user) => (
                  <div
                    key={user._id}
                    className="d-flex align-items-center me-3"
                  >
                    <Avatar src={user.profilePicture} alt={user.username} size={40} className="me-2" />
                    <span>{user.username}</span>
                  </div>
                ))}
                <Button
                  variant="link"
                  className="ms-auto"
                  onClick={() => navigate(`/chat/${chat._id}`)}
                >
                  Open <i className="fa-solid fa-comments"></i>Chat
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
        </>
      )}
    </>
  );
}

export default ChatList;