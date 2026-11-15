export const days = ['Tokyo','Tokyo','Tokyo','Tokyo','Kyoto','Kyoto','Kyoto','Kyoto','Osaka','Osaka','Osaka','Tokyo','Tokyo']
  .map((base,i)=>({ number:i+1, base }));

export function blankPlan() { return Object.fromEntries(days.map(d => [d.number, []])); }

export function normalizePlan(value) {
  const plan = blankPlan();
  if (!value || typeof value !== 'object') return plan;
  for (const d of days) {
    if (!Array.isArray(value[d.number])) continue;
    let cursor=9*60;
    plan[d.number]=value[d.number].flatMap(item=>{
      if (typeof item==='string') item={ type:'place', id:item, duration:60 };
      if (!item || typeof item.id!=='string') return [];
      const duration=validDuration(item.duration), supplied=validRange(item.start,item.end);
      const start=supplied ? item.start : minutesToTime(cursor);
      const end=supplied ? item.end : minutesToTime(Math.min(cursor+duration,23*60+59));
      cursor=Math.max(cursor,timeToMinutes(end));
      if(item.type==='travel') return [{ type:'travel',id:item.id,label:String(item.label||'Travel'),start,end }];
      return [{ type:'place',id:item.id,start,end }];
    });
  }
  return plan;
}

export function assignedDay(plan,id){return days.find(d=>plan[d.number]?.some(stop=>stop.type!=='travel'&&stop.id===id))?.number||null;}

export function assign(plan,id,day){
  const next=structuredClone(plan);let previous;
  for(const d of days){previous||=next[d.number].find(item=>item.id===id);next[d.number]=next[d.number].filter(item=>item.id!==id);}
  if(day){const range=nextAvailableRange(next[day]);next[day].push(previous||{type:'place',id,...range});}
  return next;
}

export function addTravel(plan,day,label,start,end){
  if(!validRange(start,end)) return null;
  const next=structuredClone(plan);
  next[day].push({type:'travel',id:`travel-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,label:String(label).trim(),start,end});
  return next;
}

export function setTravelLabel(plan,day,id,label){const next=structuredClone(plan),stop=next[day].find(item=>item.id===id&&item.type==='travel');if(stop&&String(label).trim())stop.label=String(label).trim();return next;}

export function setTime(plan,day,id,start,end){
  if(!validRange(start,end)) return null;
  const next=structuredClone(plan),stop=next[day].find(item=>item.id===id);
  if(stop){stop.start=start;stop.end=end;}
  return next;
}

export function timeToMinutes(value){const match=/^(\d{2}):(\d{2})$/.exec(String(value));return match?Number(match[1])*60+Number(match[2]):0;}
export function validRange(start,end){return /^\d{2}:\d{2}$/.test(String(start))&&/^\d{2}:\d{2}$/.test(String(end))&&timeToMinutes(end)>timeToMinutes(start);}

function nextAvailableRange(items){
  const latest=items.reduce((max,item)=>Math.max(max,timeToMinutes(item.end)),9*60);
  const start=Math.min(Math.ceil(latest/15)*15,22*60),end=Math.min(start+60,23*60+59);
  return {start:minutesToTime(start),end:minutesToTime(end)};
}
function minutesToTime(value){const minutes=Math.max(0,Math.min(value,23*60+59));return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;}
function validDuration(value){const n=Number(value);return Number.isFinite(n)&&n>=15?Math.round(n):60;}
