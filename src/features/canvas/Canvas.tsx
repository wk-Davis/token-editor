import React, { MutableRefObject, useEffect, useRef } from 'react';
import { fabric } from 'fabric';

import './Canvas.css';
import envvars from '../../envvars';

interface Props {
  canvas: MutableRefObject<any>;
  state: Token;
}

const Canvas: React.FunctionComponent<Props> = ({ canvas, state }) => {
  const canvasRef: MutableRefObject<HTMLCanvasElement | null> = useRef(null);

  useEffect(() => {
    if (canvas && !canvas.current)
      canvas.current = new fabric.StaticCanvas(
        (canvasRef.current as unknown) as HTMLCanvasElement
      );
  }, [canvas]);

  useEffect(() => {
    Object.keys(state).forEach((key: string) => {
      fabric.Image.fromURL(
        state[key].src,
        (img: fabric.Image) => {
          const filter = new fabric.Image.filters.BlendColor({
            color: state[key].color,
            mode: 'tint',
            alpha: 1,
          });
          if (Array.isArray(img.filters)) img.filters.push(filter);
          img.applyFilters();
          canvas.current.add(img);
          if (img.name === envvars.REACT_APP_BASE)
            canvas.current.bringToFront(img);
          else canvas.current.sendToBack(img);
        },
        { name: key }
      );
    });
    return function clear() {
      canvas?.current.clear();
    };
  }, [canvas, state]);

  return <canvas height={200} ref={canvasRef} width={200}></canvas>;
};

export default Canvas;
