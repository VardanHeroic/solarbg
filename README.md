# solarbg

Wallpaper changer utility which can change wallpaper by sun's altitude, and only on linux set gnome dynamic wallpapers(without smooth transitions). Available in AUR

 1. [Installation](#installation)
 2. [Usage](#usage)
 3. [Theme creation](#creating-solar-themes)

## Installation
If you are using Arch-based system you can install it from AUR

    yay -S solarbg
Else you can install it via npm

    npm i -g solarbg
 

## Usage
Usage on Linux

	solarbg [-m | --mode] [-t | --theme] [-l | --location]
Usage on Windows(mode is always solar)

	solarbg [-t | --theme] [-l | --location]

#### Put your themes at 
Linux: `~/.local/share/solarbg/themes/`  
Windows:`C:\Users\(username)\AppData\Roaming\solarbg\themes\`  


## Examples
Setting solar theme "Desert" and setting your latitude 40 and longitude 45.

	solarbg --mode solar --location 40:45 --theme Desert 
Setting gnome dynamic wallpaper  "Desert"

	solarbg --mode gnome --theme Desert

## Creating solar themes
1. Create a directory with your theme name in [theme directory](#put-your-themes-at).
2. Put all your wallpaper there.
3. Create `theme.json` file in your theme directory
4. Here's expamle of theme.json:  
```
[
        {
                "path": "0.png",
                "start": -90,
                "end": -5
        },
        {
                "path": "1.png",
                "start": -5,
                "end": 20
        },
        {
                "path": "2.png",
                "start": 20,
                "end": 40
        },
        {
                "path": "3.png",
                "start": 40,
                "end": 90
        },
        {
                "path": "3.png",
                "start": 90,
                "end": 20
        },
        {
                "path": "4.png",
                "start": 20,
                "end": -5
        },
        {
                "path": "0.png",
                "start": -5,
                "end": -90
        }
]
```  
Where "path" is name of image file in the theme folder, "start" is sun's altitude when image is sets as wallpaper and "end" is sun's altitude when image stops to be wallpaper.

Just in case:  
-90 altitude is absolute midnight.  
from -12 to -6 is nautical twilight  
from -6 to 0 is civil twilight  
0 is sunrise or sunset  
90 altitude is absolute noon  


