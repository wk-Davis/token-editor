import cleric from './tokens/cleric/cleric_lineart.png';
import gunslinger from './tokens/gunslinger/gunslinger_lineart.png';
import inquisitor from './tokens/inquisitor/inquisitor_lineart.png';
import monk from './tokens/monk/monk_lineart.png';
import ranger from './tokens/ranger/ranger_lineart.png';

interface srcRef {
  src: string;
  ref: string;
}

export const refs: srcRef[] = [
  { src: cleric, ref: 'cleric' },
  { src: gunslinger, ref: 'gunslinger' },
  { src: inquisitor, ref: 'inquisitor' },
  { src: monk, ref: 'monk' },
  { src: ranger, ref: 'ranger' }
];
