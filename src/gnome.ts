import { readFile } from 'fs/promises';
import { setWallpaper } from 'wallpaper';
import { parseStringPromise } from 'xml2js';
import { themePath, argv } from '../index.js'

export default async function gnome() {
    const pointArr: any[] = [];
    const sysdate = new Date();
    sysdate.setHours(0, 0, 0, 0)
    let currentpath: string;

    function addSecondsToDate(seconds: any): Object {
        const dateCopy = new Date(sysdate);
        dateCopy.setSeconds(sysdate.getSeconds() + seconds);
        return dateCopy;
    }

    function findRange(xml: any) {
        if (!xml.background) {
            throw new Error("xml file is not a gnome theme")
        }
        xml.background.transition.reduce((acum: number, data: any) => {
            pointArr.push([addSecondsToDate(acum), addSecondsToDate(acum + Number(data.duration[0])), data.from[0]]);
            return acum + Number(data.duration[0]);
        }, Number(xml.background.starttime[0].hour[0]) * 3600 + Number(xml.background.starttime[0].minute[0]) * 60 + Number(xml.background.starttime[0].second[0]));
        changeBG();
        setInterval(changeBG, 1000);
    }

    try {
        const file = await readFile(themePath + '.xml')
        const result = await parseStringPromise(file)
        findRange(result)
    } catch (error) {
        throw error
    }

    async function changeBG() {
        pointArr.forEach(async (element) => {
            if (element[0].getTime() < new Date().getTime() && new Date().getTime() < element[1].getTime() && currentpath != element[2]) {
                if (argv.verbose) {
                    console.log(element[0], '  ', new Date(), '  ', element[1], '  ', element[2]);
                }
                currentpath = element[2];
                await setWallpaper(element[2]);
            }
        });
    }
}
