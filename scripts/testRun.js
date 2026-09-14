const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/compiler/run', {
      code: "print('hello')",
      language: 'python',
      customInput: ''
    }, { headers: { 'Content-Type': 'application/json' } });

    console.log('RESPONSE:\n', JSON.stringify(res.data, null, 2));
  } catch (e) {
    if (e.response) {
      console.error('ERR STATUS', e.response.status);
      console.error(JSON.stringify(e.response.data, null, 2));
    } else {
      console.error(e.message);
    }
  }
})();
