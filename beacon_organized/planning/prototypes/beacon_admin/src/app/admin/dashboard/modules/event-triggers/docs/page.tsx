import ModuleDocs from '@/components/ModuleDocs';
import DriveRefDocs from '@/components/DriveRefDocs';

export default function Page() {
  return (
    <div>
      <div className="dashboard-welcome">
        <h1>Event Triggers — Documentation</h1>
      </div>
      <ModuleDocs group="event-triggers" />
      <DriveRefDocs module="event-triggers" />
    </div>
  );
}
