const os = require('os');

// Function to get the local IP address
const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '0.0.0.0';
};

const localIp = getLocalIpAddress();
console.log('\n===== Access WhatsManage from other devices =====');
console.log(`Frontend URL: http://${localIp}:3000`);
console.log(`Backend URL: http://${localIp}:8000`);
console.log('================================================\n'); 