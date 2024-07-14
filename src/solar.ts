import { themePath, argv } from '../index.js'
import SunCalc from 'suncalc';
import { setWallpaper } from 'wallpaper';
import { platform } from 'os'

export default async function solar() {
    interface TimeStamp{
        path: string;
        start: number;
        end: number;
    }

    let currentpath:string;
    const isWindows:boolean = platform() === 'win32'
    const location = argv.location.split(':').map(string => +string)
    const module = await import((isWindows ? 'file:\\' : '') + themePath + (isWindows ? '\\theme.json' : '/theme.json'), { with: { type: "json" } })
    const themeJSON:TimeStamp[] = module.default

    await changeBG()
    setInterval(changeBG, 1000);

    async function changeBG() {
        const solarTime = SunCalc.getTimes(new Date(), location[0], location[1])
        const altitude = SunCalc.getPosition(new Date(), location[0], location[1]).altitude * (180 / Math.PI)
        const isAfterNoon = solarTime.solarNoon < new Date()

        if (!Object.keys(themeJSON).length) {
            throw new Error("file is not a solar theme")
        }

        themeJSON.forEach((timeStamp) => {
            if (Object.keys(timeStamp).sort().join() !== "end,path,start") {
                throw new Error("file is not a solar theme")
            }
        })
        themeJSON.forEach(async (element) => {
            const elementPath = themePath + '/' + element.path
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
