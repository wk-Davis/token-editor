import React, { useRef, MutableRefObject, useEffect } from 'react';
import { fabric } from 'fabric';

import './Canvas.css';
import envvars from '../../envvars';

interface Props {
  state: {
    [name: string]: {
      color: string;
      src: string;
    };
  };
}

const Canvas: React.FunctionComponent<Props> = ({ state }) => {
  const canvasRef: MutableRefObject<HTMLCanvasElement | null> = useRef(null);
  const canvas: MutableRefObject<any | null> = useRef(null);
  
  useEffect(() => {
    const canvasOpts = { backgroundColor: 'lightgrey' };
    if (!canvas.current)
      canvas.current = new fabric.StaticCanvas(
        (canvasRef.current as unknown) as HTMLCanvasElement,
        canvasOpts
      );
  }, []);

  useEffect(() => {
    Object.keys(state).forEach((key: string) => {
      fabric.Image.fromURL(
        state[key].src,
        (img: fabric.Image) => {
          canvas.current.add(img);
          if (img.name === envvars.REACT_APP_BASE)
            canvas.current.bringToFront(img);
          else canvas.current.sendToBack(img);
        },
        { name: key }
      );
    });
  }, [state]);

  return <canvas height={200} ref={canvasRef} width={200}></canvas>;
};

export default Canvas;
