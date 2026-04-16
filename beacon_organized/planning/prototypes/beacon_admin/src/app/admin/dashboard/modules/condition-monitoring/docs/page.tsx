import ModuleDocs from '@/components/ModuleDocs';
import DriveRefDocs from '@/components/DriveRefDocs';

export default function Page() {
  return (
    <div>
      <div className="dashboard-welcome">
        <h1>Condition Monitoring — Documentation</h1>
      </div>
      <ModuleDocs group="condition-monitoring" />
      <DriveRefDocs module="condition-monitoring" />
    </div>
  );
}
