const app = require('./app');
const matchService = require('./services/match.service');

// Mock simulation engine: occasionally fire events automatically
setInterval(async () => {
    const mockEvents = [
        { type: 'boundary', detail: 'Four runs!' },
        { type: 'wicket', detail: 'Clean bowled!' }
    ];
    const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
    
    try {
        await matchService.processEvent(randomEvent.type, 'Player XYZ', randomEvent.detail);
        console.log(`[Match Service] Auto-emitted: ${randomEvent.type}`);
    } catch(err) {}
}, 5000); // Emits a mock event every 5 seconds

const PORT = process.env.MATCH_SERVICE_PORT || 4004;
app.listen(PORT, () => {
  console.log(`[Match Service] listening on port ${PORT}`);
});
