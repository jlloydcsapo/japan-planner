const attractionDetails = {
  'tokyo-disneysea':{price:'$62.88',url:'https://www.tokyodisneyresort.jp/en/ticket/index.html?park=tds'},
  'tokyo-disneyland':{price:'$62.88',url:'https://www.tokyodisneyresort.jp/en/ticket/index.html'},
  'tokyo-imperial-palace':{price:'Free',url:'https://sankan.kunaicho.go.jp/english/guide/koukyo.html'},
  'senso-ji-temple':{price:'Free',url:'https://www.senso-ji.jp/english/'},
  'shibuya-crossing':{price:'Free',url:'https://www.japan.travel/en/spot/2177/'},
  'asakusa':{price:'Free',url:'https://www.japan-guide.com/e/e3004.html'},
  'harajuku':{price:'Free',url:'https://www.japan-guide.com/e/e3006.html'},
  'nijubashi-bridge':{price:'Free',url:'https://visit-chiyoda.tokyo/app/en/spot/detail/242'},
  'akihabara':{price:'Free'},'tokyo-national-museum':{price:'$6.37 / Free',url:'https://www.tnm.jp/?lang=en'},
  'ueno-park':{price:'Free',url:'https://www.japan-guide.com/e/e3019.html'},'ginza':{price:'Free'},
  'art-aquarium-museum-ginza':{price:'$15',url:'https://ticket.artaquarium.jp/en/'},
  'aries-shibuya-station-east-exit':{name:'Aries Shibuya Higashi',price:'$12',url:'https://www.instagram.com/explore/?hl=en#'},
  'ghibli-museum':{name:'Studio Ghibli Museum',price:'$6.31',url:'https://www.ghibli-museum.jp/en/tickets/'},
  'teamlab-planets-tokyo':{name:'teamLab Planets',price:'$22.72',url:'https://www.teamlab.art/e/planets/'},
  'zen-chopstick-making-workshop':{name:'Chopstick-Making Class',price:'$6',url:'https://www.viator.com/tours/Tokyo/Tokyo-Shinjuku-Chopsticks-Making-Experience-Workshop/d334-465886P35'},
  'kinkaku-ji-golden-pavilion':{name:'Golden Pavilion',price:'$3.16',url:'https://www.shokoku-ji.jp/en/kinkakuji/gallery/'},
  'gion':{price:'Free',url:'https://www.japan-guide.com/e/e3902.html'},
  'arashiyama-bamboo-grove':{name:'Bamboo Forest',price:'Free',url:'https://www.japan.travel/en/spot/1141/'},
  'ryoan-ji-temple':{price:'$3.79',url:'https://www.japan-guide.com/e/e3909.html'},
  'kodai-ji-temple':{name:'Kōdai-ji',price:'$5.05',url:'https://www.japan-guide.com/e/e3927.html'},
  'yasaka-pagoda-hokan-ji':{name:'Yasaka Pagoda',price:'Free',url:'https://kyoto.travel/en/destinations/hokanji-templeyasaka-pagoda/'},
  'yasaka-shrine':{price:'Free',url:'https://www.japan-guide.com/e/e3903.html'},
  'fushimi-inari-taisha':{price:'Free',url:'https://www.japan-guide.com/e/e3915.html'},
  'kiyomizu-dera':{price:'$3.69',url:'https://www.kiyomizudera.or.jp/en/news/2026/jojuin_autumn2026.php'},
  'arashiyama-scenic-train-hozugawa-river-cruise-tour':{name:'All-Day River Cruise Tour',city:'Kyoto',price:'$122.63',url:'https://www.viator.com/tours/Osaka/Kyoto-Day-Tour-Arashiyama-Scenic-Train-and-Hozugawa-River-Cruise/d333-5489818P66'},
  'osaka-castle':{price:'$7.57',url:'https://osakacastle.org/entrance-fee/'},
  'osaka-aquarium-kaiyukan':{name:'Osaka Aquarium',price:'$18.00',url:'https://en-61698.site-translation.com/info/ticket/kaiyukan/'},
  'dotonbori':{name:'Dotonbori',price:'Free',url:'https://www.japan.travel/en/spot/2207/'},
  'hakone-open-air-museum':{price:'$11.49',url:'https://www.hakone-oam.or.jp/en/'},
  'hakone-ropeway':{price:'$18.93',url:'https://www.japan-guide.com/e/e5223.html'},
  'lake-ashi-torii-of-peace':{name:'Red Torii Gates / Lake Ashi',price:'Free',url:'https://www.japan-guide.com/e/e5204.html'}
};

export const defaultAttractions = [
  ['tokyo-disneysea','Tokyo DisneySea','Tokyo','Theme park',35.62667,139.88806],['tokyo-disneyland','Tokyo Disneyland','Tokyo','Theme park',35.632659,139.881417],['tokyo-imperial-palace','Tokyo Imperial Palace','Tokyo','Landmark',35.6824,139.7527],['senso-ji-temple','Sensō-ji Temple','Tokyo','Temple',35.71472,139.79675],['shibuya-crossing','Shibuya Crossing','Tokyo','Landmark',35.65948,139.70055],['asakusa','Asakusa','Tokyo','Neighborhood',35.7111,139.79636],['harajuku','Harajuku','Tokyo','Neighborhood',35.67117,139.70338],['nijubashi-bridge','Nijūbashi Bridge','Tokyo','Landmark',35.68,139.75333],['akihabara','Akihabara','Tokyo','Neighborhood',35.69825,139.77194],['tokyo-national-museum','Tokyo National Museum','Tokyo','Museum',35.71884,139.77652],['ueno-park','Ueno Park','Tokyo','Park',35.71475,139.77343],['ginza','Ginza','Tokyo','Neighborhood',35.67171,139.76517],['art-aquarium-museum-ginza','Art Aquarium Museum GINZA','Tokyo','Museum',35.67136,139.76573],['aries-shibuya-station-east-exit','Aries Shibuya Station East Exit','Tokyo','Salon',35.65772,139.7025],['ghibli-museum','Ghibli Museum','Tokyo','Museum',35.69623,139.57043],['teamlab-planets-tokyo','teamLab Planets TOKYO','Tokyo','Museum',35.64938,139.78973],['zen-chopstick-making-workshop','ZEN Chopstick-Making Workshop','Tokyo','Workshop',35.6959851,139.6984167],
  ['kinkaku-ji-golden-pavilion','Kinkaku-ji (Golden Pavilion)','Kyoto','Temple',35.0394028,135.7293639],['gion','Gion','Kyoto','Neighborhood',35.003496,135.775051],['arashiyama-bamboo-grove','Arashiyama Bamboo Grove','Kyoto','Walk',35.017923,135.674625],['ryoan-ji-temple','Ryōan-ji Temple','Kyoto','Temple',35.0333862,135.71869517],['kodai-ji-temple','Kōdai-ji Temple','Kyoto','Temple',35.0007611,135.7811139],['yasaka-pagoda-hokan-ji','Yasaka Pagoda (Hōkan-ji)','Kyoto','Temple',34.99855,135.77925],['yasaka-shrine','Yasaka Shrine','Kyoto','Shrine',35.00361,135.77861],['fushimi-inari-taisha','Fushimi Inari Taisha','Kyoto','Shrine',34.96704,135.77465],['kiyomizu-dera','Kiyomizu-dera','Kyoto','Temple',34.995,135.785],
  ['arashiyama-scenic-train-hozugawa-river-cruise-tour','Arashiyama Scenic Train & Hozugawa River Cruise Tour','Osaka','Tour',34.6673,135.5044],['osaka-castle','Osaka Castle','Osaka','Castle',34.68732,135.5262],['osaka-aquarium-kaiyukan','Osaka Aquarium Kaiyukan','Osaka','Aquarium',34.654472,135.428889],['dotonbori','Dōtonbori','Osaka','Neighborhood',34.66906,135.5013],
  ['hakone-open-air-museum','Hakone Open-Air Museum','Hakone','Museum',35.24472,139.05151],['hakone-ropeway','Hakone Ropeway','Hakone','Scenic transit',35.2412,139.0347],['lake-ashi-torii-of-peace','Lake Ashi Torii of Peace','Hakone','Shrine',35.202825,139.025733]
].map(([id,name,city,category,lat,lng]) => ({ id,name,city,category,lat,lng,source:'provided',...attractionDetails[id] }));

export function parseGeoJSON(data) {
  if (!data || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) throw new Error('Choose a GeoJSON FeatureCollection.');
  const skipped = [];
  const places = data.features.flatMap((feature, index) => {
    if (feature?.geometry?.type !== 'Point' || !Array.isArray(feature.geometry.coordinates)) { skipped.push(index + 1); return []; }
    const [lng, lat] = feature.geometry.coordinates.map(Number);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) { skipped.push(index + 1); return []; }
    const p = feature.properties || {};
    return [{ id: p.id || `imported-${Date.now()}-${index}`, name: p.name || `Imported place ${index + 1}`, city: p.city || 'Other', category: p.category || 'Imported', price:p.price || '', url:p.url || '', notes:p.notes || '', lat, lng, source:'imported' }];
  });
  if (!places.length) throw new Error('No valid Point features were found.');
  return { places, skipped };
}

export function filterAttractions(places, query, city) {
  const q = query.trim().toLocaleLowerCase();
  return places.filter(p => (city === 'All' || p.city === city) && (!q || `${p.name} ${p.city} ${p.category}`.toLocaleLowerCase().includes(q)));
}
