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
import inquisitor_lineart from './tokens/inquisitor/lineart.png';
import gunslinger_lineart from './tokens/gunslinger/lineart.png';
import monk_lineart from './tokens/monk/lineart.png';
import ranger_lineart from './tokens/ranger/lineart.png';
    
interface Config {
    [tokenName: string]: {
      [filename: string]: {
        color: string;
        src: string;
      };
    };
  }  
    
const config: Config = {cleric:{cloak:{ color: '#fff', src: cleric_cloak },hair:{ color: '#fff', src: cleric_hair },lineart:{ color: '#000000', src: cleric_lineart },mace_handle:{ color: '#fff', src: cleric_mace_handle },mace_head:{ color: '#fff', src: cleric_mace_head },shield:{ color: '#fff', src: cleric_shield },shoes:{ color: '#fff', src: cleric_shoes },skin:{ color: '#fff', src: cleric_skin },skirt:{ color: '#fff', src: cleric_skirt },sleeves:{ color: '#fff', src: cleric_sleeves },top:{ color: '#fff', src: cleric_top }},gunslinger:{lineart:{ color: '#000000', src: gunslinger_lineart }},inquisitor:{lineart:{ color: '#000000', src: inquisitor_lineart }},monk:{lineart:{ color: '#000000', src: monk_lineart }},ranger:{lineart:{ color: '#000000', src: ranger_lineart }}};
    
export default config;