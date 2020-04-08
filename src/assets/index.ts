import cleric_cloak from './tokens/cleric/cloak.png';
import cleric_hair from './tokens/cleric/hair.png';
import cleric_lineart from './tokens/cleric/lineart.png';
import cleric_mace_handle from './tokens/cleric/mace_handle.png';
import cleric_mace_head from './tokens/cleric/mace_head.png';
import cleric_shield from './tokens/cleric/shield.png';
import cleric_shoes from './tokens/cleric/shoes.png';
import cleric_skin from './tokens/cleric/skin.png';
import cleric_skirt from './tokens/cleric/skirt.png';
import cleric_sleeves from './tokens/cleric/sleeves.png';
import cleric_top from './tokens/cleric/top.png';
import gunslinger_lineart from './tokens/gunslinger/lineart.png';
import monk_lineart from './tokens/monk/lineart.png';
import ranger_lineart from './tokens/ranger/lineart.png';
import inquisitor_lineart from './tokens/inquisitor/lineart.png';
    
interface Config {
    [tokenName: string]: {
      [filename: string]: {
        color: string;
        src: string;
      };
    };
  }  
    
const config: Config = {cleric:{cloak:{ color: '#', src: cleric_cloak },hair:{ color: '#', src: cleric_hair },lineart:{ color: '#', src: cleric_lineart },mace_handle:{ color: '#', src: cleric_mace_handle },mace_head:{ color: '#', src: cleric_mace_head },shield:{ color: '#', src: cleric_shield },shoes:{ color: '#', src: cleric_shoes },skin:{ color: '#', src: cleric_skin },skirt:{ color: '#', src: cleric_skirt },sleeves:{ color: '#', src: cleric_sleeves },top:{ color: '#', src: cleric_top }},gunslinger:{lineart:{ color: '#', src: gunslinger_lineart }},inquisitor:{lineart:{ color: '#', src: inquisitor_lineart }},monk:{lineart:{ color: '#', src: monk_lineart }},ranger:{lineart:{ color: '#', src: ranger_lineart }}};
    
export default config;