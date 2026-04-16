import { useState, useEffect } from 'react';
import MapView from './components/MapView';
import ControlPanel from './components/ControlPanel';
import StatsPanel from './components/StatsPanel';
import { generateScenario } from './utils/syntheticData';
import { projectTornadoPath } from './utils/tornadoProjection';
import { processAllDecisions } from './utils/evacuationDecision';
import './App.css';

function App() {
  const [scenario, setScenario] = useState(null);
  const [tornadoPath, setTornadoPath] = useState([]);
  const [peopleWithDecisions, setPeopleWithDecisions] = useState([]);
  const [currentTime, setCurrentTime] = useState(0); // minutes since warning
  const [playing, setPlaying] = useState(false);
  const [layers, setLayers] = useState({
    tornadoPath: true,
    dangerZones: true,
    buildings: true,
    people: true,
    shelters: true,
    timestamps: true
  });

  // Initialize scenario
  useEffect(() => {
    try {
      const initialScenario = generateScenario({
        townName: 'Moore, OK',
        center: [-97.4395, 35.3395],
        radiusMiles: 5,
        efRating: 3,
        direction: 60, // WSW to ENE
        speed: 30,
        numDrivers: 20
      });

      setScenario(initialScenario);

      // Calculate tornado path
      const path = projectTornadoPath(initialScenario.tornado, 30, 5);
      setTornadoPath(path);

      // Process evacuation decisions
      const decisions = processAllDecisions(
        initialScenario.people,
        initialScenario.tornado,
        initialScenario.buildings.shelters
      );
      setPeopleWithDecisions(decisions);
    } catch (error) {
      console.error('Error initializing scenario:', error);
    }
  }, []);

  // Timeline playback
  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= 30) {
          setPlaying(false);
          return 30;
        }
        return prev + 1;
      });
    }, 1000); // 1 second = 1 minute of simulation

    return () => clearInterval(interval);
  }, [playing]);

  const toggleLayer = (layerName) => {
    setLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  const handleScenarioChange = (config) => {
    const newScenario = generateScenario(config);
    setScenario(newScenario);

    const path = projectTornadoPath(newScenario.tornado, 30, 5);
    setTornadoPath(path);

    const decisions = processAllDecisions(
      newScenario.people,
      newScenario.tornado,
      newScenario.buildings.shelters
    );
    setPeopleWithDecisions(decisions);

    setCurrentTime(0);
    setPlaying(false);
  };

  if (!scenario) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '24px',
        color: '#fff',
        background: '#1a1a1a'
      }}>
        Loading scenario...
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌪️ Tornado Evacuation Simulator</h1>
        <div className="scenario-info">
          <strong>{scenario.name}</strong> • EF{scenario.tornado.efRating} Tornado • {scenario.tornado.speed} mph
        </div>
      </header>

      <div className="main-content">
        <ControlPanel
          scenario={scenario}
          layers={layers}
          onToggleLayer={toggleLayer}
          onScenarioChange={handleScenarioChange}
          currentTime={currentTime}
          playing={playing}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeChange={setCurrentTime}
        />

        <div className="map-container">
          <MapView
            scenario={scenario}
            tornadoPath={tornadoPath}
            peopleWithDecisions={peopleWithDecisions}
            currentTime={currentTime}
            layers={layers}
          />
        </div>

        <StatsPanel
          peopleWithDecisions={peopleWithDecisions}
          scenario={scenario}
          currentTime={currentTime}
        />
      </div>
    </div>
  );
}

export default App;
