const { io } = require('socket.io-client');

const BACKEND_URL = 'https://ai-medical-voice-agent-ygc5.onrender.com';
const consultationId = 'consult_171b4401_' + Math.random().toString(36).substr(2, 9);
const userId = 'dev-user-123';

console.log('🔌 Connecting to WebSocket at:', BACKEND_URL);
const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
  auth: { token: null } // Bypasses auth in development mode on dev-user-123
});

let turn = 1;
const history = [];

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket! Socket ID:', socket.id);
  console.log('🤝 Joining consultation room:', consultationId);
  socket.emit('join-consultation', consultationId);
  
  // Start the first turn
  sendTurn();
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error.message);
  process.exit(1);
});

socket.on('error-event', (data) => {
  console.error('❌ Server error event:', data);
  process.exit(1);
});

let accumulatedResponse = '';

socket.on('ai-response-chunk', (data) => {
  if (data.isComplete) {
    console.log(`\n\n[Turn ${turn}] ✅ Streaming complete.`);
    console.log(`[Turn ${turn}] Full response length:`, data.fullResponse ? data.fullResponse.length : accumulatedResponse.length);
    
    // Add to history
    history.push({ role: 'assistant', content: data.fullResponse || accumulatedResponse });
    accumulatedResponse = '';
    
    turn++;
    if (turn <= 4) {
      // Send next turn after a short delay
      setTimeout(sendTurn, 2000);
    } else {
      console.log('🎉 Conversation simulation successfully completed 4 turns with zero issues!');
      socket.disconnect();
      process.exit(0);
    }
  } else if (data.chunk) {
    process.stdout.write(data.chunk);
    accumulatedResponse += data.chunk;
  }
});

socket.on('ai-response-error', (error) => {
  console.error('\n❌ Server AI response error:', error);
});

socket.on('emotion-detected', (data) => {
  console.log(`\n🎭 [Emotion Detected]`, data.emotion, `Confidence:`, data.confidence);
});

function sendTurn() {
  let message = '';
  if (turn === 1) {
    message = 'Hello Doctor, I have had a headache and a mild fever since yesterday.';
  } else if (turn === 2) {
    message = 'It is a throbbing pain on the sides of my head. I have also had a minor cough.';
  } else if (turn === 3) {
    message = 'What medicine or prescription can I take for relief, and how much time will it take to recover?';
  } else {
    message = 'Should I schedule an appointment if it does not improve by tomorrow?';
  }
  
  console.log(`\n\n-----------------------------`);
  console.log(`📤 Sending Turn ${turn}: "${message}"`);
  
  // Add user turn to history
  history.push({ role: 'user', content: message });
  
  socket.emit('get-ai-response-stream', {
    consultationId,
    transcript: message,
    specialistType: 'general',
    userId,
    conversationHistory: history.slice(0, -1) // slice to send history before this turn
  });
}
