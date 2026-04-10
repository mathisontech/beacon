"use client";

import type { VolcanoDetail } from "../volcano-details";

interface Props {
  detail: VolcanoDetail | Omit<VolcanoDetail, "id">;
}

export function WebcamSection({ detail }: Props) {
  return (
    <section className="vp-section">
      <header className="vp-section-head">
        <h4>Webcam</h4>
      </header>
      <div className="vp-webcam-placeholder">
        <div className="vp-webcam-icon">CAM</div>
        <div className="vp-webcam-meta">
          <div className="vp-webcam-label">{detail.webcamLabel}</div>
          <a
            className="vp-link"
            href={detail.webcamUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open live cameras →
          </a>
        </div>
      </div>
      <p className="vp-note">
        USGS volcano observatories publish near-real-time stills and some
        live streams. Opens in a new tab.
      </p>
    </section>
  );
}
