const getTextColor = (hex: string): string => {
  const hexStr = hex.startsWith('#') ? hex.substring(1) : hex;
  if (hexStr === '000000') return 'white';
  let r = parseInt(hexStr.substr(0, 2), 16);
  let g = parseInt(hexStr.substr(2, 2), 16);
  let b = parseInt(hexStr.substr(4, 2), 16);
  let yiq = (r * 299 + g * 587 + b * 114) / 1000;
  if (!yiq) return 'black';
  return yiq >= 128 ? 'black' : 'white';
};

export default getTextColor;
