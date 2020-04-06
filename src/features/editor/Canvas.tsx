import React, { useRef, RefObject } from 'react';

const Canvas: React.FunctionComponent<{}> = () => {
  const canvasRef: RefObject<HTMLCanvasElement> | null = useRef(null);
  return (
    <canvas
      height={200}
      ref={canvasRef}
      style={{ background: 'lightgrey' }}
      width={200}
    >
    </canvas>
  );
};

export default Canvas;
