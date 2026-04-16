import ModuleDocs from '@/components/ModuleDocs';

export default function Page() {
  return (
    <div>
      <div className="dashboard-welcome">
        <h1>Post-Operations — Documentation</h1>
      </div>
      <ModuleDocs group="post-ops" />
    </div>
  );
}
