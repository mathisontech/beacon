import ModuleDocs from '@/components/ModuleDocs';
import DriveRefDocs from '@/components/DriveRefDocs';

export default function Page() {
  return (
    <div>
      <div className="dashboard-welcome">
        <h1>Event Operations — Documentation</h1>
      </div>
      <ModuleDocs group="operations" />
      <DriveRefDocs module="operations" />
    </div>
  );
}
