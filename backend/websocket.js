const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();
    
    this.wss.on('connection', (ws, req) => {
      const token = new URLSearchParams(req.url.split('?')[1]).get('token');
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        this.clients.set(userId, ws);
        console.log(`WebSocket connected: User ${userId}`);
        
        ws.on('close', () => {
          this.clients.delete(userId);
          console.log(`WebSocket disconnected: User ${userId}`);
        });
        
        ws.on('message', (message) => {
          this.handleMessage(userId, message);
        });
        
        this.sendToUser(userId, 'connected', { message: 'WebSocket connected' });
        
      } catch (error) {
        console.error('Invalid WebSocket token:', error);
        ws.close();
      }
    });
  }
  
  handleMessage(userId, message) {
    try {
      const data = JSON.parse(message);
      console.log(`Message from ${userId}:`, data);
      
      switch (data.type) {
        case 'ping':
          this.sendToUser(userId, 'pong', { timestamp: Date.now() });
          break;

      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }
  
  sendToUser(userId, type, payload) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    }
  }
  
  broadcast(type, payload, excludeUserId = null) {
    this.clients.forEach((ws, userId) => {
      if (userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, payload }));
      }
    });
  }
  
  notifyNewIdea(userId, idea) {
    this.sendToUser(userId, 'new_idea', { idea });
  }
  
  notifyFaculty(facultyId, studentName, idea) {
    this.sendToUser(facultyId, 'student_idea_saved', {
      studentName,
      idea,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = WebSocketServer;