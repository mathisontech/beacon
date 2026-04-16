import ModuleDocs from '@/components/ModuleDocs';

export default function Page() {
  return (
    <div>
      <div className="dashboard-welcome">
        <h1>People & Community — Documentation</h1>
      </div>
      <ModuleDocs group="people" />
    </div>
  );
}
