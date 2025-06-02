#!/usr/bin/env node

// Test Secret Network endpoints before running the MCP server
import https from 'https';
import { URL } from 'url';

console.log('🔍 Testing Secret Network RPC endpoints...\n');

const endpoints = [
  'https://secretnetwork-api.lavenderfive.com:443/cosmos/base/tendermint/v1beta1/blocks/latest',
  'https://rpc.ankr.com/http/scrt_cosmos/cosmos/base/tendermint/v1beta1/blocks/latest',
  'https://rest-secret.01node.com/cosmos/base/tendermint/v1beta1/blocks/latest',
  'https://public.stakewolle.com/cosmos/secretnetwork/rest/cosmos/base/tendermint/v1beta1/blocks/latest',
  'https://lcd.mainnet.secretsaturn.net/cosmos/base/tendermint/v1beta1/blocks/latest'
];

async function testEndpoint(url) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout: 15000,
      headers: {
        'User-Agent': 'Secret-Network-MCP-Test/1.0',
        'Accept': 'application/json'
      }
    };

    console.log(`🔗 Testing: ${parsedUrl.hostname}${parsedUrl.pathname}`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const blockHeight = parsed.block?.header?.height || 'unknown';
          const chainId = parsed.block?.header?.chain_id || 'unknown';
          const timestamp = parsed.block?.header?.time || 'unknown';
          
          resolve({ 
            success: true, 
            url, 
            blockHeight: parseInt(blockHeight) || 0, 
            chainId,
            timestamp,
            status: res.statusCode 
          });
        } catch (error) {
          resolve({ 
            success: false, 
            url, 
            error: `Invalid JSON response: ${error.message}`, 
            status: res.statusCode,
            rawData: data.substring(0, 200) + '...' 
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, url, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, url, error: 'Request timeout (15s)' });
    });

    req.end();
  });
}

async function validateEndpoints() {
  let workingEndpoint = null;
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    
    if (result.success) {
      console.log(`✅ SUCCESS`);
      console.log(`   Chain ID: ${result.chainId}`);
      console.log(`   Block height: ${result.blockHeight.toLocaleString()}`);
      console.log(`   Timestamp: ${result.timestamp}`);
      
      if (result.blockHeight > 10000000) {
        console.log(`   🎉 EXCELLENT - Real mainnet data (height > 10M)`);
        workingEndpoint = endpoint;
      } else if (result.blockHeight > 0) {
        console.log(`   ⚠️  Block height seems low for mainnet`);
      }
    } else {
      console.log(`❌ FAILED - ${result.error}`);
      if (result.rawData) {
        console.log(`   Raw response: ${result.rawData}`);
      }
    }
    console.log('');
  }
  
  return workingEndpoint;
}

validateEndpoints().then((workingEndpoint) => {
  if (workingEndpoint) {
    console.log('🎉 SUCCESS: Found working Secret Network endpoint!');
    console.log(`   Best endpoint: ${workingEndpoint}`);
    console.log('\n✅ RPC connectivity verified - MCP server should work');
  } else {
    console.log('❌ FAILED: No working Secret Network endpoints found');
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('   1. Check internet connection');
    console.log('   2. Try different DNS servers');
    console.log('   3. Check if firewall is blocking HTTPS connections');
    console.log('   4. Verify Secret Network mainnet is operational');
  }
}).catch(console.error);
