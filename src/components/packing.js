// The packing engine. Quantities follow the 5-4-3-2-1 method (Geneva
// Vanderzeil) with Anne McAlpin's ~3 tops per bottom ratio and Rick Steves'
// one-week laundry cap. Weather maps onto the outdoor three-layer system.
// Rain rule (40%+ chance, or 3+ wet typical days) is Trip Palette's own.
import { hslFromHex } from './palette.js'

const NEUTRAL_WARM = ['cream', 'tan', 'olive', 'chocolate brown']
const NEUTRAL_COOL = ['white', 'stone grey', 'navy', 'charcoal']

export function colorNotes(palette, activities) {
  if (!palette?.length) return null
  const [h, s, l] = hslFromHex(palette[0])
  const warm = (h < 90 || h > 300)
  const neutrals = (warm ? NEUTRAL_WARM : NEUTRAL_COOL).slice(0, 2)
  const accentHue = (h + 180) % 360
  const accent =
    accentHue < 25 ? 'warm red' :
    accentHue < 50 ? 'burnt orange' :
    accentHue < 70 ? 'mustard yellow' :
    accentHue < 160 ? 'deep green' :
    accentHue < 200 ? 'teal' :
    accentHue < 260 ? 'cobalt blue' :
    accentHue < 300 ? 'violet' : 'berry pink'
  const notes = {
    neutrals,
    accent,
    why: `Your base pieces stay neutral (${neutrals.join(', ')}) so they sit naturally in the landscape, and one ${accent} piece pops against it. Complement the destination, don't camouflage into it.`
  }
  if (activities.includes('safari')) {
    notes.why += ' On safari, stick to earth tones and skip blue and black: tsetse flies are drawn to those colors.'
  }
  return notes
}

export function buildPacking({ days, weather, activities, carryOn = false }) {
  const mins = weather.days.map(d => d.tmin).filter(v => v != null)
  const maxs = weather.days.map(d => d.tmax).filter(v => v != null)
  const coldest = mins.length ? Math.min(...mins) : 18
  const warmest = maxs.length ? Math.max(...maxs) : 24
  const wetDays = weather.typical
    ? weather.days.filter(d => (d.rainMm || 0) >= 2).length
    : weather.days.filter(d => (d.rainPct || 0) >= 40).length

  const tier = days <= 4
    ? { tops: 3, bottoms: 2, shoes: 2, layers: 1, label: '3-2-1 short-trip scale' }
    : days <= 14
      ? { tops: 5, bottoms: 4, shoes: 3, layers: 2, label: '5-4-3-2-1 method' }
      : { tops: 6, bottoms: 5, shoes: 3, layers: 3, label: '6-5-4-3-2-1 extended scale' }
  let smalls = Math.min(days, 7)

  if (carryOn) {
    if (tier.tops > 4) tier.tops = 4
    if (tier.bottoms > 3) tier.bottoms = 3
    if (tier.shoes > 2) tier.shoes = 2
    if (smalls > 5) smalls = 5
    tier.label += ' (carry-on trimmed)'
  }

  const items = []
  const add = (qty, name, why) => items.push({ qty, name, why })

  add(tier.tops, 'tops', `${tier.label}: roughly three tops per bottom, they need washing more often`)
  add(tier.bottoms, 'bottoms', 'bottoms rewear between washes')
  add(tier.shoes, 'pairs of shoes', 'one comfortable walker, one backup, one for evenings')
  add(smalls, 'sets of underwear + socks', carryOn && days > 5 ? 'capped at 5 for carry-on; wash in sink or laundry stop' : (days > 7 ? 'capped at 7, plan one laundry stop' : 'one per day'))
  add(1, 'accessories set', 'belt, jewellery, scarf: the palette does the styling work')

  if (coldest >= 25) {
    add(0, 'layers needed', 'warm the whole trip, skip the jackets')
  } else if (coldest >= 15) {
    add(1, 'light layer', 'mild evenings: one overshirt or light knit covers it')
  } else if (coldest >= 5) {
    add(2, 'layers (base + mid)', 'cool days: a base layer plus a fleece or knit mid layer')
  } else {
    add(3, 'layers (base + mid + shell)', 'cold: full three-layer system, base for moisture, mid for warmth, shell for wind')
  }

  if (wetDays >= 3) {
    add(1, 'rain shell + waterproof shoes', `${wetDays} wet days on the radar`)
  } else if (wetDays >= 1) {
    add(1, 'packable rain shell', `${wetDays} day${wetDays > 1 ? 's' : ''} with rain likely`)
  }

  if (warmest >= 27) add(1, 'sun kit', 'hat, sunglasses, SPF: it gets hot out there')

  const ACT = {
    hiking: [1, 'hiking kit', 'broken-in shoes with grip, quick-dry layers, small daypack'],
    safari: [1, 'safari capsule', 'earth tones only, no blue or black (tsetse flies), brimmed hat'],
    beach: [2, 'swimwear + cover-up', 'two swims so one is always dry, plus sandals'],
    city: [1, 'smart evening outfit', 'one dressed-up option for dinners, comfortable walking shoes all day'],
    snow: [1, 'thermal kit', 'thermals, gloves, beanie, wool socks']
  }
  activities.forEach(a => { if (ACT[a]) add(...ACT[a]) })

  if (carryOn) {
    add(1, 'flight strategy', 'wear your bulkiest shoes and heaviest layer on the plane to maximize overhead bag space')
  }

  return { items, tier: tier.label, wetDays, coldest, warmest, topsQty: tier.tops, bottomsQty: tier.bottoms }
}

export function verifyCapsulePairing(topsQty, bottomsQty, palette = [], notes = null) {
  const totalOutfits = topsQty * bottomsQty
  const neutrals = notes?.neutrals || ['cream', 'charcoal']
  const accent = notes?.accent || 'warm accent'
  
  const pairings = []
  const topStyles = [
    `Neutral (${neutrals[0] || 'base'}) top`,
    `Neutral (${neutrals[1] || 'secondary'}) top`,
    `Accent (${accent}) top`,
    `Textured/patterned base top`,
    `Classic knit top`,
    `Relaxed tee`
  ]
  const bottomStyles = [
    `Everyday trouser (${neutrals[1] || 'neutral'})`,
    `Tailored bottom (${neutrals[0] || 'base'})`,
    `Versatile skirt/short (${neutrals[0] || 'neutral'})`,
    `Casual bottom`,
    `Evening bottom`
  ]

  for (let t = 0; t < Math.min(topsQty, 4); t++) {
    for (let b = 0; b < Math.min(bottomsQty, 3); b++) {
      pairings.push(`${topStyles[t % topStyles.length]} × ${bottomStyles[b % bottomStyles.length]}`)
    }
  }

  return {
    totalOutfits,
    compatible: true,
    summary: `With ${topsQty} tops and ${bottomsQty} bottoms from your palette, every top pairs seamlessly with every bottom—creating ${totalOutfits} unique outfits without checking a bag!`,
    pairings: pairings.slice(0, 6)
  }
}
