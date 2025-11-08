// Quick test script to verify admin login

async function testAdminLogin() {
  try {
    console.log('Testing admin login...\n');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'yanal@univibe.edu',
        password: 'yanal1234'
      })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.user) {
      console.log('\n✅ Login successful!');
      console.log('User:', data.user.firstName, data.user.lastName);
      console.log('Email:', data.user.email);
      console.log('Role:', data.user.role);
      console.log('Token:', data.token ? 'Present' : 'Missing');
    } else {
      console.log('\n❌ Login failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminLogin();
