import React, { useEffect, useRef } from 'react';
import styles from './PanoramaViewer.module.scss';

function PanoramaViewer({ imageUrl, onClose }) {
  const viewerRef = useRef(null);
  const pannellumViewerRef = useRef(null);

  useEffect(() => {
    if (viewerRef.current && window.pannellum && !pannellumViewerRef.current) {
      pannellumViewerRef.current = window.pannellum.viewer(viewerRef.current, {
        type: "equirectangular",
        panorama: imageUrl,
        autoLoad: true,
        showControls: true,
        showFullscreenCtrl: true,
        showZoomCtrl: true,
        mouseZoom: true,
        draggable: true,
        autoRotate: -2,
        compass: false,
        hfov: 100,
        pitch: 0,
        yaw: 0
      });
    }

    return () => {
      if (pannellumViewerRef.current) {
        pannellumViewerRef.current.destroy();
        pannellumViewerRef.current = null;
      }
    };
  }, [imageUrl]);

  return (
    <div className={styles.viewer}>
      <button className={styles.closeBtn} onClick={onClose}>×</button>
      <div ref={viewerRef} className={styles.pannellumContainer}></div>
    </div>
  );
}

export default PanoramaViewer;
