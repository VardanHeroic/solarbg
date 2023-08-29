import {homedir} from 'os';
import solar from './solar.js';
import gnome from './gnome.js'

export let themePath = homedir() + '/.local/share/solarbg/themes/' + process.argv[3]

if (process.argv[2] === 'gnome') {
	gnome()
}

if (process.argv[2] === 'sun'){
	solar()	
}


