import { readFile } from 'fs/promises';
import { setWallpaper } from 'wallpaper';
import { parseStringPromise, processors } from 'xml2js';
import { themePath, argv } from '../index.js'

export default async function gnome() {
    interface TimeStamp {
        path: string;
        start: Date;
        end: Date;
    }
    interface StaticTimeStamp {
        file: string;
        duration: number;
    }
    interface TransitionTimeStamp {
        duration: number
        from: string
        to: string
    }
    interface Theme {
        background: {
            starttime: {
                hour: number;
                minute: number;
                second: number;
            };
            static: StaticTimeStamp[]
            transition: TransitionTimeStamp[]
        }
    }

    function isStaticTimeStamp(obj: any): obj is StaticTimeStamp {
        return typeof obj === 'object' &&
            typeof obj.file === 'string' &&
            typeof obj.duration === 'number';
    }

    function isTransitionTimeStamp(obj: any): obj is TransitionTimeStamp {
        return typeof obj === 'object' &&
            typeof obj.duration === 'number' &&
            typeof obj.from === 'string' &&
            typeof obj.to === 'string';
    }

    function isTheme(obj: any): obj is Theme {
        return  obj !== null &&
            typeof obj === 'object' &&
            typeof obj.background === 'object' &&
            typeof obj.background.starttime === 'object' &&
            typeof obj.background.starttime.hour === 'number' &&
            typeof obj.background.starttime.minute === 'number' &&
            typeof obj.background.starttime.second === 'number' &&
            Array.isArray(obj.background.static) &&
            obj.background.static.every(isStaticTimeStamp) &&
            Array.isArray(obj.background.transition) &&
            obj.background.transition.every(isTransitionTimeStamp);
    }

    const pointArr: TimeStamp[] = [];
    const sysdate = new Date();
    let currentpath: string;

    try {
        const file = await readFile(themePath + '.xml')
        const result = await parseStringPromise(file, { explicitArray: false, valueProcessors: [processors.parseNumbers] })
        if (!isTheme(result)) {
            throw new Error("xml file is not a gnome theme")
        }
        findRange(result)
    } catch (error) {
        throw error
    }

    function findRange(xml: Theme) {
        sysdate.setHours(0, 0, xml.background.starttime.hour * 3600 + xml.background.starttime.minute * 60 + xml.background.starttime.second, 0)
        let timeArr: StaticTimeStamp[] = xml.background.transition.map(transitionTime => { return { "file": transitionTime.from, duration: transitionTime.duration } })

        if (xml.background.static) {
            timeArr = xml.background.static
            xml.background.transition.forEach(transitionTime => {
                timeArr[timeArr.findIndex(time => time.file === transitionTime.from)].duration += transitionTime.duration / 2
                timeArr[timeArr.findIndex(time => time.file === transitionTime.to)].duration += transitionTime.duration / 2
            });
        }

        timeArr.reduce((acum: number, time) => {
            pointArr.push({ "start": addSecondsToDate(acum), "end": addSecondsToDate(acum + time.duration), "path": time.file });
            return acum + time.duration
        }, 0)

        changeBG();
        setInterval(changeBG, 1000);
    }

    function addSecondsToDate(seconds: number): Date {
        const dateCopy = new Date(sysdate);
        dateCopy.setSeconds(sysdate.getSeconds() + seconds);
        return dateCopy;
    }

    async function changeBG() {
        const date = new Date()
        pointArr.forEach(async (element) => {
            if (argv.verbose) {
                console.log(element.start.toLocaleTimeString('en-US', { hour12: false }), ' ', date.toLocaleTimeString('en-US', { hour12: false }), ' ', element.end.toLocaleTimeString('en-US', { hour12: false }), ' ', element.path);
            }
            if (element.start.getTime() < date.getTime() && date.getTime() < element.end.getTime() && currentpath != element.path) {
                currentpath = element.path;
                await setWallpaper(element.path);
            }
        });
    }
}
