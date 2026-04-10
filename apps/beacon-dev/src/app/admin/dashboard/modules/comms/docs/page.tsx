import ModuleDocs from '@/components/ModuleDocs';

export default function Page() {
  return (
    <div>
      <div className="dashboard-welcome">
        <h1>Communications & Alerts — Documentation</h1>
      </div>
      <ModuleDocs group="comms" />
    </div>
  );
}
