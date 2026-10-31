import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import DocPage from './docs/DocPage';
import NeuronHome from './NeuronHome';

// the planner is by far the biggest page, so it loads on its own
const PathPlanner = lazy(() => import('./planner/PathPlanner'));

// Routes under /neuron-pathing. The old static-site URLs redirect to their new homes.
export default function NeuronPathing() {
  return (
    <Routes>
      <Route index element={<NeuronHome />} />
      <Route path="planner" element={<Suspense fallback={null}><PathPlanner /></Suspense>} />
      <Route path="docs/:slug" element={<DocPage />} />
      <Route path="index.html" element={<Navigate to="/neuron-pathing" replace />} />
      <Route path="tools/neuron-path-planner.html" element={<Navigate to="/neuron-pathing/planner" replace />} />
      <Route path="*" element={<Navigate to="/neuron-pathing" replace />} />
    </Routes>
  );
}
