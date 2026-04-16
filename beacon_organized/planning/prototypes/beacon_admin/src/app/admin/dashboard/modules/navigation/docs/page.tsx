import ModuleDocs from '@/components/ModuleDocs';

export default function Page() {
  return (
    <div>
      <div className="dashboard-welcome">
        <h1>Navigation & Terrain — Documentation</h1>
      </div>
      <ModuleDocs group="navigation" />
    </div>
  );
}
