import { readFile } from 'fs/promises';
import { setWallpaper } from 'wallpaper';
import { parseStringPromise } from 'xml2js';
import { themePath, argv } from '../index.js'

export default async function gnome() {
    const pointArr: any[] = [];
    const sysdate = new Date();
    // sysdate.setHours(0, 0, 0, 0)
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

        sysdate.setHours(0, 0, Number(xml.background.starttime[0].hour[0]) * 3600 + Number(xml.background.starttime[0].minute[0]) * 60 + Number(xml.background.starttime[0].second[0]), 0)
        let timeArr = xml.background.transition.map((data:any) => {return {"duration":[Number(data.duration[0])], "file": data.from}} )

        if (xml.background.static) {
            timeArr = xml.background.static
            timeArr.forEach((element: any) => {
                element.duration[0] = Number(element.duration[0])
            });
            xml.background.transition.forEach((data: any) => {

                timeArr.find((time: any) => time.file[0] === data.from[0]).duration[0] += Number(data.duration[0] / 2)
                timeArr.find((time: any) => time.file[0] === data.to[0]).duration[0] += Number(data.duration[0] / 2)
            });
        }

        timeArr.reduce((acum:number, data:any) => {
                pointArr.push([addSecondsToDate(acum), addSecondsToDate(acum + Number(data.duration[0])), data.file[0]]);
                return acum + Number(data.duration[0]);
        },0)

        console.log(JSON.stringify(timeArr, null, 4), sysdate);
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
        const date = new Date()
        pointArr.forEach(async (element) => {
            if (argv.verbose) {
                console.log(element[0].toLocaleTimeString('en-US', { hour12: false }), ' ', date.toLocaleTimeString('en-US', { hour12: false }), ' ', element[1].toLocaleTimeString('en-US', { hour12: false }), ' ', element[2]);
            }
            if (element[0].getTime() < date.getTime() && date.getTime() < element[1].getTime() && currentpath != element[2]) {
                currentpath = element[2];
                await setWallpaper(element[2]);
            }
        });
    }
}
