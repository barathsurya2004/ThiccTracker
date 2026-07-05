import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { UserProfile } from '../context/AppContext';
import { Arrow } from '../components/Icons';

const EXPERIENCE_LEVELS: UserProfile['experienceLevel'][] = ['Beginner', 'Intermediate', 'Advanced'];
const EQUIPMENT_OPTIONS: UserProfile['equipmentAccess'][] = ['Gym', 'Bodyweight', 'Dumbbells', 'Barbell+DB'];

export default function QuickSetupScreen() {
  const { userProfile, setUserProfile, setHasCompletedSetup, setScreen } = useApp();
  const [name, setName] = useState(userProfile.name);
  const [weightKg, setWeightKg] = useState(String(userProfile.weightKg));
  const [heightCm, setHeightCm] = useState(String(userProfile.heightCm));
  const [experience, setExperience] = useState(userProfile.experienceLevel);
  const [equipment, setEquipment] = useState(userProfile.equipmentAccess);

  const save = () => {
    setUserProfile({
      name: name.trim() || userProfile.name,
      weightKg: Math.min(300, Math.max(20, Number(weightKg) || userProfile.weightKg)),
      heightCm: Math.min(250, Math.max(100, Number(heightCm) || userProfile.heightCm)),
      experienceLevel: experience,
      equipmentAccess: equipment,
    });
    setHasCompletedSetup(true);
    setScreen('home');
  };

  const skip = () => {
    setHasCompletedSetup(true);
    setScreen('home');
  };

  return (
    <div className="screen no-tab" style={{ paddingTop: 0 }}>
      <div className="section" style={{ paddingTop: 60, paddingBottom: 40 }}>
        <div className="t-h1">Quick setup</div>
        <div className="t-body dim" style={{ marginTop: 6 }}>
          A few details to personalize your training. You can change these later in Settings.
        </div>

        <div className="stack-16" style={{ marginTop: 28 }}>
          <input className="field" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />

          <div className="row" style={{ gap: 12 }}>
            <label className="card" style={{ flex: 1, padding: 12 }}>
              <div className="t-caps">Weight (kg)</div>
              <input className="field" style={{ marginTop: 6, padding: '8px 10px', border: 'none', background: 'transparent' }}
                type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} />
            </label>
            <label className="card" style={{ flex: 1, padding: 12 }}>
              <div className="t-caps">Height (cm)</div>
              <input className="field" style={{ marginTop: 6, padding: '8px 10px', border: 'none', background: 'transparent' }}
                type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} />
            </label>
          </div>

          <div>
            <div className="t-caps" style={{ marginBottom: 8 }}>Experience level</div>
            <div className="seg" style={{ width: '100%' }}>
              {EXPERIENCE_LEVELS.map(lvl => (
                <button key={lvl} className={experience === lvl ? 'on' : ''} onClick={() => setExperience(lvl)} style={{ flex: 1 }}>{lvl}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="t-caps" style={{ marginBottom: 8 }}>Equipment access</div>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              {EQUIPMENT_OPTIONS.map(opt => (
                <button key={opt} className="card" onClick={() => setEquipment(opt)}
                  style={{
                    flex: '1 1 45%', padding: '12px', textAlign: 'center', cursor: 'pointer',
                    borderColor: equipment === opt ? 'var(--accent)' : 'var(--hairline)',
                    color: equipment === opt ? 'var(--accent)' : 'var(--text)',
                    fontWeight: 500, fontSize: 13,
                  }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="stack-12" style={{ marginTop: 32 }}>
          <button className="btn primary" onClick={save}>
            Let's go
            <Arrow width={16} height={16} />
          </button>
          <button className="btn ghost" onClick={skip}>Skip for now</button>
        </div>
      </div>
    </div>
  );
}
