// Quick test to verify the current build
console.log('Testing current MCP server build...');

try {
  // Try to import the server
  const serverPath = './dist/server.js';
  console.log('Attempting to load server from:', serverPath);
  
  // This is a basic syntax/import test
  import('./dist/server.js')
    .then(module => {
      console.log('✅ Server module loaded successfully');
      console.log('Exported:', Object.keys(module));
      
      if (module.SecretNetworkMCPServer) {
        console.log('✅ SecretNetworkMCPServer class found');
        console.log('🎉 Build verification PASSED');
      } else {
        console.log('❌ SecretNetworkMCPServer class not found');
      }
    })
    .catch(error => {
      console.log('❌ Failed to load server:', error.message);
      console.log('This might be due to missing dependencies or build issues');
    });
    
} catch (error) {
  console.log('❌ Error during test:', error.message);
}
