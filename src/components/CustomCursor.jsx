import React from 'react';
import { useCustomCursor } from '../hooks/useCustomCursor';

const CustomCursor = () => {
  useCustomCursor();

  return (
    <>
      {/* Custom cursor (desktop only) */}
      <div className="cursor" id="cursorDot" aria-hidden="true">
        <div className="cursor-dot"></div>
      </div>
      <div className="cursor" id="cursorRing" aria-hidden="true">
        <div className="cursor-ring" id="cRing"></div>
      </div>
    </>
  );
};

export default CustomCursor;
