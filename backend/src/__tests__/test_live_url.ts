import axios from 'axios';

async function testLiveUrl() {
  try {
    console.log('Testing GET https://lifeos-system.onrender.com/ ...');
    const resRoot = await axios.get('https://lifeos-system.onrender.com/', { timeout: 15000 });
    console.log('Root Status:', resRoot.status);
    console.log('Root Content Type:', resRoot.headers['content-type']);
    console.log('Root First 200 Chars:\n', resRoot.data.slice(0, 200));

    console.log('\nTesting GET https://lifeos-system.onrender.com/api/health ...');
    const resHealth = await axios.get('https://lifeos-system.onrender.com/api/health', { timeout: 15000 });
    console.log('Health Status:', resHealth.status);
    console.log('Health Data:', resHealth.data);
  } catch (err: any) {
    console.error('Error fetching live URL:', err.response?.status, err.response?.data || err.message);
  }
}

testLiveUrl();
