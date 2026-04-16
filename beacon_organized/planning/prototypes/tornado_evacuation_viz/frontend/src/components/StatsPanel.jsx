import { getDecisionSummary } from '../utils/evacuationDecision';
import './StatsPanel.css';

function StatsPanel({ peopleWithDecisions, scenario, currentTime }) {
  const summary = getDecisionSummary(peopleWithDecisions);

  // Filter people by priority for display
  const urgentPeople = peopleWithDecisions
    .filter(p => p.decision.priority >= 4)
    .slice(0, 10);

  const evacuatingPeople = peopleWithDecisions
    .filter(p => p.decision.action === 'EVACUATE')
    .slice(0, 5);

  return (
    <div className="stats-panel">
      <div className="stats-section">
        <h3>Population Summary</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{summary.total}</div>
            <div className="stat-label">Total People</div>
          </div>
          <div className="stat-item">
            <div className="stat-value vulnerable">{summary.vulnerable}</div>
            <div className="stat-label">Vulnerable</div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h3>Recommendations</h3>
        <div className="recommendation-bars">
          <div className="rec-bar">
            <div className="rec-label">
              <span>Monitor</span>
              <span>{summary.monitor}</span>
            </div>
            <div className="rec-progress">
              <div
                className="rec-fill monitor"
                style={{ width: `${(summary.monitor / summary.total) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="rec-bar">
            <div className="rec-label">
              <span>Shelter in Place</span>
              <span>{summary.shelterInPlace}</span>
            </div>
            <div className="rec-progress">
              <div
                className="rec-fill shelter"
                style={{ width: `${(summary.shelterInPlace / summary.total) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="rec-bar">
            <div className="rec-label">
              <span>Evacuate</span>
              <span>{summary.evacuate}</span>
            </div>
            <div className="rec-progress">
              <div
                className="rec-fill evacuate"
                style={{ width: `${(summary.evacuate / summary.total) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="rec-bar">
            <div className="rec-label">
              <span>Evacuate Urgently</span>
              <span>{summary.evacuateUrgently}</span>
            </div>
            <div className="rec-progress">
              <div
                className="rec-fill urgent"
                style={{ width: `${(summary.evacuateUrgently / summary.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h3>Urgent Situations</h3>
        {urgentPeople.length === 0 ? (
          <p className="no-urgent">No immediate urgent situations</p>
        ) : (
          <div className="urgent-list">
            {urgentPeople.map(person => (
              <div key={person.id} className="urgent-item">
                <div className="urgent-header">
                  <span className="urgent-icon">{person.status === 'driving' ? '🚗' : '👤'}</span>
                  <span className="urgent-id">{person.id}</span>
                </div>
                <div className="urgent-action">{person.decision.action}</div>
                <div className="urgent-reason">{person.decision.reason}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {evacuatingPeople.length > 0 && (
        <div className="stats-section">
          <h3>Active Evacuations</h3>
          <div className="evacuation-list">
            {evacuatingPeople.map(person => (
              <div key={person.id} className="evac-item">
                <div className="evac-id">{person.id}</div>
                <div className="evac-details">
                  {person.decision.details.recommendedShelter && (
                    <>
                      <div className="evac-destination">
                        → {person.decision.details.recommendedShelter.name}
                      </div>
                      <div className="evac-time">
                        {person.decision.details.driveTime.toFixed(0)} min drive
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-section tornado-info">
        <h3>Tornado Info</h3>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Rating</div>
            <div className="info-value">EF{scenario.tornado.efRating}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Speed</div>
            <div className="info-value">{scenario.tornado.speed} mph</div>
          </div>
          <div className="info-item">
            <div className="info-label">Direction</div>
            <div className="info-value">{scenario.tornado.direction}°</div>
          </div>
          <div className="info-item">
            <div className="info-label">Time Elapsed</div>
            <div className="info-value">{currentTime} min</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsPanel;
