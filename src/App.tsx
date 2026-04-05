import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import PlanBuilder from './pages/PlanBuilder';
import ExerciseMode from './pages/ExerciseMode';
import ActiveWorkout from './pages/ActiveWorkout';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="plan" element={<PlanBuilder />} />
          <Route path="workout" element={<ExerciseMode />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
        {/* Active workout mode is fullscreen, no navbar */}
        <Route path="workout/active" element={<ActiveWorkout />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
