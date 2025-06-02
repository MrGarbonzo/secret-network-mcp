#!/usr/bin/env node

// Simple test to verify Secret Network endpoints are accessible
import https from 'https';

console.log('🔍 Testing Secret Network endpoint connectivity...\n');

const endpoint = 'lcd.mainnet.secretsaturn.net';
const path = '/cosmos/base/tendermint/v1beta1/blocks/latest';

function testConnection() {
  return new Promise((resolve) => {
    console.log(`🔗 Testing: https://${endpoint}${path}`);
    
    const options = {
      hostname: endpoint,
      port: 443,
      path: path,
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Secret-Network-MCP-Test/1.0',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📡 Response status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const blockHeight = parseInt(parsed.block?.header?.height || '0');
          const chainId = parsed.block?.header?.chain_id;
          
          console.log(`✅ SUCCESS: Connected to Secret Network!`);
          console.log(`   Chain ID: ${chainId}`);
          console.log(`   Block height: ${blockHeight.toLocaleString()}`);
          
          if (blockHeight > 10000000) {
            console.log(`   🎉 EXCELLENT: Real mainnet data confirmed!`);
            resolve(true);
          } else {
            console.log(`   ⚠️  Block height lower than expected for mainnet`);
            resolve(false);
          }
        } catch (error) {
          console.log(`❌ JSON parse error: ${error.message}`);
          console.log(`   Raw response (first 200 chars): ${data.substring(0, 200)}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Connection error: ${error.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`❌ Connection timeout (10s)`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

testConnection().then((success) => {
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('🎉 ENDPOINT TEST PASSED');
    console.log('   → Secret Network mainnet is accessible');
    console.log('   → MCP server should be able to connect');
    console.log('   → Restart Claude Desktop and test MCP tools');
  } else {
    console.log('❌ ENDPOINT TEST FAILED');
    console.log('   → Network connectivity issues detected');
    console.log('   → Check firewall/DNS settings');
    console.log('   → MCP server may have connection problems');
  }
  console.log('='.repeat(50));
}).catch(console.error);
