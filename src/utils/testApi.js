// Test script to check backend connection
export const testBackendConnection = async () => {
  console.log('Testing backend connection...');
  
  try {
    // Test 1: Check if backend is reachable
    const baseResponse = await fetch('http://localhost:3000');
    console.log('Base URL test:', baseResponse.status, baseResponse.statusText);
    
    // Test 2: Check genres endpoint without auth
    const genresResponse = await fetch('http://localhost:3000/genres');
    console.log('Genres endpoint test (no auth):', genresResponse.status, genresResponse.statusText);
    
    // Test 3: Check with auth token
    const token = localStorage.getItem('token');
    console.log('Current token:', token ? 'Present' : 'Missing');
    
    if (token) {
      const authResponse = await fetch('http://localhost:3000/genres', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Genres endpoint test (with auth):', authResponse.status, authResponse.statusText);
      
      if (authResponse.ok) {
        const data = await authResponse.json();
        console.log('Genres data:', data);
      }
    }
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
};

// Also test the direct fetch
export const testDirectFetch = async () => {
  console.log('Testing direct fetch to /genres...');
  
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('http://localhost:3000/genres', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Direct fetch response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Direct fetch data:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Direct fetch error:', error);
  }
};