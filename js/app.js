import { loadState, saveState, clearState, downloadJSON, readJSON } from './storage.js';
import { defaultAttractions, parseGeoJSON, filterAttractions } from './attractions.js?v=5';
import { days, blankPlan, normalizePlan, assignedDay, assign, setTime, timeToMinutes, addTravel, setTravelLabel } from './itinerary.js';
import {
  initMap,
  renderMarkers,
  focusPlace,
  setPickMode
} from "./map.js?v=2";
import { firebaseConfig, sharedSync } from './firebase-config.js?v=6';
import { initSharedSync, saveSharedState } from './sync.js?v=6';

const saved = loadState();
const canonicalIds=new Set(defaultAttractions.map(place=>place.id));
const savedCustomPlaces=Array.isArray(saved?.places)?saved.places.filter(place=>!canonicalIds.has(place.id)):[];
let state = { places: [...defaultAttractions,...savedCustomPlaces], hotels: normalizeHotels(saved?.hotels), plan: normalizePlan(saved?.plan), selectedDay: Number(saved?.selectedDay) || 1, city:'All', query:'', mapScope:'all' };
const $ = id => document.getElementById(id);
let toastTimer;
let pickingPlace=false;

function sharedState(){return {places:state.places,hotels:state.hotels,plan:state.plan,selectedDay:state.selectedDay};}
function persist() { const snapshot=sharedState();saveState(snapshot);saveSharedState(snapshot); }
function toast(message) { $('toast').textContent=message; $('toast').classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2500); }
function dayLabel(number) { return `Day ${number}`; }
function normalizeHotels(value){return Array.isArray(value)?value.filter(h=>h&&typeof h.name==='string'&&Number.isFinite(Number(h.lat))&&Number.isFinite(Number(h.lng))).map(h=>{const legacyDay=Math.min(13,Math.max(1,Number(h.day)||1));const startDay=Math.min(13,Math.max(1,Number(h.startDay)||legacyDay));const endDay=Math.min(13,Math.max(startDay,Number(h.endDay)||startDay));const normalized={...h,startDay,endDay,lat:Number(h.lat),lng:Number(h.lng),category:'Overnight stay',city:'Hotel'};delete normalized.day;return normalized;}):[];}
function hotelOnDay(hotel,day){return day>=hotel.startDay&&day<=hotel.endDay;}
function mergePlaces(value){const custom=Array.isArray(value)?value.filter(place=>!canonicalIds.has(place.id)):[];return [...defaultAttractions,...custom];}
function setSyncStatus(status){const labels={local:'Saved in this browser',connecting:'Connecting to shared trip…',connected:'Shared trip · live',error:'Shared sync unavailable'};$('sync-status').textContent=labels[status]||labels.local;$('sync-status').dataset.state=status;}
function applyRemote(remote){if(!remote||!remote.plan)return;state.places=mergePlaces(remote.places);state.hotels=normalizeHotels(remote.hotels);state.plan=normalizePlan(remote.plan);state.selectedDay=Math.min(13,Math.max(1,Number(remote.selectedDay)||1));saveState(sharedState());render();}

function render() {
  const cities=['All',...new Set(state.places.map(p=>p.city))];
  $('city-options').innerHTML=cities.slice(1).map(city=>`<option value="${esc(city)}"></option>`).join('');
  renderHotels();
  $('city-filters').innerHTML=cities.map(c=>`<button class="chip ${c===state.city?'active':''}" data-city="${esc(c)}" type="button">${esc(c)}</button>`).join('');
  const filtered=filterAttractions(state.places,state.query,state.city);
  $('attraction-count').textContent=`${filtered.length} place${filtered.length===1?'':'s'}`;
  $('attraction-list').innerHTML=filtered.length ? filtered.map(placeCard).join('') : '<div class="empty-state"><strong>No matches</strong><p>Try a different search or city.</p></div>';
  $('day-tabs').innerHTML=days.map(d=>`<button type="button" class="day-tab ${d.number===state.selectedDay?'active':''} ${state.plan[d.number].length?'has-stops':''}" data-day="${d.number}"><small>Day</small><strong>${d.number}</strong></button>`).join('');
  const dayHotels=state.hotels.filter(h=>hotelOnDay(h,state.selectedDay));
  $('day-hotels').innerHTML=dayHotels.length?`<div class="day-hotel-label">Hotel${dayHotels.length===1?'':'s'} for Day ${state.selectedDay}</div>${dayHotels.map(h=>`<button type="button" class="day-hotel" data-day-hotel-id="${esc(h.id)}"><span aria-hidden="true">◆</span><strong>${esc(h.name)}</strong><small>Days ${h.startDay}–${h.endDay} · View on map</small></button>`).join('')}`:'';
  const stops=state.plan[state.selectedDay].map(stop=>({ ...stop, place:stop.type==='travel'?null:state.places.find(p=>p.id===stop.id) })).filter(stop=>stop.type==='travel'||stop.place);
  $('day-stops').innerHTML=stops.length?renderCalendar(stops):'';
  $('empty-day').hidden=stops.length>0;
  const mapPlaces=state.mapScope==='day' ? [...stops.filter(stop=>stop.place).map(stop=>stop.place),...dayHotels] : [...filtered,...state.hotels];
  renderMarkers(mapPlaces,id=>state.hotels.find(h=>h.id===id)?.startDay||assignedDay(state.plan,id),p=>p&&focusPlace(p));
  bindDynamic();
}

function renderHotels(){
  $('hotel-count').textContent=`${state.hotels.length} hotel${state.hotels.length===1?'':'s'}`;
  $('hotel-list').innerHTML=state.hotels.length?state.hotels.slice().sort((a,b)=>a.startDay-b.startDay).map(h=>`<article class="hotel-card" data-hotel-id="${esc(h.id)}" tabindex="0" aria-label="View ${esc(h.name)} on map"><div><strong>${esc(h.name)}</strong><span>Days ${h.startDay}–${h.endDay} · ${h.lat.toFixed(4)}, ${h.lng.toFixed(4)}</span></div><button class="icon-button" data-remove-hotel aria-label="Remove ${esc(h.name)}">×</button></article>`).join(''):'<span class="meta">No hotels added yet.</span>';
}

function placeCard(p) {
  const assigned=assignedDay(state.plan,p.id);
  return `<article class="attraction" data-id="${esc(p.id)}"><div class="attraction-top"><div><h3>${esc(p.name)}</h3><div class="meta"><span class="tag">${esc(p.city)}</span><span class="tag">${esc(p.category)}</span>${p.price?`<span class="tag price-tag">${esc(p.price)}</span>`:''}${p.url?`<a class="place-site" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Site ↗</a>`:''}</div></div>${assigned?`<span class="assigned-badge">Day ${assigned}</span>`:''}</div><div class="assign-row"><select aria-label="Day for ${esc(p.name)}"><option value="">Choose day…</option>${days.map(d=>`<option value="${d.number}" ${assigned===d.number?'selected':''}>${dayLabel(d.number)}</option>`).join('')}</select><button type="button" data-action="assign">${assigned?'Move':'Add'}</button>${assigned?'<button type="button" data-action="unassign" aria-label="Remove from itinerary">×</button>':''}</div></article>`;
}

function renderCalendar(stops){
  const hours=Array.from({length:25},(_,i)=>i);
  const sorted=[...stops].sort((a,b)=>timeToMinutes(a.start)-timeToMinutes(b.start));
  return `<div class="calendar"><div class="time-rail">${hours.map(hour=>`<span style="top:${hour*60}px">${String(hour).padStart(2,'0')}:00</span>`).join('')}</div><div class="calendar-grid">${hours.map(hour=>`<i style="top:${hour*60}px"></i>`).join('')}${sorted.map(stop=>stopCard(stop)).join('')}</div></div>`;
}

function stopCard(stop) {
  const start=Math.max(0,timeToMinutes(stop.start)),end=Math.min(24*60,timeToMinutes(stop.end));
  const top=start,height=Math.max(52,end-start);
  const timeFields=`<div class="event-times"><label><span class="sr-only">Start time</span><input class="start-time" type="time" value="${stop.start}" aria-label="Start time"></label><span>–</span><label><span class="sr-only">End time</span><input class="end-time" type="time" value="${stop.end}" aria-label="End time"></label></div>`;
  if(stop.type==='travel') return `<article class="stop calendar-event travel-stop" style="top:${top}px;height:${height}px" data-id="${esc(stop.id)}" data-type="travel"><div class="event-body"><label><span class="sr-only">Travel details</span><input class="travel-title" value="${esc(stop.label)}" maxlength="80" aria-label="Travel details"></label>${timeFields}</div><button class="icon-button" data-remove aria-label="Remove travel">×</button></article>`;
  const p=stop.place;
  return `<article class="stop calendar-event" style="top:${top}px;height:${height}px" data-id="${esc(p.id)}" tabindex="0" aria-label="Zoom to ${esc(p.name)} on map"><div class="event-body"><h3>${esc(p.name)}</h3><small>${esc(p.city)} · ${esc(p.category)}</small>${timeFields}</div><button class="icon-button" data-remove aria-label="Remove stop">×</button></article>`;
}
function esc(v){const e=document.createElement('span');e.textContent=String(v);return e.innerHTML;}

function bindDynamic(){
  document.querySelectorAll('[data-city]').forEach(b=>b.onclick=()=>{state.city=b.dataset.city;render();});
  document.querySelectorAll('.day-tab').forEach(b=>b.onclick=()=>{state.selectedDay=Number(b.dataset.day);persist();render();});
  document.querySelectorAll('.attraction').forEach(card=>{const p=state.places.find(x=>x.id===card.dataset.id);card.querySelector('h3').onclick=()=>focusPlace(p);card.querySelector('[data-action="assign"]').onclick=()=>{const day=Number(card.querySelector('select').value);if(!day)return toast('Choose a day first.');state.plan=assign(state.plan,p.id,day);state.selectedDay=day;persist();render();toast(`${p.name} added to Day ${day}.`);};card.querySelector('[data-action="unassign"]')?.addEventListener('click',()=>{state.plan=assign(state.plan,p.id,null);persist();render();});});
  document.querySelectorAll('.stop').forEach(card=>{
    const isTravel=card.dataset.type==='travel';
    const place=state.places.find(p=>p.id===card.dataset.id);
    const zoom=()=>{focusPlace(place);document.querySelector('.map-panel')?.scrollIntoView({behavior:'smooth',block:'center'});};
    if(!isTravel){card.onclick=event=>{if(!event.target.closest('button,input,label'))zoom();};card.onkeydown=event=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('button,input')){event.preventDefault();zoom();}};}
    const updateTime=()=>{const next=setTime(state.plan,state.selectedDay,card.dataset.id,card.querySelector('.start-time').value,card.querySelector('.end-time').value);if(!next)return toast('End time must be after start time.');state.plan=next;persist();render();};
    card.querySelector('.start-time').onchange=updateTime;card.querySelector('.end-time').onchange=updateTime;
    card.querySelector('.travel-title')?.addEventListener('change',event=>{state.plan=setTravelLabel(state.plan,state.selectedDay,card.dataset.id,event.target.value);persist();render();});
    card.querySelector('[data-remove]').onclick=()=>{state.plan=assign(state.plan,card.dataset.id,null);persist();render();};
  });
  document.querySelectorAll('.hotel-card').forEach(card=>{const hotel=state.hotels.find(h=>h.id===card.dataset.hotelId);card.onclick=event=>{if(!event.target.closest('button'))focusPlace(hotel);};card.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();focusPlace(hotel);}};card.querySelector('[data-remove-hotel]').onclick=()=>{state.hotels=state.hotels.filter(h=>h.id!==hotel.id);persist();render();};});
  document.querySelectorAll('[data-day-hotel-id]').forEach(button=>button.onclick=()=>{const hotel=state.hotels.find(h=>h.id===button.dataset.dayHotelId);if(hotel){focusPlace(hotel);document.querySelector('.map-panel')?.scrollIntoView({behavior:'smooth',block:'center'});}});
}

function mapFailed(){ $('map-fallback').hidden=false; }

window.addEventListener('DOMContentLoaded',()=>{
  const hotelDayOptions=days.map(d=>`<option value="${d.number}">Day ${d.number}</option>`).join('');
  $('hotel-start-day').innerHTML=hotelDayOptions;
  $('hotel-end-day').innerHTML=hotelDayOptions;
  $('hotel-end-day').value='1';
  $('hotel-start-day').onchange=()=>{if(Number($('hotel-end-day').value)<Number($('hotel-start-day').value))$('hotel-end-day').value=$('hotel-start-day').value;};
  const start=()=>{ if(initMap({onSelect:()=>{},onMapClick:point=>{if(!pickingPlace)return;pickingPlace=false;setPickMode(false);$('add-from-map').textContent='Add from map';$('place-lat').value=point.lat;$('place-lng').value=point.lng;$('picked-coordinates').textContent=`${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`;$('place-dialog').showModal();$('place-name').focus();},onError:mapFailed})) render(); else render(); };
  if(window.L) start(); else { let tries=0; const wait=setInterval(()=>{if(window.L){clearInterval(wait);start();}else if(++tries>30){clearInterval(wait);mapFailed();render();}},100); }
  $('search').oninput=e=>{state.query=e.target.value;render();};
  $('add-from-map').onclick=()=>{pickingPlace=!pickingPlace;setPickMode(pickingPlace);$('add-from-map').textContent=pickingPlace?'Cancel map click':'Add from map';toast(pickingPlace?'Click the map where the attraction is located.':'Map selection cancelled.');};
  document.querySelectorAll('[data-close-dialog]').forEach(button=>button.onclick=()=>{$('place-dialog').close();});
  $('place-form').onsubmit=e=>{e.preventDefault();const name=$('place-name').value.trim(),city=$('place-city').value.trim(),category=$('place-category').value.trim(),lat=Number($('place-lat').value),lng=Number($('place-lng').value);if(!name||!city||!category||!Number.isFinite(lat)||!Number.isFinite(lng))return;const place={id:`manual-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name,city,category,lat,lng,source:'manual'};state.places.push(place);state.city='All';state.query='';$('search').value='';persist();$('place-dialog').close();e.target.reset();render();focusPlace(place);toast(`${name} added.`);};
  $('travel-form').onsubmit=e=>{e.preventDefault();const label=$('travel-label').value.trim();if(!label)return;const next=addTravel(state.plan,state.selectedDay,label,$('travel-start').value,$('travel-end').value);if(!next)return toast('Travel end time must be after its start time.');state.plan=next;$('travel-label').value='';persist();render();toast(`Travel added to Day ${state.selectedDay}.`);};
  $('hotel-form').onsubmit=e=>{e.preventDefault();const name=$('hotel-name').value.trim(),lat=Number($('hotel-lat').value),lng=Number($('hotel-lng').value),startDay=Number($('hotel-start-day').value),endDay=Number($('hotel-end-day').value);if(!name||!Number.isFinite(lat)||!Number.isFinite(lng))return toast('Enter a hotel name and valid coordinates.');if(endDay<startDay)return toast('The last day must be the same as or after the first day.');state.hotels.push({id:`hotel-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name,startDay,endDay,lat,lng,category:'Overnight stay',city:'Hotel'});e.target.reset();$('hotel-start-day').value=String(startDay);$('hotel-end-day').value=String(endDay);persist();render();toast(`${name} added for Days ${startDay}–${endDay}.`);};
  document.querySelectorAll('[name="map-scope"]').forEach(r=>r.onchange=()=>{state.mapScope=r.value;render();});
  $('clear-day').onclick=()=>{if(!state.plan[state.selectedDay].length)return; if(confirm(`Clear all stops from Day ${state.selectedDay}?`)){state.plan[state.selectedDay]=[];persist();render();}};
  $('geojson-input').onchange=async e=>{try{const parsed=parseGeoJSON(JSON.parse(await e.target.files[0].text()));const existing=new Set(state.places.map(p=>p.id));state.places=[...state.places.filter(p=>!parsed.places.some(n=>n.id===p.id)),...parsed.places];persist();render();toast(`Imported ${parsed.places.length} place${parsed.places.length===1?'':'s'}${parsed.skipped.length?`; skipped ${parsed.skipped.length}`:''}.`);}catch(err){toast(err.message||'Could not import that GeoJSON.');}e.target.value='';};
  $('export-json').onclick=()=>downloadJSON({places:state.places,hotels:state.hotels,plan:state.plan,selectedDay:state.selectedDay});
  $('import-json').onchange=async e=>{try{const data=await readJSON(e.target.files[0]);if(!Array.isArray(data.places)||!data.plan)throw new Error('This is not a planner backup.');state.places=data.places;state.hotels=normalizeHotels(data.hotels);state.plan=normalizePlan(data.plan);state.selectedDay=Math.min(13,Math.max(1,Number(data.selectedDay)||1));persist();render();toast('Plan restored.');}catch(err){toast(err.message||'Could not restore that file.');}e.target.value='';};
  $('reset-plan').onclick=()=>{if(confirm('Reset the itinerary and remove imported places and hotels?')){clearState();state={...state,places:defaultAttractions,hotels:[],plan:blankPlan(),selectedDay:1,city:'All',query:''};$('search').value='';persist();render();toast('Planner reset.');}};
  initSharedSync(firebaseConfig,sharedSync,{onRemote:applyRemote,onMissing:()=>saveSharedState(sharedState(),{immediate:true}),onStatus:setSyncStatus});
});
