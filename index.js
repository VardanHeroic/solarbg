#!/usr/bin/env -S node --no-warnings

import { homedir, platform } from 'os';
import solar from './src/solar.js';
import gnome from './src/gnome.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'


export let argv = yargs(hideBin(process.argv))
    .wrap(120)
    .option('verbose', {
        describe: 'enable verbose logging',
    })
    .option('theme', {
        alias: 't',
        describe: 'theme name(theme path is ~/.local/share/solarbg/themes)',
        demandOption: true,
    })
    .option('mode', {
        alias: 'm',
        describe: 'wallpaper type(solar,gnome)',
        choices: ['gnome', 'solar'],
        demandOption: true,
    })
    .option('location', {
        alias: 'l',
        describe: 'your location needed for solar mode(LAT:LON)',
    })
    .check(argv => {
        if (argv.mode === 'solar' && !argv.location) {
            throw new Error('location is required when mode has the value "solar"');
        }
        if (typeof argv.theme != 'string' || (typeof argv.location != 'string' && argv.location)) {
            throw new Error('theme and location arguments must be string');
        }
        console.log(argv.location);
        if (argv.location && (argv.location.split(':').filter(Boolean).length !== 2 || !argv.location.split(':').filter(Boolean).every(number => !isNaN(number) ) )) {
            throw new Error('location must be writed in LAT:LON format');
        }
        return true;
    })
    .argv


let ospath = '';
export let themePath = '';

switch (platform()) {
    case 'linux':
        ospath = '/.local/share/solarbg/themes/';
        break;
    case 'win32':
        ospath = '\\AppData\\Roaming\\solarbg\\themes\\';
        break;
    default:
        console.log('Your os is not supported');

}

if (ospath !== '') {
    themePath = homedir() + ospath + argv.theme;

    if (argv.mode === 'gnome') {
        gnome();
    }
    if (argv.mode === 'solar') {
        solar();
    }

}
