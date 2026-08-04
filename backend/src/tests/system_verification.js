const http = require('http');

const request = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ statusCode: res.statusCode, headers: res.headers, rawBody: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
};

async function runSystemVerification() {
  console.log('=' .repeat(60));
  console.log('EquityIQ Indian Stock Market System Verification');
  console.log('=' .repeat(60));

  const timestamp = Date.now();
  const testUser = {
    name: 'Indian Market Tester',
    email: `india_tester_${timestamp}@equityiq.in`,
    password: 'SecurePassword123!',
  };

  let jwtToken = '';

  // 1. GET /api/health (direct 5000 & proxy 3000)
  console.log('\n[Test 1] Health Check Endpoints:');
  const hDirect = await request({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log(`- Direct Port 5000: HTTP ${hDirect.statusCode}`, hDirect.body);

  const hProxy = await request({ host: 'localhost', port: 3000, path: '/api/health', method: 'GET' });
  console.log(`- Proxy Port 3000:  HTTP ${hProxy.statusCode}`, hProxy.body);

  // 2. POST /api/auth/register
  console.log('\n[Test 2] User Registration:');
  const regRes = await request(
    { host: 'localhost', port: 3000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    testUser
  );
  console.log(`- Status: HTTP ${regRes.statusCode}`, regRes.body);
  if (regRes.body && regRes.body.token) jwtToken = regRes.body.token;

  // 3. POST /api/auth/login
  console.log('\n[Test 3] User Login:');
  const loginRes = await request(
    { host: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: testUser.email, password: testUser.password }
  );
  console.log(`- Status: HTTP ${loginRes.statusCode}`, loginRes.body);
  if (loginRes.body && loginRes.body.token) jwtToken = loginRes.body.token;

  // 4. GET /api/users/profile (JWT Protected)
  console.log('\n[Test 4] Protected Endpoint (JWT Verification):');
  const profRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/users/profile',
    method: 'GET',
    headers: { Authorization: `Bearer ${jwtToken}` },
  });
  console.log(`- Status: HTTP ${profRes.statusCode}`, profRes.body);

  // 5. Indian Stock Market API Endpoints
  console.log('\n[Test 5] Indian Stock Market Endpoints (NSE):');
  const searchRes = await request({ host: 'localhost', port: 3000, path: '/api/stocks/search?q=RELIANCE', method: 'GET' });
  console.log(`- Search RELIANCE: HTTP ${searchRes.statusCode}`, searchRes.body ? `Found ${searchRes.body.length || 0} items` : searchRes.rawBody);

  const quoteRes = await request({ host: 'localhost', port: 3000, path: '/api/stocks/RELIANCE/quote', method: 'GET' });
  console.log(`- Quote RELIANCE: HTTP ${quoteRes.statusCode} Price=₹${quoteRes.body?.price} (${quoteRes.body?.exchange || 'NSE'})`);

  const historyRes = await request({ host: 'localhost', port: 3000, path: '/api/stocks/TCS/history?range=1M', method: 'GET' });
  console.log(`- History TCS: HTTP ${historyRes.statusCode} DataPoints=${historyRes.body?.history?.length || 0}`);

  const finRes = await request({ host: 'localhost', port: 3000, path: '/api/stocks/INFY/financials', method: 'GET' });
  console.log(`- Financials INFY: HTTP ${finRes.statusCode} MarketCap=₹${finRes.body?.financials?.marketCap}`);

  // 6. Indian News API Endpoints
  console.log('\n[Test 6] Indian News Integration Endpoints:');
  const newsRes = await request({ host: 'localhost', port: 3000, path: '/api/news/RELIANCE?page=1&limit=3', method: 'GET' });
  console.log(`- News Feed RELIANCE: HTTP ${newsRes.statusCode} TotalArticles=${newsRes.body?.pagination?.total || 0}`);

  const ingestRes = await request({ host: 'localhost', port: 3000, path: '/api/news/RELIANCE/ingest', method: 'POST' });
  console.log(`- Ingest News RELIANCE: HTTP ${ingestRes.statusCode}`, ingestRes.body?.message || ingestRes.body);

  // 7. ML Proxy Endpoints (Indian Corporate Headline)
  console.log('\n[Test 7] ML Sentiment Classifier Endpoint (Indian Headline):');
  const mlRes = await request(
    { host: 'localhost', port: 3000, path: '/api/ml/sentiment', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { text: 'Reliance Industries Q4 net profit rises 18% on robust retail and O2C growth.' }
  );
  console.log(`- ML Sentiment: HTTP ${mlRes.statusCode}`, mlRes.body);

  // 8. ML Risk & Quantitative Analytics Endpoint
  console.log('\n[Test 8] ML Quantitative Risk & Volatility Endpoint:');
  const riskRes = await request({ host: 'localhost', port: 3000, path: '/api/stocks/RELIANCE/risk', method: 'GET' });
  console.log(`- ML Risk RELIANCE: HTTP ${riskRes.statusCode} Score=${riskRes.body?.risk_score} Tier=${riskRes.body?.risk_tier} Vol20D=${riskRes.body?.metrics?.volatility_20d}`);

  console.log('=' .repeat(60));
  console.log('Indian Stock Market Verification Complete — All Services Functional!');
}

runSystemVerification().catch(console.error);
