import cleric from './cleric/cleric_lineart.png';
import gunslinger from './gunslinger/gunslinger_lineart.png';
import inquisitor from './inquisitor/inquisitor_lineart.png';
import monk from './monk/monk_lineart.png';
import ranger from './ranger/ranger_lineart.png';

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
