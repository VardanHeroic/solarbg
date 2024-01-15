import { readFile } from 'fs/promises';
import Moment from 'moment';
import { setWallpaper } from 'wallpaper';
import xml2js, { parseStringPromise } from 'xml2js';
import Moment_range from 'moment-range';
import { themePath } from '../index.js'

export default async function gnome() {
    let moment = Moment_range.extendMoment(Moment);
    let pointArr = [];
    let sysdate = new Date();
    let date = sysdate.getFullYear() + '-' + (Number(sysdate.getMonth()) + 1).toString() + '-' + sysdate.getDate();
    let currentpath = null
    let parser = new xml2js.Parser();

    function secondsToDate(seconds) {
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds - hours * 3600) / 60);
        let remantSeconds = seconds - hours * 3600 - minutes * 60;
        if (minutes / 10 < 1) {
            minutes = '0' + minutes;
        }
        if (remantSeconds / 10 < 1) {
            remantSeconds = '0' + remantSeconds;
        }

        return (' ' + hours + ':' + minutes + ':' + remantSeconds);
    }

    function findRange(xml) {
        if (!xml.background) {
            throw new Error("xml file is not a gnome theme")
        }
        xml.background.transition.reduce((acum, data) => {
            pointArr.push([new Date(date + secondsToDate(acum)), new Date(date + secondsToDate(acum + Number(data.duration[0]))), data.from[0]]);
            return acum + Number(data.duration[0]);
        }, 0);
        changeBG();
        setInterval(changeBG, 1000);
    }

    try {
        let file = await readFile(themePath + '.xml')
        let result = await parseStringPromise(file)
        findRange(result)
    } catch (error) {
        throw error
    }

    async function changeBG() {
        pointArr.forEach(async (element) => {
            let range = moment.range(element[0], element[1]);
            if (range.contains(new Date()) && currentpath != element[2]) {
                currentpath = element[2];
                await setWallpaper(element[2]);
            }
        });
    }
}
