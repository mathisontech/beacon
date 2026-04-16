import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontSize: '32px',
      color: '#fff',
      background: '#1a1a1a',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div>🌪️ Tornado Evacuation Simulator</div>
      <div style={{fontSize: '18px'}}>Simple Test Version</div>
      <button
        onClick={() => setCount(count + 1)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Count: {count}
      </button>
      <div style={{fontSize: '14px', color: '#aaa'}}>
        If you see this and the button works, React is working!
      </div>
    </div>
  );
}

export default App;
