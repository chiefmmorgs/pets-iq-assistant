export function formatAssessment(a){
  const sigs=a.signals.map(s=>`${s.name} • ${s.present?"Present":"No"} • w${s.weight}`).join("\n");
  const diffs=a.differentials.map(d=>`- ${d.name}: ${d.why}`).join("\n");
  const acts=a.actions.map((s,i)=>`${i+1}. ${s}`).join("\n");
  const conf=Math.round(a.confidence*100);
  return [
    "✅ Assessment Complete",
    `${a.disease} (${a.category})`,
    `Confidence: ${conf}%`,
    "",
    "Signals:",
    sigs,
    "",
    "Possible Conditions:",
    diffs,
    "",
    "Recommended Actions:",
    acts,
    "",
    `Triage: ${a.triage}`
  ].join("\n");
}