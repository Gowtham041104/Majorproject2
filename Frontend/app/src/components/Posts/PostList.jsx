import React, { useState, useRef } from "react";
import { Card, Button, Form } from "react-bootstrap";
import api from "../../utils/api";
import Loader from "../Loader";
import Message from "../Message";
import { resolveImageUrl } from "../../utils/imageUrl";
import Avatar from "../Avatar";
import { formatRelativeTime } from "../../utils/time";

function PostList({ posts, fetchPosts ,startChartHandler}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const handleClose = () => setMessage("");
  const [commentContent, setCommentContent] = useState({});
  const [optimisticLikes, setOptimisticLikes] = useState({});
  const lastTapRef = useRef({});

  const submitCommentHandler = async (postId) => {
    try {
      setLoading(true);
      await api.post(
        `/api/posts/${postId}/comments`,
        { content: commentContent[postId] }
      );
      setCommentContent({ ...commentContent, [postId]: "" });
      fetchPosts();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  };
  
  const deletePostHandler = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        setLoading(true);
        await api.delete(`/api/posts/${postId}`);
        fetchPosts();
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        );
      }
    }
  };

  const toggleLike = async (post) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const isLiked = (post.likes || []).includes(userInfo._id);
    const url = isLiked ? `/api/posts/${post._id}/unlike` : `/api/posts/${post._id}/like`;
    
    // optimistic update
    setOptimisticLikes((prev) => ({
      ...prev,
      [post._id]: {
        liked: !isLiked,
        count: (post.likes?.length || 0) + (!isLiked ? 1 : -1),
      },
    }));
    try {
      await api.post(url, {});
      fetchPosts();
    } catch (e) {
      // revert on error
      setOptimisticLikes((prev) => ({ ...prev, [post._id]: undefined }));
      setError(
        e.response && e.response.data.message
          ? e.response.data.message
          : e.message
      );
    }
  };

  const handleImageTap = (postId) => {
    const now = Date.now();
    const last = lastTapRef.current[postId] || 0;
    if (now - last < 300) {
      const post = posts.find((p) => p._id === postId);
      if (post) toggleLike(post);
    }
    lastTapRef.current[postId] = now;
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger" onClose={() => setError(null)}>
          {error}
        </Message>
      ) : (
        posts?.map((post) => (
          <>
            <Card key={post._id} className="my-3 card-post">
              <Card.Body>
                <Card.Title>
                  <div className="d-flex align-items-center">
                    <Avatar
                      src={post.user.profilePicture}
                      alt={post.user.username}
                      size={40}
                      className="me-2"
                    />
                    <span>{post.user.username}</span>
                    {post.user._id ===
                      JSON.parse(localStorage.getItem("userInfo"))._id && (
                      <Button
                        variant="danger"
                        className="btn-sm position-absolute top-0 end-0 m-2  btn-outline"
                        onClick={() => deletePostHandler(post._id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </Button>
                    )}

<Button variant="light" onClick={()=>startChartHandler(post.user._id)}>Chat</Button>
                  </div>
                </Card.Title>
                <Card.Text>{post.content}</Card.Text>
                <Card.Text>
                  <small className="text-subtle">
                    {formatRelativeTime(post.createdAt)}
                  </small>
                </Card.Text>

                {post?.image && (
                  <Card.Img
                    variant="top"
                    src={resolveImageUrl(post.image)}
                    alt="Post image"
                    className="card-img-top post-image"
                    style={{
                      width: "300px",
                      height: "300px",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://via.placeholder.com/300";
                    }}
                    onClick={() => handleImageTap(post._id)}
                  />
                )}

                <div className="action-bar mt-2">
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => toggleLike(post)}
                  >
                    <i
                      className={
                        (optimisticLikes[post._id]?.liked || (post.likes || []).includes(JSON.parse(localStorage.getItem("userInfo"))._id))
                          ? "fa-solid fa-heart text-danger"
                          : "fa-regular fa-heart"
                      }
                    ></i>
                  </Button>
                  <span className="text-muted">
                    {(optimisticLikes[post._id]?.count ?? post.likes?.length) || 0} likes
                  </span>
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => {
                      const url = `${window.location.origin}/post/${post._id}`;
                      if (navigator.share) {
                        navigator.share({ title: 'Post', url }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(url).then(() => {
                          setMessage('Link copied');
                          setTimeout(() => setMessage(''), 1000);
                        });
                      }
                    }}
                  >
                    <i className="fa-solid fa-share"></i>
                  </Button>
                </div>

              </Card.Body>
              
              <div
                className="accordion accordion-flush"
                id={`accordionFlushExample-${post._id}`}
              >
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#flush-collapseOne-${post._id}`}
                      aria-expanded="false"
                      aria-controls={`flush-collapseOne-${post._id}`}
                    >
                      Comments . <i className="fa-solid fa-comment ml-3"></i>
                    </button>
                  </h2>
                  <div
                    id={`flush-collapseOne-${post._id}`}
                    className="accordion-collapse collapse"
                    data-bs-parent={`#accordionFlushExample-${post._id}`}
                  >
                    <div className="accordion-body">
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                          submitCommentHandler(post._id);
                        }}
                      >
                        <Form.Group controlId={`commentContent-${post._id}`}>
                          <Form.Control
                            type="text"
                            placeholder="Write a comment..."
                            value={commentContent[post._id] || ""}
                            onChange={(e) =>
                              setCommentContent({
                                ...commentContent,
                                [post._id]: e.target.value,
                              })
                            }
                          ></Form.Control>
                        </Form.Group>
                        <Button
                          type="submit"
                          variant="primary"
                          className="mt-2 btn-sm"
                        >
                          Comment
                        </Button>
                      </Form>

                      <Card.Text className="mt-2">
                        {post.comments.map((comment) => (
                          <div key={comment._id}>
                            <strong>{comment.user.username}</strong>
                            <p>{comment.content}</p>
                          </div>
                        ))}
                      </Card.Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        ))
      )}
    </>
  );
}

export default PostList;