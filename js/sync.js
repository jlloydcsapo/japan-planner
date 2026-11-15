let sharedDocument=null;
let writeDocument=null;
let serverTime=null;
let syncReady=false;
let pendingWrite;

export async function initSharedSync(config,syncOptions,{onRemote,onMissing,onStatus}) {
  if(!syncOptions?.enabled||!config?.apiKey||!config?.projectId){onStatus?.('local');return false;}
  try{
    onStatus?.('connecting');
    const [{initializeApp},{getFirestore,doc,onSnapshot,setDoc,serverTimestamp}]=await Promise.all([
      import('https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js')
    ]);
    const database=getFirestore(initializeApp(config));
    sharedDocument=doc(database,syncOptions.collection||'sharedItineraries',syncOptions.documentId||'japan-trip');
    writeDocument=setDoc;
    serverTime=serverTimestamp;
    onSnapshot(sharedDocument,snapshot=>{
      syncReady=true;
      if(snapshot.exists()&&snapshot.data()?.state) onRemote?.(snapshot.data().state);
      else onMissing?.();
      onStatus?.('connected');
    },error=>{console.error('Shared sync error:',error);onStatus?.('error');});
    return true;
  }catch(error){console.error('Firebase setup error:',error);onStatus?.('error');return false;}
}

export function saveSharedState(state,{immediate=false}={}) {
  if(!syncReady||!sharedDocument||!writeDocument)return;
  clearTimeout(pendingWrite);
  const write=()=>writeDocument(sharedDocument,{state,updatedAt:serverTime()});
  if(immediate)write().catch(error=>console.error('Shared save error:',error));
  else pendingWrite=setTimeout(()=>write().catch(error=>console.error('Shared save error:',error)),500);
}
