import { themePath } from './index.js'
import SunCalc from 'suncalc';
import { setWallpaper } from 'wallpaper';
import { platform } from 'os'

export default function solar() {
	let themeJSON = {}
	let currentpath = null
	
	import( (platform == 'win32' ? 'file:\\' : '') + themePath + (platform == 'win32' ? '\\theme.json' : '/theme.json') ,{ assert: { type: "json" } })
		.then(module => themeJSON = module.default)
	changeBG()
	setInterval(changeBG,1000);

	async function changeBG() {
		let solarTime = SunCalc.getTimes(new Date(), process.argv[4], process.argv[5])
		let altitude = SunCalc.getPosition(new Date(),process.argv[4],process.argv[5]).altitude * (180/Math.PI)	
		let isAfterNoon = null
		if (solarTime.solarNoon < new Date() )  {
			isAfterNoon = true	
		}
		else {
			isAfterNoon = false
		}
		Object.keys(themeJSON).length && themeJSON.forEach(async element => {
			let elementPath = themePath + '/' + element.path 
			if (currentpath !== elementPath && isAfterNoon === element.afternoon) {		
				if(element.afternoon === true){
					if (element.start > altitude && altitude > element.end) {	
						currentpath = elementPath;
						console.log(currentpath, altitude);
						await setWallpaper(themePath + '/' + element.path)
					}
				}
				else if(element.afternoon === false) {
					if (element.start < altitude && altitude < element.end) {
						currentpath = elementPath;
						console.log(currentpath, altitude);
						await setWallpaper(themePath + '/' + element.path) 
					}
				}
			}
		});
	}
}
