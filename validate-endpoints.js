// Quick validation of Secret Network endpoints
import https from 'https';
import { URL } from 'url';

const endpoints = [
  'https://lcd.mainnet.secretsaturn.net/cosmos/base/tendermint/v1beta1/blocks/latest',
  'https://secretnetwork-api.lavenderfive.com:443/cosmos/base/tendermint/v1beta1/blocks/latest'
];

async function testEndpoint(url) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const blockHeight = parsed.block?.header?.height || 'unknown';
          resolve({ success: true, url, blockHeight, status: res.statusCode });
        } catch (error) {
          resolve({ success: false, url, error: 'Invalid JSON response', status: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, url, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, url, error: 'Request timeout' });
    });

    req.end();
  });
}

async function validateEndpoints() {
  console.log('🔍 Testing Secret Network endpoints...\n');
  
  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint}`);
    const result = await testEndpoint(endpoint);
    
    if (result.success) {
      console.log(`✅ SUCCESS - Block height: ${result.blockHeight}`);
      if (parseInt(result.blockHeight) > 10000000) {
        console.log(`🎉 EXCELLENT - Real mainnet data (height > 10M)`);
      }
    } else {
      console.log(`❌ FAILED - ${result.error}`);
    }
    console.log('');
  }
}

validateEndpoints().catch(console.error);
