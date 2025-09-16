const SYN = {
  vomiting: ["vomit","throwing up","puke","emesis"],
  diarrhea: ["runs","loose stool"],
  "loss of appetite": ["not eating","won't eat","reduced appetite","anorexia"],
  lethargy: ["tired","low energy","weak","sleepy"],
  dehydration: ["dry gums","sunken eyes","sticky gums"],
  "abdominal pain": ["belly pain","tummy pain","abdomen tender","hunched posture"],
  limping: ["hobbling","favoring leg","won't bear weight"],
  "pain on touch": ["tender","sore to touch","yelps on touch"],
  swelling: ["inflamed","puffy"],
  "reduced activity": ["less active","doesn't want to play","reluctant to move"]
};

function norm(s){ return (s||"").toLowerCase(); }

export function markPresence(text, kbSignals){
  const t = norm(text);
  return kbSignals.map(s=>{
    const keys=[s.name,...(SYN[s.name]||[])].map(norm);
    const present=keys.some(k=>t.includes(k));
    return {name:s.name,weight:s.weight,present};
  }).sort((a,b)=>b.weight-a.weight);
}

export function confidenceFromSignals(marked){
  const total=marked.reduce((n,s)=>n+s.weight,0)||1;
  const sum=marked.filter(s=>s.present).reduce((n,s)=>n+s.weight,0);
  const raw=sum/total;
  return Math.max(0.15,Math.min(0.9,+raw.toFixed(2)));
}