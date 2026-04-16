import React, { useState } from 'react';

const C = {
  bg: '#F5F5F7',
  card: '#FFFFFF',
  text: '#1A1A1A',
  sub: '#6B7280',
  muted: '#9CA3AF',
  orange: '#EA7928',
  purple: '#B829FC',
  blue: '#3881B8',
  deepPurple: '#50386A',
  green: '#2D8B4E',
  yellow: '#E8B84E',
  red: '#C0392B',
  border: '#E5E7EB',
  feedBg: '#F0F0F2',
};

const triageColors = {
  red: '#DC2626',
  yellow: '#F59E0B',
  green: '#10B981',
  black: '#374151',
};

const BeaconEMSMobile = () => {
  const [activeTab, setActiveTab] = useState('patients');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [patients, setPatients] = useState([
    { id: 'P-001', age: 72, sex: 'M', complaint: 'Smoke inhalation', triage: 'red', location: 'Hillside Rd & Oak St', status: 'Awaiting transport', medic: 'M. Rodriguez', ambulance: null, hospital: null, eta: null },
    { id: 'P-002', age: 58, sex: 'F', complaint: 'Minor burns', triage: 'yellow', location: 'Convention Center', status: 'Being treated', medic: 'J. Thompson', ambulance: null, hospital: null, eta: null },
    { id: 'P-003', age: 34, sex: 'M', complaint: 'Heat exhaustion', triage: 'yellow', location: 'Evacuation shelter', status: 'En route to hospital', medic: 'A. Park', ambulance: 'A-12', hospital: 'Regional Medical', eta: '12 min' },
    { id: 'P-004', age: 24, sex: 'F', complaint: 'Smoke inhalation', triage: 'yellow', location: 'Hillside Rd & Oak St', status: 'Being treated', medic: 'M. Rodriguez', ambulance: null, hospital: null, eta: null },
    { id: 'P-005', age: 81, sex: 'M', complaint: 'Smoke inhalation', triage: 'red', location: 'Convention Center', status: 'Awaiting transport', medic: 'J. Thompson', ambulance: null, hospital: null, eta: null },
    { id: 'P-006', age: 45, sex: 'M', complaint: 'Ankle injury', triage: 'green', location: 'Hillside Rd & Oak St', status: 'Being treated', medic: 'S. Lee', ambulance: null, hospital: null, eta: null },
    { id: 'P-007', age: 52, sex: 'F', complaint: 'Minor burns', triage: 'green', location: 'Convention Center', status: 'Being treated', medic: 'K. Vasquez', ambulance: null, hospital: null, eta: null },
  ]);
  const [ambulances] = useState([
    { id: 'A-11', status: 'Available', location: 'Station 5', patientId: null, color: triageColors.green },
    { id: 'A-12', status: 'Transporting', location: 'En route to Regional Medical', patientId: 'P-003', color: triageColors.red },
    { id: 'A-13', status: 'On Scene', location: 'Convention Center', patientId: null, color: triageColors.orange },
  ]);
  const [hospitals] = useState([
    { name: 'Regional Medical', distance: '25 min', erBeds: 4, traumaBeds: 2, burnUnit: true, diversion: false },
    { name: 'County General', distance: '40 min', erBeds: 1, traumaBeds: 0, burnUnit: false, diversion: true },
  ]);
  const [supplies] = useState([
    { item: 'Oxygen cylinders', count: 12, critical: false },
    { item: 'IV kits', count: 8, critical: false },
    { item: 'Bandages & dressings', count: 45, critical: false },
    { item: 'Burn gel', count: 3, critical: true },
    { item: 'Pain medications', count: 6, critical: false },
  ]);
  const [medicalChannel, setMedicalChannel] = useState('Medical');
  const [mciMode, setMciMode] = useState(false);

  const triageSummary = {
    red: 2,
    yellow: 5,
    green: 8,
    black: 0,
    total: 15,
    transported: 4,
  };

  // ===== STATUS BAR =====
  const StatusBar = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', backgroundColor: C.text, color: 'white', fontSize: '14px', fontWeight: '500' }}>
      <span>9:41</span>
      <div style={{ backgroundColor: C.orange, padding: '4px 12px', borderRadius: '12px', fontSize: '11px' }}>ON DUTY</div>
    </div>
  );

  // ===== TAB 1: PATIENTS =====
  const PatientsTab = () => (
    <div style={{ paddingBottom: '80px' }}>
      {/* Triage Summary Bar */}
      <div style={{ display: 'flex', gap: '10px', padding: '16px', backgroundColor: C.card, borderRadius: '12px', margin: '16px' }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '8px', backgroundColor: triageColors.red, borderRadius: '8px', color: 'white', fontWeight: 'bold' }}>
          <div style={{ fontSize: '18px' }}>{triageSummary.red}</div>
          <div style={{ fontSize: '9px', marginTop: '2px' }}>Red</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '8px', backgroundColor: triageColors.yellow, borderRadius: '8px', color: 'white', fontWeight: 'bold' }}>
          <div style={{ fontSize: '18px' }}>{triageSummary.yellow}</div>
          <div style={{ fontSize: '9px', marginTop: '2px' }}>Yellow</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '8px', backgroundColor: triageColors.green, borderRadius: '8px', color: 'white', fontWeight: 'bold' }}>
          <div style={{ fontSize: '18px' }}>{triageSummary.green}</div>
          <div style={{ fontSize: '9px', marginTop: '2px' }}>Green</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '8px', backgroundColor: triageColors.black, borderRadius: '8px', color: 'white', fontWeight: 'bold' }}>
          <div style={{ fontSize: '18px' }}>{triageSummary.black}</div>
          <div style={{ fontSize: '9px', marginTop: '2px' }}>Black</div>
        </div>
      </div>

      {/* Totals */}
      <div style={{ display: 'flex', gap: '12px', padding: '0 16px', marginBottom: '16px' }}>
        <div style={{ flex: 1, padding: '12px', backgroundColor: C.card, borderRadius: '8px', textAlign: 'center', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: C.text }}>15</div>
          <div style={{ fontSize: '11px', color: C.sub, marginTop: '4px' }}>Total Treated</div>
        </div>
        <div style={{ flex: 1, padding: '12px', backgroundColor: C.card, borderRadius: '8px', textAlign: 'center', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: C.text }}>4</div>
          <div style={{ fontSize: '11px', color: C.sub, marginTop: '4px' }}>Transported</div>
        </div>
      </div>

      {/* Active Patients List */}
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: C.text, marginBottom: '12px' }}>Active Patients</h3>
        {patients.map((patient) => (
          <div key={patient.id} style={{ backgroundColor: C.card, borderRadius: '12px', marginBottom: '12px', padding: '14px', border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: C.text }}>{patient.id}</div>
                <div style={{ fontSize: '12px', color: C.sub, marginTop: '2px' }}>{patient.age}y {patient.sex}</div>
              </div>
              <div style={{ width: '12px', height: '36px', backgroundColor: patient.triage === 'red' ? triageColors.red : patient.triage === 'yellow' ? triageColors.yellow : patient.triage === 'green' ? triageColors.green : triageColors.black, borderRadius: '3px' }}></div>
            </div>
            <div style={{ fontSize: '13px', fontWeight: '500', color: C.text, marginBottom: '8px' }}>{patient.complaint}</div>
            <div style={{ fontSize: '11px', color: C.muted, marginBottom: '2px' }}>{patient.location}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${C.border}` }}>
              <div style={{ fontSize: '11px', color: C.sub }}>
                <strong>Medic:</strong> {patient.medic}
              </div>
              <div style={{ fontSize: '10px', fontWeight: '500', color: C.orange, backgroundColor: C.feedBg, padding: '3px 8px', borderRadius: '4px' }}>
                {patient.status}
              </div>
            </div>
            {patient.ambulance && (
              <div style={{ fontSize: '11px', color: C.text, marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${C.border}` }}>
                <strong>{patient.ambulance}</strong> → <strong>{patient.hospital}</strong> (ETA: {patient.eta})
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Add Patient Button */}
      <div style={{ padding: '0 16px', marginBottom: '20px' }}>
        <button onClick={() => setShowAddPatient(!showAddPatient)} style={{ width: '100%', padding: '14px', backgroundColor: C.red, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
          + Add Patient
        </button>
      </div>

      {/* Add Patient Form (Modal-like) */}
      {showAddPatient && (
        <div style={{ padding: '0 16px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: C.card, borderRadius: '12px', padding: '16px', border: `1px solid ${C.border}` }}>
            <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: C.text }}>New Patient Report</h4>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '500', color: C.sub, display: 'block', marginBottom: '4px' }}>Age</label>
              <input type="number" placeholder="Age" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.border}`, fontSize: '12px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '500', color: C.sub, display: 'block', marginBottom: '4px' }}>Sex</label>
              <select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.border}`, fontSize: '12px' }}>
                <option>M</option>
                <option>F</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '500', color: C.sub, display: 'block', marginBottom: '4px' }}>Chief Complaint</label>
              <input type="text" placeholder="e.g., Smoke inhalation" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.border}`, fontSize: '12px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '500', color: C.sub, display: 'block', marginBottom: '4px' }}>Triage Category</label>
              <select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.border}`, fontSize: '12px' }}>
                <option value="red">Red (Immediate)</option>
                <option value="yellow">Yellow (Delayed)</option>
                <option value="green">Green (Minor)</option>
                <option value="black">Black (Deceased)</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: '500', color: C.sub, display: 'block', marginBottom: '4px' }}>Location</label>
              <input type="text" placeholder="e.g., Convention Center" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.border}`, fontSize: '12px' }} />
            </div>
            <button onClick={() => setShowAddPatient(false)} style={{ width: '100%', padding: '10px', backgroundColor: C.red, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
              Create Patient
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ===== TAB 2: TRANSPORT =====
  const TransportTab = () => (
    <div style={{ paddingBottom: '80px' }}>
      {/* Ambulance Status Board */}
      <div style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: C.text, marginBottom: '12px' }}>Ambulance Status</h3>
        {ambulances.map((amb) => (
          <div key={amb.id} style={{ backgroundColor: C.card, borderRadius: '12px', marginBottom: '12px', padding: '14px', border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: C.text }}>{amb.id}</div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'white', backgroundColor: amb.color, padding: '4px 10px', borderRadius: '12px' }}>{amb.status}</div>
            </div>
            <div style={{ fontSize: '12px', color: C.sub }}>{amb.location}</div>
            {amb.patientId && <div style={{ fontSize: '11px', color: C.text, marginTop: '6px', padding: '6px', backgroundColor: C.feedBg, borderRadius: '4px' }}>Patient: {amb.patientId}</div>}
          </div>
        ))}
      </div>

      {/* Hospital Capacity */}
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: C.text, marginBottom: '12px' }}>Hospital Capacity</h3>
        {hospitals.map((hosp, idx) => (
          <div key={idx} style={{ backgroundColor: C.card, borderRadius: '12px', marginBottom: '12px', padding: '14px', border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: C.text }}>{hosp.name}</div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'white', backgroundColor: hosp.diversion ? triageColors.red : triageColors.green, padding: '4px 10px', borderRadius: '12px' }}>
                {hosp.diversion ? 'DIVERSION' : 'Accepting'}
              </div>
            </div>
            <div style={{ fontSize: '11px', color: C.sub, marginBottom: '8px' }}>{hosp.distance} drive time</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 1 auto', fontSize: '10px', backgroundColor: C.feedBg, padding: '4px 8px', borderRadius: '4px', color: C.text }}>
                <strong>ER:</strong> {hosp.erBeds} beds
              </div>
              <div style={{ flex: '0 1 auto', fontSize: '10px', backgroundColor: C.feedBg, padding: '4px 8px', borderRadius: '4px', color: C.text }}>
                <strong>Trauma:</strong> {hosp.traumaBeds} beds
              </div>
              {hosp.burnUnit && <div style={{ flex: '0 1 auto', fontSize: '10px', backgroundColor: C.feedBg, padding: '4px 8px', borderRadius: '4px', color: C.orange, fontWeight: '600' }}>Burn Unit ✓</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Transport Queue */}
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: C.text, marginBottom: '12px' }}>Awaiting Transport</h3>
        {patients.filter(p => p.status === 'Awaiting transport').map((patient) => (
          <div key={patient.id} style={{ backgroundColor: C.card, borderRadius: '12px', marginBottom: '10px', padding: '12px', border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: C.text }}>{patient.id}</div>
              <div style={{ fontSize: '11px', color: C.sub }}>{patient.complaint}</div>
            </div>
            <button style={{ padding: '6px 12px', backgroundColor: C.orange, color: 'white', border: 'none', borderRadius: '6px', fontSize: '10px', fontWeight: '600', cursor: 'pointer' }}>
              Dispatch
            </button>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '0 16px', display: 'flex', gap: '10px' }}>
        <button style={{ flex: 1, padding: '12px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          Request Ambulance
        </button>
        <button style={{ flex: 1, padding: '12px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          Update Capacity
        </button>
      </div>
    </div>
  );

  // ===== TAB 3: MAP =====
  const MapTab = () => (
    <div style={{ paddingBottom: '80px', padding: '16px' }}>
      <div style={{ width: '100%', height: '500px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', position: 'relative', overflow: 'hidden', flexDirection: 'column' }}>
        {/* Terrain base — desert/chaparral foothills */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(175deg, #8B7D5E 0%, #9A8C6C 15%, #A69878 30%, #8B7D5E 45%, #7A6D50 55%, #8B7D5E 70%, #9A8C6C 85%, #A69878 100%)"}}>
          {/* Hill contours */}
          <div style={{position:"absolute",bottom:0,left:0,width:"70%",height:"30%",background:"radial-gradient(ellipse at 40% 90%, #6B5F45 0%, #7A6D50 30%, transparent 70%)",opacity:0.5}} />
          <div style={{position:"absolute",top:"10%",left:"-5%",width:"30%",height:"50%",background:"radial-gradient(ellipse at 70% 50%, #6B5F45 0%, transparent 60%)",opacity:0.3}} />
          <div style={{position:"absolute",top:"5%",right:0,width:"25%",height:"40%",background:"radial-gradient(ellipse at 30% 50%, #7A6D50 0%, transparent 60%)",opacity:0.25}} />
          {/* Scattered brush */}
          {[{t:"70%",l:"15%",s:18},{t:"60%",l:"45%",s:14},{t:"40%",l:"10%",s:16},{t:"25%",l:"70%",s:15},{t:"55%",l:"75%",s:13},{t:"80%",l:"60%",s:17},{t:"15%",l:"35%",s:12},{t:"35%",l:"55%",s:14}].map((b,i) => (
            <div key={"brush"+i} style={{position:"absolute",top:b.t,left:b.l,width:b.s,height:b.s,background:"radial-gradient(circle, #6B7A52 0%, transparent 70%)",borderRadius:"50%",opacity:0.3}} />
          ))}
        </div>

        {/* SVG Road paths (SR-89 north-south) */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 5 }} preserveAspectRatio="none">
          {/* SR-89 main road - north-south */}
          <line x1="55%" y1="0%" x2="55%" y2="100%" stroke="#D4A574" strokeWidth="8" opacity="0.7" />
          {/* Road center line */}
          <line x1="55%" y1="0%" x2="55%" y2="100%" stroke="#F5DEB3" strokeWidth="2" opacity="0.6" strokeDasharray="10,10" />
          {/* Secondary road - east-west connector */}
          <line x1="20%" y1="45%" x2="80%" y2="45%" stroke="#D4A574" strokeWidth="6" opacity="0.6" />
          {/* Road center line */}
          <line x1="20%" y1="45%" x2="80%" y2="45%" stroke="#F5DEB3" strokeWidth="2" opacity="0.5" strokeDasharray="10,10" />
        </svg>

        {/* Fire line/perimeter from south/southwest */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 6 }} preserveAspectRatio="none">
          {/* Fire perimeter curves from southwest */}
          <defs>
            <linearGradient id="fireGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#FF4500', stopOpacity: 0.8 }} />
              <stop offset="50%" style={{ stopColor: '#FF6347', stopOpacity: 0.5 }} />
              <stop offset="100%" style={{ stopColor: '#FFB347', stopOpacity: 0.2 }} />
            </linearGradient>
          </defs>
          {/* Fire perimeter line */}
          <path d="M 10 95 Q 30 80, 50 60 T 80 30" stroke="url(#fireGrad)" strokeWidth="12" fill="none" opacity="0.7" />
          {/* Fire gradient fill area */}
          <path d="M 10 100 L 10 95 Q 30 80, 50 60 T 80 30 L 85 30 L 100 100 Z" fill="url(#fireGrad)" opacity="0.15" />
        </svg>

        {/* Map markers and annotations */}
        <div style={{ position: 'absolute', zIndex: 8, top: '35%', left: '25%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          {/* Triage Point 1 - Convention Center */}
          <div style={{ width: '24px', height: '24px', backgroundColor: '#DC2626', borderRadius: '50%', border: '2px solid #FFF', boxShadow: '0 0 8px rgba(220,38,38,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#FFF' }}>✕</div>
          <div style={{ fontSize: '8px', color: '#E0E0E0', backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '3px', whiteSpace: 'nowrap' }}>Convention Center</div>
        </div>

        <div style={{ position: 'absolute', zIndex: 8, top: '60%', left: '45%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          {/* Triage Point 2 - Hillside Rd */}
          <div style={{ width: '24px', height: '24px', backgroundColor: '#F59E0B', borderRadius: '50%', border: '2px solid #FFF', boxShadow: '0 0 8px rgba(245,158,11,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#000' }}>✕</div>
          <div style={{ fontSize: '8px', color: '#E0E0E0', backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '3px', whiteSpace: 'nowrap' }}>Hillside Rd</div>
        </div>

        <div style={{ position: 'absolute', zIndex: 8, top: '25%', left: '70%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          {/* Hospital marker */}
          <div style={{ width: '28px', height: '28px', backgroundColor: '#10B981', borderRadius: '4px', border: '2px solid #FFF', boxShadow: '0 0 8px rgba(16,185,129,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🏥</div>
          <div style={{ fontSize: '8px', color: '#E0E0E0', backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '3px', whiteSpace: 'nowrap' }}>Regional Med</div>
        </div>

        <div style={{ position: 'absolute', zIndex: 8, top: '50%', left: '68%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          {/* Ambulance en route */}
          <div style={{ width: '24px', height: '24px', backgroundColor: '#3B82F6', borderRadius: '50%', border: '2px solid #FFF', boxShadow: '0 0 8px rgba(59,130,246,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>🚑</div>
          <div style={{ fontSize: '8px', color: '#E0E0E0', backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '3px', whiteSpace: 'nowrap' }}>A-12 Route</div>
        </div>

        {/* Evacuation shelter point */}
        <div style={{ position: 'absolute', zIndex: 8, top: '70%', left: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#8B5CF6', borderRadius: '50%', border: '2px solid #FFF', boxShadow: '0 0 6px rgba(139,92,246,0.6)' }}></div>
          <div style={{ fontSize: '8px', color: '#E0E0E0', backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '3px', whiteSpace: 'nowrap' }}>Shelter</div>
        </div>

        {/* North arrow / direction indicator */}
        <div style={{ position: 'absolute', top: '10px', right: '15px', zIndex: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ fontSize: '18px' }}>⬆</div>
          <div style={{ fontSize: '8px', color: '#E0E0E0', fontWeight: 'bold' }}>N</div>
        </div>

        {/* Map legend/scale */}
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 9, fontSize: '8px', color: '#E0E0E0', backgroundColor: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: '4px', lineHeight: '1.4' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Yarnell, AZ</div>
          <div>Scale: 1px ≈ 200m</div>
        </div>
      </div>
      <div style={{ backgroundColor: C.card, borderRadius: '12px', padding: '12px', border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: '11px', color: C.sub, marginBottom: '8px' }}>Map Features:</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '10px', backgroundColor: C.feedBg, padding: '4px 8px', borderRadius: '4px' }}>✕ Triage Locations</div>
          <div style={{ fontSize: '10px', backgroundColor: C.feedBg, padding: '4px 8px', borderRadius: '4px' }}>🚑 Ambulance Positions</div>
          <div style={{ fontSize: '10px', backgroundColor: C.feedBg, padding: '4px 8px', borderRadius: '4px' }}>🏥 Hospital Icons</div>
          <div style={{ fontSize: '10px', backgroundColor: C.feedBg, padding: '4px 8px', borderRadius: '4px' }}>🔥 Fire Projection</div>
        </div>
      </div>
    </div>
  );

  // ===== TAB 4: COMMS =====
  const CommsTab = () => (
    <div style={{ paddingBottom: '80px' }}>
      {/* Channel Selection */}
      <div style={{ padding: '16px', backgroundColor: C.card, borderBottom: `1px solid ${C.border}` }}>
        <label style={{ fontSize: '11px', fontWeight: '500', color: C.sub, display: 'block', marginBottom: '8px' }}>Active Channel</label>
        <select value={medicalChannel} onChange={(e) => setMedicalChannel(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '13px', fontWeight: '600' }}>
          <option>Medical</option>
          <option>Hospital Dispatch</option>
          <option>Command</option>
        </select>
      </div>

      {/* Message Log */}
      <div style={{ padding: '16px' }}>
        <div style={{ backgroundColor: C.feedBg, borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', color: C.muted }}>09:35 — Hospital Dispatch</div>
          <div style={{ fontSize: '12px', color: C.text, marginTop: '4px' }}>Regional Medical confirms bed availability for trauma patient.</div>
        </div>
        <div style={{ backgroundColor: C.feedBg, borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', color: C.muted }}>09:28 — M. Rodriguez (Medic)</div>
          <div style={{ fontSize: '12px', color: C.text, marginTop: '4px' }}>P-001: 72M, smoke inhalation, stable vitals. Awaiting transport.</div>
        </div>
        <div style={{ backgroundColor: C.feedBg, borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', color: C.muted }}>09:20 — Command</div>
          <div style={{ fontSize: '12px', color: C.text, marginTop: '4px' }}>Evacuation shelter population: 120. 3 medical cases identified.</div>
        </div>
      </div>

      {/* Quick Message Templates */}
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: '600', color: C.text, marginBottom: '10px' }}>Quick Templates</h4>
        <button style={{ width: '100%', padding: '12px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '11px', fontWeight: '500', marginBottom: '8px', cursor: 'pointer' }}>
          📋 Patient Report (MIST Format)
        </button>
        <button style={{ width: '100%', padding: '12px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '11px', fontWeight: '500', marginBottom: '8px', cursor: 'pointer' }}>
          🚑 Transport Request
        </button>
        <button style={{ width: '100%', padding: '12px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}>
          🏥 Hospital Update
        </button>
      </div>

      {/* Message Input */}
      <div style={{ padding: '0 16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="text" placeholder="Type message..." style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '12px' }} />
          <button style={{ padding: '10px 14px', backgroundColor: C.blue, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );

  // ===== TAB 5: TRIAGE =====
  const TriageTab = () => (
    <div style={{ paddingBottom: '80px' }}>
      {/* Triage Point Status */}
      <div style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: C.text, marginBottom: '12px' }}>Triage Point: Convention Center</h3>
        <div style={{ backgroundColor: C.card, borderRadius: '12px', padding: '14px', border: `1px solid ${C.border}`, marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '10px', color: C.sub, fontWeight: '500' }}>Capacity</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: C.text }}>15/30</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: C.sub, fontWeight: '500' }}>Status</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: C.orange }}>Operational</div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: C.muted }}>📍 Convention Center, Main Hall</div>
        </div>

        {/* MCI Mode Toggle */}
        <div style={{ backgroundColor: C.feedBg, borderRadius: '12px', padding: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: C.text }}>Mass Casualty Mode</div>
            <div style={{ fontSize: '10px', color: C.sub, marginTop: '2px' }}>Rapid triage tagging</div>
          </div>
          <button onClick={() => setMciMode(!mciMode)} style={{ padding: '6px 12px', backgroundColor: mciMode ? C.orange : C.muted, color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}>
            {mciMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Medical Supplies */}
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '600', color: C.text, marginBottom: '12px' }}>Medical Supplies</h4>
        {supplies.map((supply, idx) => (
          <div key={idx} style={{ backgroundColor: C.card, borderRadius: '10px', padding: '12px', marginBottom: '8px', border: `1px solid ${supply.critical ? C.red : C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: C.text }}>{supply.item}</div>
              {supply.critical && <div style={{ fontSize: '9px', color: C.red, fontWeight: '600', marginTop: '2px' }}>⚠️ Low stock</div>}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: supply.critical ? C.red : C.text }}>{supply.count}</div>
          </div>
        ))}
      </div>

      {/* Staff on Duty */}
      <div style={{ padding: '0 16px', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '600', color: C.text, marginBottom: '12px' }}>Medical Staff on Duty</h4>
        <div style={{ backgroundColor: C.card, borderRadius: '10px', padding: '12px', marginBottom: '8px', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: C.text }}>Dr. A. Chen</div>
          <div style={{ fontSize: '10px', color: C.sub, marginTop: '2px' }}>Medical Unit Leader</div>
          <div style={{ fontSize: '10px', color: C.orange, marginTop: '4px', fontWeight: '500' }}>Managing overall triage operations</div>
        </div>
        <div style={{ backgroundColor: C.card, borderRadius: '10px', padding: '12px', marginBottom: '8px', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: C.text }}>M. Rodriguez (Medic)</div>
          <div style={{ fontSize: '10px', color: C.sub, marginTop: '2px' }}>Currently treating P-001, P-002</div>
        </div>
        <div style={{ backgroundColor: C.card, borderRadius: '10px', padding: '12px', marginBottom: '8px', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: C.text }}>J. Thompson (Medic)</div>
          <div style={{ fontSize: '10px', color: C.sub, marginTop: '2px' }}>Currently treating P-004, P-005</div>
        </div>
        <div style={{ backgroundColor: C.card, borderRadius: '10px', padding: '12px', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: C.text }}>K. Vasquez (EMT)</div>
          <div style={{ fontSize: '10px', color: C.sub, marginTop: '2px' }}>Assisting with minor injuries</div>
        </div>
      </div>
    </div>
  );

  // ===== TAB BAR =====
  const TabBar = () => (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: C.card, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-around', height: '68px', margin: '0 auto', maxWidth: '375px', zIndex: 100, marginLeft: '20px' }}>
      {[{ id: 'patients', icon: '👥', label: 'Patients' }, { id: 'transport', icon: '🚑', label: 'Transport' }, { id: 'map', icon: '🗺️', label: 'Map' }, { id: 'comms', icon: '📡', label: 'Comms' }, { id: 'triage', icon: '🏥', label: 'Triage' }].map((tab) => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: activeTab === tab.id ? C.feedBg : 'transparent', color: activeTab === tab.id ? C.text : C.muted, border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: activeTab === tab.id ? '600' : '400' }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>{tab.icon}</div>
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', backgroundColor: C.bg, width: '375px', height: '812px', margin: '20px auto', borderRadius: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {activeTab === 'patients' && <PatientsTab />}
        {activeTab === 'transport' && <TransportTab />}
        {activeTab === 'map' && <MapTab />}
        {activeTab === 'comms' && <CommsTab />}
        {activeTab === 'triage' && <TriageTab />}
      </div>
      <TabBar />
    </div>
  );
};

export default BeaconEMSMobile;
