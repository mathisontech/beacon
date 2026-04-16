export interface SubmoduleTab {
  label: string;
  slug: string;
}

export interface BaseMapSubmodule {
  key: string;
  tabs: SubmoduleTab[];
}

export const baseMapSubmodules: BaseMapSubmodule[] = [
  {
    key: 'event-updates',
    tabs: [
      { label: 'Source Release Tracking', slug: 'source-tracking' },
      { label: 'Post-Event Resurvey', slug: 'post-event-resurvey' },
      { label: 'Satellite Tasking', slug: 'satellite-tasking' },
      { label: 'Validation Gates', slug: 'validation-gates' },
      { label: 'Conflict Resolution', slug: 'conflict-resolution' },
      { label: 'Version Promotion', slug: 'version-promotion' },
    ],
  },
  {
    key: 'user-adjustments',
    tabs: [
      { label: 'Manual Report Processor', slug: 'manual-reports' },
      { label: 'Persistent Change Validator', slug: 'persistent-changes' },
      { label: 'Photo Verification Queue', slug: 'photo-verification' },
      { label: 'Confidence Scoring', slug: 'confidence-scoring' },
    ],
  },
  {
    key: 'user-layers',
    tabs: [
      { label: 'EMS Evacuation Zones', slug: 'evacuation-zones' },
      { label: 'Utility Zone Manager', slug: 'utility-zones' },
      { label: 'Zone Drawing Tools', slug: 'drawing-tools' },
      { label: 'Private Layer Permissions', slug: 'private-permissions' },
      { label: 'Federated Layer Discovery', slug: 'federated-discovery' },
      { label: 'Version Control', slug: 'version-control' },
    ],
  },
  {
    key: 'sensor-attributes',
    tabs: [
      { label: 'Traversability Inference', slug: 'traversability-inference' },
      { label: 'Building Attribute Inference', slug: 'building-inference' },
      { label: 'Street-Level Perception', slug: 'street-perception' },
      { label: 'Sensor Data Fusion', slug: 'data-fusion' },
      { label: 'Real-Time Transient Layer', slug: 'transient-layer' },
      { label: 'Persistent Change Queue', slug: 'persistent-queue' },
    ],
  },
];
