"use client";

import { useState } from "react";
import type { VolcanoCam } from "../volcano-cams";

interface Props {
  cams: VolcanoCam[];
}

// Single cam tile. Tries to render the direct image; if the
// image fails to load (404, CORS, blocked), swaps in a link-only
// card pointing at the observatory webcam page.
function CamTile({ cam }: { cam: VolcanoCam }) {
  const [broken, setBroken] = useState(!cam.image);
  const showImage = cam.image && !broken;

  return (
    <div className="vp-cam-tile">
      {showImage && (
        <div className="vp-cam-frame">
          <img
            src={cam.image}
            alt={cam.label}
            onError={() => setBroken(true)}
          />
          <div className="vp-cam-live">LIVE</div>
        </div>
      )}
      {!showImage && (
        <div className="vp-cam-placeholder">
          <div className="vp-cam-placeholder-icon">CAM</div>
          <div className="vp-cam-placeholder-text">
            Live image not embeddable
          </div>
        </div>
      )}
      <div className="vp-cam-meta">
        <div className="vp-cam-label">{cam.label}</div>
        <a
          className="vp-link"
          href={cam.page}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open on observatory site →
        </a>
      </div>
    </div>
  );
}

export function WebcamSection({ cams }: Props) {
  return (
    <section className="vp-section">
      <header className="vp-section-head">
        <h4>Live webcams</h4>
        {cams.length > 1 && (
          <span className="vp-section-meta">{cams.length} views</span>
        )}
      </header>
      {cams.length === 0 ? (
        <div className="vp-note">
          No webcams published for this volcano.
        </div>
      ) : (
        <div className="vp-cam-grid">
          {cams.map((c, i) => (
            <CamTile key={`${c.label}-${i}`} cam={c} />
          ))}
        </div>
      )}
      <p className="vp-note">
        Images are pulled live from USGS / AVO / HVO webcam servers.
        If a frame shows "not embeddable", use the link to open the
        observatory page in a new tab.
      </p>
    </section>
  );
}
