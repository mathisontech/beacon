import ModuleDocs from '@/components/ModuleDocs';
import DriveRefDocs from '@/components/DriveRefDocs';

export default function Page() {
  return (
    <div>
      <div className="dashboard-welcome">
        <h1>Event Management — Documentation</h1>
      </div>
      <ModuleDocs group="event-management" />
      <DriveRefDocs module="event-management" />
    </div>
  );
}
