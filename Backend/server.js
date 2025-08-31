const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// ✅ Database
connectDB();

// ✅ Allowed origins
const allowedOrigins = [
  'https://majorproject2-alpha.vercel.app', // frontend (Vercel)
  'http://localhost:3000',                  // local dev
];

// ✅ Apply CORS middleware (for REST API)
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // only if using cookies
}));

// ✅ Handle preflight
app.options('*', cors());

// ✅ Root route
app.get("/", (req, res) => {
  res.send('API is running');
});

// ✅ Serve uploads with caching
app.use(
  '/uploads',
  express.static(path.join(__dirname, '/uploads'), {
    maxAge: '7d',
    etag: true,
    lastModified: true,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    },
  })
);

// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);

// ✅ Create HTTP server + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ✅ Socket.IO events
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat ${chatId}`);
  });

  socket.on('sendMessage', (message) => {
    console.log(`Message received from client: ${message.content}`);
    io.to(message.chatId).emit('receiveMessage', message);
    console.log(`Message sent to chat ${message.chatId}: ${message.content}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running at PORT ${PORT}`));
