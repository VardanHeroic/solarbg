import {readFile} from 'fs';
import Moment from 'moment';
import SunCalc from 'suncalc';
import { setWallpaper } from 'wallpaper';
import xml2js from 'xml2js';
import Moment_range from 'moment-range';


let themeJSON = {}
let moment = Moment_range.extendMoment(Moment);
let pointArr = [];
let sysdate = new Date();
let currentpath = null;
let date = sysdate.getFullYear() + '-' + (Number(sysdate.getMonth()) + 1).toString() + '-' + sysdate.getDate();

function secondsToDate(seconds){
	let hours = Math.floor(seconds / 3600);
	let minutes = Math.floor((seconds - hours * 3600) / 60);
	let remantSeconds = seconds - hours * 3600 - minutes*60;
	if (minutes / 10 < 1) {
		minutes = '0' + minutes	;
	}
	if (remantSeconds / 10 < 1) {
		remantSeconds = '0' + remantSeconds;
	}
	console.log(' ' +  hours + ':' + minutes + ':' + remantSeconds);	
	return (' ' +  hours + ':' + minutes + ':' + remantSeconds);
}

function findRange(xml) {
	xml.background.transition.reduce((acum,data) => {
		pointArr.push([new Date(date + secondsToDate(acum)), new Date(date + secondsToDate(acum + Number(data.duration[0])))]);
		return acum + Number(data.duration[0]);
	},0);
	changeBG();
	setInterval(changeBG, 1000); 
}

if (process.argv[2] === 'gnome') {
	let parser = new xml2js.Parser();
	readFile('ok/Desert Sands by Louis Coyle.xml',(err,data) => {
		parser.parseString(data,(err, result) => {
			console.log('Done');
			findRange(result);
		});
	});
}

if (process.argv[2] === 'sun'){
	import('./' + process.argv[3] + '/theme.json',{ assert: { type: "json" } })
		.then(module => themeJSON = module.default)
	setInterval(sun,1000);
}

async function sun() {
	let solarTime = SunCalc.getTimes(new Date(), process.argv[4], process.argv[5])
	let altitude = SunCalc.getPosition(new Date(),process.argv[4],process.argv[5]).altitude * (180/Math.PI)
	console.log(altitude,currentpath);
	themeJSON.forEach(async element => {
		if (element.end === element.start && altitude < element.end && currentpath !== element.path && (solarTime.nadir > new Date() ) === element.afternoon  ) {
			currentpath = element.path
			await setWallpaper(process.argv[3] + '/' + element.path)
		}
		else if(element.start < altitude && altitude < element.end && (solarTime.solarNoon < new Date() ) === element.afternoon && currentpath !== element.path ){
			currentpath = element.path
			await setWallpaper(process.argv[3] + '/' + element.path)
		}
	})
	
	
}

async function changeBG () {
    sysdate = new Date();
    pointArr.forEach(async (element,index) => {
        let range = moment.range(element[0],element[1]);
        if (range.contains(sysdate)) {
			let path =`ok/${(index).toString()}.png`;
            if(currentpath != path){
				currentpath = path;
				await setWallpaper(path);	
			}
        }
    });
}
