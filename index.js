/**
 * Smart ePrint Solution - Backend Server
 * Main entry point for the API and Socket services.
 */

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

// Internal Modules
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load Environment Variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

/**
 * Socket.io Configuration
 * Configures real-time communication for support chat and live updates.
 */
const io = new Server(server, {
    cors: {
        origin: [
            "https://smarteprintfrontend.vercel.app",
            "https://smarteprint.com",
            "https://smarteprint.com/",
            "http://localhost:5173",
            "http://localhost:5173/",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5173/"
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

/**
 * Middleware Configuration
 */
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "https://smarteprintfrontend.vercel.app", "https://smarteprint.com"],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

/**
 * API Routes
 */
app.get('/', (req, res) => {
    res.json({ status: 'success', message: 'Smart ePrint API is running smoothly.' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/admin', require('./routes/setupRoutes'));

/**
 * Socket.io Middleware & Event Handlers
 */
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (error) {
            next(new Error('Authentication failed: Invalid token'));
        }
    } else {
        next(new Error('Authentication failed: No token provided'));
    }
});

io.on('connection', (socket) => {
    socket.join(`user-${socket.userId}`);

    socket.on('join-chat', (chatId) => {
        socket.join(`chat-${chatId}`);
    });

    socket.on('send-message', (data) => {
        const { chatId, message, sender } = data;
        io.to(`chat-${chatId}`).emit('new-message', {
            chatId,
            message,
            sender,
            timestamp: new Date()
        });
    });

    socket.on('typing', (data) => {
        const { chatId, isTyping, userName } = data;
        socket.to(`chat-${chatId}`).emit('user-typing', {
            chatId,
            isTyping,
            userName
        });
    });

    socket.on('disconnect', () => {
        // User disconnected
    });
});

/**
 * Error Handling Middleware
 */
app.use(notFound);
app.use(errorHandler);

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`\n🚀 Server is live at http://127.0.0.1:${PORT}`);
    console.log(`📂 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = { io };
