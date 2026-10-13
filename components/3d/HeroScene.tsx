'use client';

import React from 'react';
import DonutChart3D from './DonutChart3D';

export default function HeroScene() {
  return (
    <div className="w-full h-full relative">
      <DonutChart3D height="100%" showControls={true} />
    </div>
  );
}
