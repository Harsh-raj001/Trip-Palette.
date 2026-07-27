// All data sources are free and need no API key.

export async function searchCities(q) {
  if (!q || q.trim().length < 2) return []
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=6&language=en&format=json`
  const j = await (await fetch(url)).json()
  return (j.results || []).map(c => ({
    name: c.name,
    country: c.country || '',
    admin: c.admin1 || '',
    lat: c.latitude,
    lon: c.longitude
  }))
}

const DAY_MS = 86400000
const dstr = d => d.toISOString().slice(0, 10)

// Forecast covers ~16 days out. Beyond that we show the same dates last
// year from the archive API, labelled "typical weather for these dates".
export async function getWeather(lat, lon, start, end) {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0)
  const s = new Date(start + 'T00:00:00Z')
  const e = new Date(end + 'T00:00:00Z')
  const lastDayOut = Math.round((e - today) / DAY_MS)
  const firstDayOut = Math.round((s - today) / DAY_MS)

  if (firstDayOut >= 0 && lastDayOut <= 15) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&start_date=${start}&end_date=${end}`
    const j = await (await fetch(url)).json()
    if (!j.daily) throw new Error('no forecast data')
    return {
      typical: false,
      days: j.daily.time.map((t, i) => ({
        date: t,
        tmax: j.daily.temperature_2m_max[i],
        tmin: j.daily.temperature_2m_min[i],
        rainPct: j.daily.precipitation_probability_max[i]
      }))
    }
  }

  const shift = d => { const x = new Date(d); x.setUTCFullYear(x.getUTCFullYear() - 1); return dstr(x) }
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&start_date=${shift(s)}&end_date=${shift(e)}`
  const j = await (await fetch(url)).json()
  if (!j.daily) throw new Error('no archive data')
  return {
    typical: true,
    days: j.daily.time.map((t, i) => ({
      date: t,
      tmax: j.daily.temperature_2m_max[i],
      tmin: j.daily.temperature_2m_min[i],
      rainMm: j.daily.precipitation_sum[i]
    }))
  }
}

const BAD_IMG = /\b(map|flag|coat|locator|logo|icon|seal|emblem|banner|montage|collage|chart|diagram)\b/i
const stripHtml = s => (s || '').replace(/<[^>]*>/g, '').trim()

// Destination photos from the place's Wikipedia article (iconic, CORS-friendly,
// hotlink-permitted). Falls back to a Wikimedia Commons search.
export async function getPhotos(place) {
  const fromArticle = await wikipediaArticlePhotos(place)
  if (fromArticle.length >= 3) return fromArticle.slice(0, 3)
  const fromCommons = await commonsSearchPhotos(place)
  const seen = new Set(fromArticle.map(p => p.url))
  return fromArticle.concat(fromCommons.filter(p => !seen.has(p.url))).slice(0, 3)
}

async function wikipediaArticlePhotos(place) {
  try {
    const su = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(place)}&limit=1&namespace=0&format=json&origin=*`
    const sj = await (await fetch(su)).json()
    const title = sj?.[1]?.[0]
    if (!title) return []
    const mu = `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title)}`
    const mj = await (await fetch(mu)).json()
    return (mj.items || [])
      .filter(it => it.type === 'image' && it.srcset?.length)
      .filter(it => !BAD_IMG.test(it.title || '') && /\.jpe?g$/i.test(it.title || ''))
      .map(it => {
        let url = it.srcset[it.srcset.length - 1].src
        if (url.startsWith('//')) url = 'https:' + url
        url = url.replace(/\/(\d+)px-/, m => {
          const w = parseInt(m.match(/\d+/)[0], 10)
          return w < 1000 ? '/1200px-' : m
        })
        return { url, credit: 'Wikimedia Commons', page: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}` }
      })
      .slice(0, 6)
  } catch { return [] }
}

async function commonsSearchPhotos(place) {
  try {
    const u = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(place)}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1200&format=json&origin=*`
    const j = await (await fetch(u)).json()
    return Object.values(j.query?.pages || {})
      .map(p => ({ info: p.imageinfo?.[0], title: p.title || '' }))
      .filter(p => !BAD_IMG.test(p.title) && /\.jpe?g$/i.test(p.title))
      .map(p => ({
        url: p.info.url,
        credit: stripHtml(p.info.extmetadata?.Artist?.value) || 'Wikimedia Commons',
        page: p.info.descriptionurl || ''
      }))
  } catch { return [] }
}

export async function fetchAttractions(lat, lon) {
  const query = `
    [out:json];
    (
      node["tourism"="museum"](around:5000,${lat},${lon});
      node["tourism"="attraction"](around:5000,${lat},${lon});
      node["historic"="monument"](around:5000,${lat},${lon});
    );
    out tags 10;
  `;
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });
    const data = await res.json();
    if (!data.elements || data.elements.length === 0) return [];
    
    const unique = [];
    const seen = new Set();
    for (const e of data.elements) {
      if (e.tags && e.tags.name && !seen.has(e.tags.name)) {
        seen.add(e.tags.name);
        unique.push({
          name: e.tags.name,
          type: (e.tags.tourism || e.tags.historic || 'attraction').replace('_', ' ')
        });
        if (unique.length === 3) break;
      }
    }
    return unique;
  } catch(e) {
    return [];
  }
}
