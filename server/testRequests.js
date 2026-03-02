
async function run() {
  try {
    const res = await fetch('http://localhost:5600/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        age: 25,
        phoneNo: '1234567890',
      }),
    });
    const data = await res.json();
    console.log('register response', data);
  } catch (err) {
    console.error('error during register', err);
  }
  // attempt login
  try {
      const loginRes = await fetch('http://localhost:5600/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'testuser@example.com', password: 'Password123' }),
      });
      const loginData = await loginRes.json();
      console.log('login response', loginData);

      if (loginData.success && loginData.token) {
        // create a hotel with token
        const hotelRes = await fetch('http://localhost:5600/api/hotels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${loginData.token}` },
          body: JSON.stringify({ name: 'Demo Hotel', location: 'Test City', amenities: ['wifi', 'pool'] }),
        });
        const hotelData = await hotelRes.json();
        console.log('create hotel response', hotelData);

        // list hotels
        const listRes = await fetch('http://localhost:5600/api/hotels');
        const listData = await listRes.json();
        console.log('hotels list', listData);
      }
    } catch (err) {
      console.error('error during login or hotel ops', err);
    }
}

run();