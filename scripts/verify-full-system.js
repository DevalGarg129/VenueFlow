require('dotenv').config();
const { healthCheck, ensureTopics, disconnectAll } = require('../shared/utils/kafka.util');

async function verifyFullSystem() {
  console.log('--- ArenaPulse Kafka Full System Verification ---');

  const topics = [
    'match_events', 
    'crowd_updates', 
    'queue_updates', 
    'user_events', 
    'alerts'
  ];

  try {
    // 1. Health Check
    console.log('[Verify] Checking Kafka Connectivity...');
    const status = await healthCheck();
    if (status.status === 'healthy') {
      console.log('✅ Kafka is reachable and healthy.');
    } else {
      console.error('❌ Kafka Health Check Failed:', status.error);
      process.exit(1);
    }

    // 2. Topic Creation
    console.log(`[Verify] Ensuring all topics exist: ${topics.join(', ')}...`);
    await ensureTopics(topics);
    console.log('✅ All topics are verified/created.');

    // 3. Graceful Shutdown Test
    console.log('[Verify] Testing graceful shutdown logic...');
    await disconnectAll();
    console.log('✅ Shutdown logic verified.');

    console.log('\n🚀 ALL KAFKA SYSTEM COMPONENTS VERIFIED SUCCESSFULLY');
    process.exit(0);

  } catch (err) {
    console.error('❌ Verification Error:', err.message);
    process.exit(1);
  }
}

verifyFullSystem();
