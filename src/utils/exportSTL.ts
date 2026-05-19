import { STLExporter } from 'three-stdlib';
import * as THREE from 'three';

declare global {
  interface Window {
    plateGroup: THREE.Group | null;
  }
}

export function exportSTL() {
  const group = window.plateGroup;
  if (!group) {
    alert('Modelo 3D não encontrado.');
    return;
  }

  const exporter = new STLExporter();
  // Parse the group. STLExporter works with Object3D.
  const stlString = exporter.parse(group);
  
  const blob = new Blob([stlString], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.download = 'placa-3d.stl';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
