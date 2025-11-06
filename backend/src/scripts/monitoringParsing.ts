const API_URL = 'http://localhost:3000';

async function getStatus() {
  try {
    const response = await fetch(`${API_URL}/api/parse-status`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching status:', error);
    return null;
  }
}

async function monitor() {
  console.clear();
  console.log('📊 PDF Parsing Progress Monitor');
  console.log('================================\n');

  const status = await getStatus();
  
  if (!status) {
    console.log('❌ Cannot connect to server');
    return;
  }

  const { total, parsed, unparsed, percentage } = status;
  
  // Progress bar
  const barLength = 40;
  const filledLength = Math.round((barLength * parsed) / total);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  
  console.log(`Total Papers:     ${total}`);
  console.log(`✅ Parsed:         ${parsed}`);
  console.log(`⏳ Remaining:      ${unparsed}`);
  console.log(`\nProgress: [${bar}] ${percentage}%\n`);
  
  // ETA calculation
  if (parsed > 0) {
    const timePerPaper = 2; // 2 seconds per paper (rate limit)
    const estimatedTotalTime = (total * timePerPaper) / 60; // minutes
    const timeElapsed = (parsed * timePerPaper) / 60; // minutes
    const timeRemaining = (unparsed * timePerPaper) / 60; // minutes
    
    console.log(`⏱️  Time Metrics:`);
    console.log(`   Per paper: ${timePerPaper}s`);
    console.log(`   Elapsed: ${Math.round(timeElapsed)}m`);
    console.log(`   Remaining: ${Math.round(timeRemaining)}m`);
    console.log(`   Total estimate: ${Math.round(estimatedTotalTime)}m`);
  }
  
  console.log(`\n⏰ Last update: ${new Date().toLocaleTimeString()}`);
  console.log('Refreshing in 10 seconds...\n');
}

// Monitor every 10 seconds
setInterval(monitor, 10000);
monitor(); // Initial call
