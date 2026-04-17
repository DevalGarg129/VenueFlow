const app = require('./app');
require('dotenv').config({ path: '../../.env' });
const matchService = require('./services/match.service');

// Mock simulation engine: occasionally fire events automatically
setInterval(async () => {
    const mockEvents = [
        { type: 'FOUR', detail: 'On-drive to fine leg', player: 'V. Kohli', time: '43.1' },
        { type: 'SIX', detail: 'Slog sweep over mid-wicket!', player: 'R. Jadeja', time: '43.4' },
        { type: 'WICKET', detail: 'Bowled middle stump!', player: 'R. Jadeja', time: '43.6' },
        { type: 'BOUNDARY', detail: 'Flick off pads', player: 'H. Pandya', time: '44.2' },
        { type: 'DEFAULT', detail: 'Dot ball', player: 'V. Kohli', time: '44.3' }
    ];
    const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
    
    try {
        await matchService.processEvent(randomEvent.type, randomEvent.player, randomEvent.detail, randomEvent.time);
        console.log(`[Match Service] Auto-emitted: ${randomEvent.type}`);
    } catch(err) {}
}, 5000); // Emits a mock event every 5 seconds

const PORT = process.env.MATCH_SERVICE_PORT || process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`[Match Service] listening on port ${PORT}`);
});
