// server.js
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios'); // ✅ Needed for OSRM calls
const app = require('./app'); // Import app from app.js

// Plug in new routes
const mapsRoute = require('./routes/maps');
const ridesRoute = require('./routes/rides');
app.use('/maps', mapsRoute);
app.use('/rides', ridesRoute);

const server = http.createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // ✅ 1. Driver sends live location
  socket.on('send-location', (location) => {
    // Broadcast location to all clients (passenger apps)
    socket.broadcast.emit('driver-location', location);
  });

  // ✅ 2. Rider requests route (pickup -> destination)
  socket.on('get-route', async ({ pickup, destination }) => {
    try {
      const url = `http://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
      const response = await axios.get(url);

      // Send route back only to the requesting client
      socket.emit('route-data', response.data.routes[0]);
    } catch (err) {
      console.error("OSRM error:", err.message);
      socket.emit('route-error', { message: 'Failed to fetch route' });
    }
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
