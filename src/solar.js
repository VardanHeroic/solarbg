import { themePath, argv } from '../index.js'
import SunCalc from 'suncalc';
import { setWallpaper } from 'wallpaper';
import { platform } from 'os'

export default function solar() {
	let themeJSON = {}
	let currentpath = null
    let location = argv.location.split(':')

	import( (platform == 'win32' ? 'file:\\' : '') + themePath + (platform == 'win32' ? '\\theme.json' : '/theme.json') ,{ assert: { type: "json" } })
		.then(module => themeJSON = module.default)
	changeBG()
	setInterval(changeBG,1000);

	async function changeBG() {
		let solarTime = SunCalc.getTimes(new Date(), location[0], location[1])
		let altitude = SunCalc.getPosition(new Date(),location[0],location[1]).altitude * (180/Math.PI)
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
				if( (element.afternoon === true && element.start > altitude && altitude > element.end) || (element.afternoon === false && element.start < altitude && altitude < element.end)) {
					currentpath = elementPath;
                    if (argv.verbose) {
                        console.log(currentpath, altitude);
                    }
					await setWallpaper(themePath + '/' + element.path)
				}
			}
		});
	}
}
