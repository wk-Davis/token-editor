import React, { MutableRefObject, useEffect, useRef } from 'react';
import { fabric } from './fabric.js';
import { saveAs } from 'file-saver';

import './Canvas.css';
import envvars from '../../envvars';

interface Props {
  saveCanvas: MutableRefObject<(() => void) | null>;
  state: Token;
}

const Canvas: React.FunctionComponent<Props> = ({ saveCanvas, state }) => {
  const canvasRef: MutableRefObject<HTMLCanvasElement | null> = useRef(null);
  const fabricCanvas: MutableRefObject<fabric.StaticCanvas | null> = useRef(
    null
  );

  useEffect(() => {
    fabricCanvas.current = new fabric.StaticCanvas(canvasRef.current);
  }, []);

  useEffect(() => {
    if (saveCanvas)
      saveCanvas.current = () => {
        if (fabricCanvas.current) {
          const data = fabricCanvas.current.toDataURL({
            format: 'png',
            multiplier: 1,
            enableRetinaScaling: true,
          });
          saveAs(data, 'token.png');
        }
      };
  }, [saveCanvas]);

  useEffect(() => {
    if (fabricCanvas.current) {
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
            fabricCanvas.current?.add(img);
            if (img.name === envvars.REACT_APP_BASE)
              fabricCanvas.current?.bringToFront(img);
            else fabricCanvas.current?.sendToBack(img);
          },
          { name: key }
        );
      });
      return function clear() {
        fabricCanvas.current?.clear();
      };
    }
  }, [state]);

  return <canvas height={200} ref={canvasRef} width={200}></canvas>;
};

export default Canvas;
