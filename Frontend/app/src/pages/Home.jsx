import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import api from '../utils/api';
import Loader from '../components/Loader';
import Message from '../components/Message';
import PostForm from '../components/Posts/PostForm';
import PostList from '../components/Posts/PostList';
import { useNavigate, Link } from "react-router-dom";
import profile from './profile';

function Home() {
  const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");
    const handleClose = () => setMessage("");
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef(null);
    const [chats,setChats] = useState([])


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

const fetchChats = async ()=>{
  try{
    setLoading(true);
    const {data} = await api.get('/api/chat');
    setChats(data);
  
  }
  catch (error) {
    setError(error.response && error.response.data.message ? error.response.data.message : error.message);
  } finally {
    setLoading(false);
  }
}



    const fetchPosts = async()=>{
      try{
        setLoading(true)
        const {data} = await api.get(`/api/posts?page=${page}&limit=6`);
        if(page === 1){
          setPosts(data.items);
        } else {
          setPosts((prev)=> [...prev, ...data.items]);
        }
        setHasMore(data.hasMore);
        setLoading(false)
      }
      catch (error) {
        setLoading(false);
        setError(error.response && error.response.data.message ? error.response.data.message : error.message);
      }
    }

    useEffect(()=>{
    

        const userInfo = localStorage.getItem("userInfo");
        
        if (!userInfo) {
          navigate("/login");
          return;
        }
      fetchPosts();
      fetchChats();
      
    },[page])

    useEffect(()=>{
      if(!hasMore) return;
      const target = observerRef.current;
      if(!target) return;
      const io = new IntersectionObserver((entries)=>{
        if(entries[0].isIntersecting){
          setPage((p)=> p + 1);
        }
      }, { rootMargin: '200px' });
      io.observe(target);
      return ()=> io.disconnect();
    },[hasMore, observerRef.current])

    const resetFeed = ()=>{
      setPage(1);
      setHasMore(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    


  return (
<Container>

    <Row>
        <Col md={3}>
        </Col>
        <Col md={6}>
        <h3 className="text-center bg-light text-dark mt-2">Upload Posts</h3>
        <PostForm   fetchPosts={  fetchPosts } resetFeed={resetFeed} />
        <hr />


        <PostList posts={posts} fetchPosts={fetchPosts} startChartHandler={startChartHandler}/>
        {hasMore && (
          <div ref={observerRef} style={{ height: 1 }}></div>
        )}
        </Col>




        <Col md={3}>
        </Col>
    </Row>
</Container>
  )
}

export default Home