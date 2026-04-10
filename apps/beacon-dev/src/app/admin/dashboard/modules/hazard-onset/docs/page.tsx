import ModuleDocs from '@/components/ModuleDocs';
import DriveRefDocs from '@/components/DriveRefDocs';

export default function Page() {
  return (
    <div>
      <div className="dashboard-welcome">
        <h1>Hazard Onset Response — Documentation</h1>
      </div>
      <ModuleDocs group="hazard-onset" />
      <DriveRefDocs module="hazard-onset" />
    </div>
  );
}
