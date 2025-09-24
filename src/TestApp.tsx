import React from 'react';

function TestApp(): React.JSX.Element {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'blue', fontSize: '32px' }}>Test App is Working!</h1>
      <p style={{ color: 'black' }}>If you can see this, React is rendering correctly.</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', border: '2px solid blue' }}>
        <h2>Debugging Info:</h2>
        <p>React Version: {React.version}</p>
        <p>Current Time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default TestApp;