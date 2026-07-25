# Trip Palette 🧳

Type in a destination and your dates. Get back the weather (even months out), a color palette lifted from the landscape, and a packing list with real quantities.

Built with Claude by [@cindiezhu](https://instagram.com/cindiezhu).

## Run it (2 minutes)

You need Node.js 20+ (if you don't have it, ask Claude: "check if Node is installed and install it if not").

```
npm install
npm run dev
```

Open the local URL it prints. That's it, no API keys needed: weather and geocoding come from Open-Meteo (free, no key) and photos come from Wikimedia Commons (free, no key).

## Put it online

```
npx vercel
```

Create a free account at vercel.com first. The CLI will open a browser to log you in, then deploy. Note: `vite.config.js` currently builds to `../trip-palette` with base `/trip-palette/` (my site setup). For your own deploy, change it to the standard `outDir: 'dist'` and `base: '/'`, or just ask Claude to do it.

## Make it yours

Open this folder in Claude Code (or the Code tab in Claude Desktop) and ask for upgrades. Ideas:

- **Closet mode:** drop photos of clothes you own into a folder and have the packing list reference your actual wardrobe
- **Palette card:** a share button that renders a boarding-pass style image for Instagram stories
- **Carry-on mode:** a toggle that trims the list to carry-on limits

The design trick if you restyle it: don't say "make it pretty". Screenshot a design you love, hand it to Claude, and say exactly what to take from it. Iterate with KEEP / FIX / CUT.

## How the smart parts work

- **Weather months ahead:** forecasts only cover ~16 days, so for further trips it pulls the same dates last year from Open-Meteo's archive and labels it "typical weather for these dates"
- **Quantities:** the 5-4-3-2-1 packing method, ~3 tops per bottom, capped at 7 days of clothes + laundry
- **Layers:** temperature bands mapped to the outdoor three-layer system
- **Color notes:** complement the landscape, don't camouflage into it (2 neutrals + 1 accent from the opposite side of the color wheel)

Not affiliated with any brand. Photos remain the property of their Wikimedia Commons contributors (credited in-app).
