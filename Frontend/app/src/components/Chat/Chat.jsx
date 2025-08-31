import React, { useState, useEffect } from "react";
import { Form, Button, ListGroup } from "react-bootstrap";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import api from "../../utils/api";
import Loader from "../Loader";
import Message from "../Message";
import Avatar from "../Avatar";
import { resolveImageUrl } from "../../utils/imageUrl";

const ENDPOINT = 'https://majorproject2-1-066b.onrender.com';
let socket;

function Chat() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messageContent, setMessageContent] = useState('');


  useEffect(() => {
    socket = io(ENDPOINT);

    socket.emit('joinChat', chatId);

    socket.on('receiveMessage', (message) => {
      // console.log('Message received:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [chatId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/chat/${chatId}`);
      setMessages(data); // Assuming data contains the array of messages
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response && error.response.data.message ? error.response.data.message : error.message);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  console.log(messages)

  const submitMessageHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/api/chat/${chatId}/message`, { content: messageContent });
      const lastMessage = data.messages[data.messages.length - 1]; // Get the last message
 
      socket.emit('sendMessage', { chatId,  "content":lastMessage.content});
      setMessageContent('');
    } catch (error) {
      setError(error.response && error.response.data.message ? error.response.data.message : error.message);
    }
  };

  return (
    <div className="mt-3">
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <ListGroup>
          {messages?.map((message) => (
            <ListGroup.Item key={message._id}>
              <div className="d-flex align-items-center">
                <Avatar src={message?.sender?.profilePicture} alt={message?.sender?.username} size={32} className="me-2" />
                <div>
                  <strong>{message?.sender?.username}</strong>
                  <div>{message?.content}</div>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      <Form onSubmit={submitMessageHandler}>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Type a message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
          />
        </Form.Group>
        <Button type="submit" variant="primary" className="mt-2">
          Send
        </Button>
      </Form>
    </div>
  );
}

export default Chat;