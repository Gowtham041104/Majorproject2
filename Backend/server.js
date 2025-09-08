const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Load environment variables first
dotenv.config();

// DB connection
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Trust proxy for deployment platforms like Render
app.set('trust proxy', 1);

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Allowed origins for CORS
const allowedOrigins = [
  'https://majorproject2-alpha.vercel.app',
  'http://localhost:3000',
  'https://localhost:3000',
];

// Helper to validate dynamic origins (e.g., Vercel preview URLs)
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Non-browser or same-origin

  if (allowedOrigins.includes(origin)) return true;

  // Allow any Vercel deployment for this project
  const vercelPreviewPattern = /^https:\/\/.+\.vercel\.app$/i;
  if (vercelPreviewPattern.test(origin)) return true;

  return false;
};

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    console.log('Blocked by CORS:', origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
}));

// Handle preflight requests (Express 5: '*' no longer valid)
app.options('(.*)', cors());

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'API is running successfully',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static uploads
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.jpg' || ext === '.jpeg') {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (ext === '.png') {
        res.setHeader('Content-Type', 'image/png');
      } else if (ext === '.gif') {
        res.setHeader('Content-Type', 'image/gif');
      }
    },
  })
);

// Load routes one by one with error handling to identify the problematic one
console.log('Loading routes...');

try {
  console.log('Loading authRoutes...');
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ authRoutes loaded successfully');
} catch (error) {
  console.error('❌ Error loading authRoutes:', error.message);
  process.exit(1);
}

try {
  console.log('Loading userRoutes...');
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/users', userRoutes);
  console.log('✅ userRoutes loaded successfully');
} catch (error) {
  console.error('❌ Error loading userRoutes:', error.message);
  process.exit(1);
}

try {
  console.log('Loading postRoutes...');
  const postRoutes = require('./routes/postRoutes');
  app.use('/api/posts', postRoutes);
  console.log('✅ postRoutes loaded successfully');
} catch (error) {
  console.error('❌ Error loading postRoutes:', error.message);
  process.exit(1);
}

try {
  console.log('Loading chatRoutes...');
  const chatRoutes = require('./routes/chatRoutes');
  app.use('/api/chat', chatRoutes);
  console.log('✅ chatRoutes loaded successfully');
} catch (error) {
  console.error('❌ Error loading chatRoutes:', error.message);
  process.exit(1);
}

console.log('All routes loaded successfully!');

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS Error', 
      message: 'Origin not allowed' 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
});

// 404 handler (Express 5: avoid '*' catch-all path)
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Create HTTP server
const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('joinChat', (chatId) => {
    if (!chatId) {
      console.log('Invalid chatId provided');
      return;
    }
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  socket.on('sendMessage', (message) => {
    if (!message || !message.chatId || !message.content) {
      console.log('Invalid message format');
      return;
    }
    
    console.log(`Message received from ${socket.id}: ${message.content}`);
    io.to(message.chatId).emit('receiveMessage', message);
    console.log(`Message sent to chat ${message.chatId}`);
  });

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});