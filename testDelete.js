async function run() {
  try {
    // Login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testclear@ethara.com', password: 'test123456' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Logged in, token:', token);

    // Create project
    const createRes = await fetch('http://localhost:5000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'Test Delete Project', description: 'Will be deleted' })
    });
    const createData = await createRes.json();
    const projectId = createData._id;
    console.log('Created project:', projectId);

    // Delete project
    const deleteRes = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const deleteData = await deleteRes.json();
    console.log('Delete response:', deleteData);
    
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
