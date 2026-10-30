import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import { MOODS, SYMPTOMS, label } from '../domain/catalog';
import { addDays, formatShort, today } from '../domain/dates';
import { computeInsights } from '../domain/insights';
import { predict } from '../domain/cycle';
import type { AppData } from '../domain/types';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** A printable summary meant to be shown to a doctor or midwife. */
export function reportHtml(data: AppData, months = 6): string {
  const ref = today();
  const ins = computeInsights(data, ref);
  const p = predict(data, ref);
  const since = addDays(ref, -months * 30);

  const symptomCounts: Record<string, number> = {};
  for (const [d, log] of Object.entries(data.days)) {
    if (d < since) continue;
    for (const s of [...(log.symptoms ?? []), ...(log.moods ?? [])]) symptomCounts[s] = (symptomCounts[s] ?? 0) + 1;
  }
  const topSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const cycles = ins.history.filter((c) => c.start >= since);
  const notes = Object.entries(data.days).filter(([d, l]) => d >= since && l.notes).sort(([a], [b]) => b.localeCompare(a)).slice(0, 15);

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#2B1B2E;padding:32px;font-size:12px}
    h1{color:#E2556F;margin:0 0 4px} h2{color:#5B2A5E;border-bottom:1px solid #F3D6DC;padding-bottom:4px;margin-top:24px}
    table{width:100%;border-collapse:collapse} td,th{padding:6px;border-bottom:1px solid #F5E6EA;text-align:left}
    .kpi{display:inline-block;margin-right:24px} .kpi b{display:block;font-size:20px;color:#E2556F}
    .warn{background:#FFF1F3;border-left:3px solid #E2556F;padding:8px;margin:6px 0}
    small{color:#8A7A8C}
  </style></head><body>
  <h1>Rapport de cycle</h1>
  <small>${esc(data.settings.name ?? '')} · Généré le ${formatShort(ref)} · ${months} derniers mois · Lunéa</small>
  <h2>Synthèse</h2>
  <div class="kpi">Cycle moyen<b>${ins.avgCycle} j</b></div>
  <div class="kpi">Règles moyennes<b>${ins.avgPeriod} j</b></div>
  <div class="kpi">Variation<b>${ins.shortest ?? '–'}–${ins.longest ?? '–'} j</b></div>
  <div class="kpi">Prochaines règles<b>${formatShort(p.nextPeriodStart)} ±${p.uncertainty}</b></div>
  ${ins.alerts.map((a) => `<div class="warn"><b>${esc(a.title)}</b> — ${esc(a.body)}</div>`).join('')}
  <h2>Historique des cycles</h2>
  <table><tr><th>Début</th><th>Durée du cycle</th><th>Durée des règles</th><th>Ovulation confirmée</th></tr>
  ${cycles.map((c) => `<tr><td>${formatShort(c.start)}</td><td>${c.length ? c.length + ' j' : 'en cours'}</td><td>${c.periodLength} j</td><td>${c.ovulationConfirmed ? 'Oui' : '–'}</td></tr>`).join('')}
  </table>
  <h2>Symptômes et humeurs les plus fréquents</h2>
  <table>${topSymptoms.map(([id, n]) => `<tr><td>${esc(label([...SYMPTOMS, ...MOODS], id))}</td><td>${n} jour(s)</td></tr>`).join('') || '<tr><td>Aucun symptôme noté</td></tr>'}</table>
  ${notes.length ? `<h2>Notes</h2><table>${notes.map(([d, l]) => `<tr><td>${formatShort(d)}</td><td>${esc(l.notes!)}</td></tr>`).join('')}</table>` : ''}
  <p><small>Ce rapport est généré à partir des données saisies par l'utilisatrice. Il ne constitue pas un diagnostic médical.</small></p>
  </body></html>`;
}

export async function shareReport(data: AppData, months = 6): Promise<void> {
  if (Platform.OS === 'web') {
    // The browser's print dialog offers "Save as PDF".
    const w = window.open('', '_blank');
    if (!w) throw new Error('Autorisez les fenêtres pop-up pour ce site.');
    w.document.write(reportHtml(data, months));
    w.document.close();
    setTimeout(() => w.print(), 500);
    return;
  }
  const { uri } = await Print.printToFileAsync({ html: reportHtml(data, months) });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Partager le rapport' });
}

/** Plain JSON export so the data is never locked in. */
export async function exportJson(data: AppData): Promise<void> {
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `lunea-export-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  const file = new File(Paths.cache, `lunea-export-${today()}.json`);
  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify(data, null, 2));
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Exporter mes données' });
}
