import React, { MutableRefObject, useEffect, useRef } from 'react';
import { fabric } from './fabric.js';
import { saveAs } from 'file-saver';

import './Canvas.css';
import envvars from '../../envvars';
import { getSources } from '../editor/editorUtil';

interface Props {
  saveCanvas: MutableRefObject<(() => void) | null>;
  state: { [filename: string]: string };
  token: string;
}

const Canvas: React.FunctionComponent<Props> = ({
  saveCanvas,
  state,
  token,
}) => {
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
    if (fabricCanvas.current && token) {
      const sources = getSources(token);
      Object.keys(sources).forEach((key: string) => {
        fabric.Image.fromURL(
          sources[key],
          (img: fabric.Image) => {
            const filter = new fabric.Image.filters.BlendColor({
              color: key === envvars.REACT_APP_BASE ? '#000000' : '#EEEEEE',
              mode: 'tint',
              alpha: 1,
            });
            img.filters = [filter];
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
  }, [token]);

  useEffect(() => {
    if (fabricCanvas.current && token) {
      const images: fabric.Object[] = fabricCanvas.current.getObjects('image');
      images.forEach((img) => {
        const filter = new fabric.Image.filters.BlendColor({
          color: state[img.name as string],
          mode: 'tint',
          alpha: 1,
        });
        (img as fabric.Image).filters = [filter];
        (img as fabric.Image).applyFilters();
      });
      fabricCanvas.current.renderAll();
    }
  }, [state, token]);

  return <canvas height={200} ref={canvasRef} width={200}></canvas>;
};

export default Canvas;
