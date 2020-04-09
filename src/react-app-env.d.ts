/// <reference types="react-scripts" />

type HexStr = string;

interface Token {
  [fileName: string]: {
    src: string;
    color: HexStr;
  };
}
