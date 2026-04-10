import ModuleDocs from '@/components/ModuleDocs';
import DriveRefDocs from '@/components/DriveRefDocs';

export default function Page() {
  return (
    <div>
      <div className="dashboard-welcome">
        <h1>Risk Monitoring — Documentation</h1>
      </div>
      <ModuleDocs group="risk-monitoring" />
      <DriveRefDocs module="risk-monitoring" />
    </div>
  );
}
