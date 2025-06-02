#!/usr/bin/env node

// Test multiple Secret Network endpoints to find working ones
import https from 'https';

console.log('🔍 Testing multiple Secret Network endpoints...\n');

const endpoints = [
  {
    name: 'LavenderFive API',
    url: 'secretnetwork-api.lavenderfive.com:443',
    path: '/cosmos/base/tendermint/v1beta1/blocks/latest'
  },
  {
    name: 'Saturn LCD',
    url: 'lcd.mainnet.secretsaturn.net',
    path: '/cosmos/base/tendermint/v1beta1/blocks/latest'
  },
  {
    name: 'Alternative API',
    url: 'secretnetwork-api.lavenderfive.com',
    path: '/cosmos/base/tendermint/v1beta1/blocks/latest',
    port: 443
  },
  {
    name: 'Direct Saturn',
    url: 'rpc.mainnet.secretsaturn.net',
    path: '/status',
    isRPC: true
  }
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    console.log(`🔗 Testing ${endpoint.name}: ${endpoint.url}${endpoint.path}`);
    
    const options = {
      hostname: endpoint.url.split(':')[0],
      port: endpoint.port || (endpoint.url.includes(':') ? endpoint.url.split(':')[1] : 443),
      path: endpoint.path,
      method: 'GET',
      timeout: 15000,
      headers: {
        'User-Agent': 'Secret-Network-MCP-Test/1.0',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`   📡 Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          let blockHeight, chainId;
          if (endpoint.isRPC) {
            // RPC format
            blockHeight = parseInt(parsed.result?.sync_info?.latest_block_height || '0');
            chainId = parsed.result?.node_info?.network;
          } else {
            // LCD format
            blockHeight = parseInt(parsed.block?.header?.height || '0');
            chainId = parsed.block?.header?.chain_id;
          }
          
          console.log(`   ✅ SUCCESS!`);
          console.log(`      Chain: ${chainId}`);
          console.log(`      Block: ${blockHeight.toLocaleString()}`);
          
          if (blockHeight > 10000000) {
            console.log(`      🎉 EXCELLENT: Real mainnet data!`);
            resolve({ success: true, endpoint, blockHeight, chainId });
          } else {
            console.log(`      ⚠️  Block height unexpectedly low`);
            resolve({ success: false, endpoint, error: 'Low block height' });
          }
        } catch (error) {
          console.log(`   ❌ JSON parse error: ${error.message}`);
          resolve({ success: false, endpoint, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Connection error: ${error.message}`);
      resolve({ success: false, endpoint, error: error.message });
    });

    req.on('timeout', () => {
      console.log(`   ❌ Timeout (15s)`);
      req.destroy();
      resolve({ success: false, endpoint, error: 'Timeout' });
    });

    req.end();
  });
}

async function testAllEndpoints() {
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    console.log('');
  }
  
  console.log('='.repeat(60));
  console.log('📊 SUMMARY:');
  console.log('='.repeat(60));
  
  const working = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (working.length > 0) {
    console.log(`✅ WORKING ENDPOINTS (${working.length}):`);
    working.forEach(r => {
      console.log(`   → ${r.endpoint.name}: ${r.endpoint.url}`);
      console.log(`     Block: ${r.blockHeight?.toLocaleString()}, Chain: ${r.chainId}`);
    });
    
    console.log('\n🚀 RECOMMENDED ACTION:');
    console.log('   1. Use these working endpoints in your MCP server');
    console.log('   2. Restart Claude Desktop');
    console.log('   3. Test get_network_status() - should work now!');
    
  } else {
    console.log('❌ NO WORKING ENDPOINTS FOUND');
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('   1. Check firewall settings');
    console.log('   2. Try changing DNS to 8.8.8.8 or 1.1.1.1');
    console.log('   3. Check if corporate network blocks these ports');
    console.log('   4. Verify general internet connectivity');
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ FAILED ENDPOINTS (${failed.length}):`);
    failed.forEach(r => {
      console.log(`   → ${r.endpoint.name}: ${r.error}`);
    });
  }
  
  console.log('='.repeat(60));
}

testAllEndpoints().catch(console.error);
