import { themePath, argv } from '../index.js'
import SunCalc from 'suncalc';
import { setWallpaper } from 'wallpaper';
import { platform } from 'os'

export default async function solar() {
    let themeJSON = {}
    let currentpath = null
    let location = argv.location.split(':')

    try {
        let module = await import((platform == 'win32' ? 'file:\\' : '') + themePath + (platform == 'win32' ? '\\theme.json' : '/theme.json'), { assert: { type: "json" } })
        themeJSON = module.default
        await changeBG()
        setInterval(changeBG, 1000);

    } catch (error) {
        throw error
    }


    async function changeBG() {
        let solarTime = SunCalc.getTimes(new Date(), location[0], location[1])
        let altitude = SunCalc.getPosition(new Date(), location[0], location[1]).altitude * (180 / Math.PI)
        let isAfterNoon = null
        if (solarTime.solarNoon < new Date()) {
            isAfterNoon = true
        }
        else {
            isAfterNoon = false
        }
        themeJSON.forEach(timeStamp => {
            if (Object.keys(timeStamp).sort().join() !== "end,path,start") {
                throw new Error("file is not a solar theme")
            }
        })
        Object.keys(themeJSON).length && themeJSON.forEach(async element => {
            let elementPath = themePath + '/' + element.path
            if (currentpath !== elementPath) {
                if ((isAfterNoon && element.start > altitude && altitude > element.end) || (!isAfterNoon && element.start < altitude && altitude < element.end)) {
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
