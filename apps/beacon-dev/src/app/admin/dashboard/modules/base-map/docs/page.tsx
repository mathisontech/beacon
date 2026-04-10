import ModuleDocs from '@/components/ModuleDocs';
import DriveRefDocs from '@/components/DriveRefDocs';

export default function Page() {
  return (
    <div>
      <div className="dashboard-welcome">
        <h1>Base Map — Documentation</h1>
      </div>
      <ModuleDocs group="base-map" />
      <DriveRefDocs module="base-map" />
    </div>
  );
}
