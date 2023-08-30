import {homedir,platform} from 'os';
import solar from './solar.js';
import gnome from './gnome.js'

let ospath = ''
export let themePath ='' 

switch(platform()) {
	case 'linux':
		ospath = '/.local/share/solarbg/themes/'
		break;
	case 'win32':
		ospath = '\\AppData\\Roaming\\solarbg\\themes\\'
		break;
	default:
		console.log('Your os is not supported');

}

if (ospath !== '') {
	themePath = homedir() + ospath + process.argv[3]

	if (process.argv[2] === 'gnome') {
		gnome()
	}
	if (process.argv[2] === 'sun'){
		solar()	
	}
	
}





