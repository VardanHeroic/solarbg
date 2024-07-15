#!/usr/bin/env -S node --no-warnings

import { homedir, platform } from 'os';
import solar from './src/solar.js';
import gnome from './src/gnome.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'

const isLinux = platform() === 'linux'
export let themePath:string;
export const argv = yargs(hideBin(process.argv))
    .wrap(120)
    .option('verbose', {
        type: 'boolean',
        default: false,
        describe: 'enable verbose logging',
    })
    .option('theme', {
        alias: 't',
        describe: 'theme folder name(theme path is ~/.local/share/solarbg/themes)',
        type: 'string',
        demandOption: true,
    })
    .option('mode', {
        alias: 'm',
        describe: 'wallpaper type(solar,gnome)',
        choices: isLinux ? ['gnome', 'solar'] : [],
        type: 'string',
        demandOption: isLinux,
        hidden: !isLinux,
    })
    .option('location', {
        alias: 'l',
        default: '',
        type: 'string',
        demandOption: !isLinux,
        describe: 'your location needed for solar mode(LAT:LON)',
    })
    .check(argv => {
        argv.mode = isLinux ? argv.mode : 'solar'
        if (argv.mode === 'solar' && !argv.location) {
            throw new Error('location is required when mode has the value "solar"');
        }
        if (typeof argv.theme != 'string' || (typeof argv.location != 'string' && argv.location)) {
            throw new Error('theme and location arguments must be string');
        }
        if (argv.location && (argv.location.split(':').filter(Boolean).length !== 2 || !argv.location.split(':').filter(Boolean).every((cord:string) => +cord+1))) {
            throw new Error('location must be writed in LAT:LON format');
        }
        return true;
    })
    .parseSync()

try {
    switch (platform()) {
        case 'linux':
            themePath = homedir() + '/.local/share/solarbg/themes/' + argv.theme;
            break;
        case 'win32':
            themePath = homedir() + '\\AppData\\Roaming\\solarbg\\themes\\' + argv.theme;
            break;
        default:
            throw new Error('Your os is not supported')
    }
    switch (argv.mode) {
        case 'gnome':
            await gnome()
            break;
        case 'solar':
            await solar()
            break
    }

}
catch (error:any) {
    console.error("Error: " + error.message)
}
