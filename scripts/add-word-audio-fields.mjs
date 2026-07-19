/**
 * Agrega `phonetic` y `audioUrl` a las entradas de vocabulario de las semanas 13-40,
 * siguiendo el mismo formato que las semanas 1-12.
 * Idempotente: salta entradas que ya tienen phonetic.
 *
 * Uso: node scripts/add-word-audio-fields.mjs
 */
import { readFileSync, writeFileSync } from 'fs';

const BASE_URL = 'https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio';

const slug = w => w.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// IPA inglés americano (coincide con la voz af_heart de kokoro)
const PHONETICS = {
  // week13
  'Adjust': '/əˈdʒʌst/', 'Enable': '/ɪˈneɪbəl/', 'Disable': '/dɪsˈeɪbəl/', 'Toggle': '/ˈtɑːɡəl/', 'Configure': '/kənˈfɪɡjər/',
  // week14
  'Select': '/sɪˈlɛkt/', 'Deselect': '/ˌdiːsɪˈlɛkt/', 'Check': '/tʃɛk/', 'Uncheck': '/ʌnˈtʃɛk/', 'Highlight': '/ˈhaɪlaɪt/',
  // week15
  'Find': '/faɪnd/', 'Filter': '/ˈfɪltər/', 'Replace': '/rɪˈpleɪs/', 'Match': '/mætʃ/', 'Query': '/ˈkwɪri/',
  // week16
  'Window': '/ˈwɪndoʊ/', 'Header': '/ˈhɛdər/', 'Footer': '/ˈfʊtər/', 'Sidebar': '/ˈsaɪdbɑːr/', 'Main Content': '/meɪn ˈkɑːntɛnt/',
  // week17
  'Navbar': '/ˈnævbɑːr/', 'Breadcrumbs': '/ˈbrɛdkrʌmz/', 'Pagination': '/ˌpædʒɪˈneɪʃən/', 'Link': '/lɪŋk/', 'Tab': '/tæb/',
  // week18
  'Input': '/ˈɪnpʊt/', 'Checkbox': '/ˈtʃɛkbɑːks/', 'Radio Button': '/ˈreɪdioʊ ˈbʌtən/', 'Dropdown': '/ˈdrɑːpdaʊn/', 'Textarea': '/ˈtɛkstˌɛriə/',
  // week19
  'Button': '/ˈbʌtən/', 'Icon': '/ˈaɪkɑːn/', 'Tooltip': '/ˈtuːltɪp/', 'Badge': '/bædʒ/', 'Notification': '/ˌnoʊtɪfɪˈkeɪʃən/',
  // week20
  'Card': '/kɑːrd/', 'Modal': '/ˈmoʊdəl/', 'Accordion': '/əˈkɔːrdiən/', 'Grid': '/ɡrɪd/', 'Container': '/kənˈteɪnər/',
  // week21
  'Step': '/stɛp/', 'Process': '/ˈprɑːsɛs/', 'Sequence': '/ˈsiːkwəns/', 'Flow': '/floʊ/', 'Stage': '/steɪdʒ/',
  // week22
  'Start': '/stɑːrt/', 'Finish': '/ˈfɪnɪʃ/', 'Begin': '/bɪˈɡɪn/', 'End': '/ɛnd/', 'Complete': '/kəmˈpliːt/',
  // week23
  'Next': '/nɛkst/', 'Previous': '/ˈpriːviəs/', 'Back': '/bæk/', 'Forward': '/ˈfɔːrwərd/', 'Skip': '/skɪp/',
  // week24
  'Confirm': '/kənˈfɜːrm/', 'Cancel': '/ˈkænsəl/', 'Agree': '/əˈɡriː/', 'Decline': '/dɪˈklaɪn/', 'Accept': '/əkˈsɛpt/',
  // week25
  'Save': '/seɪv/', 'Exit': '/ˈɛɡzɪt/', 'Quit': '/kwɪt/', 'Discard': '/dɪsˈkɑːrd/', 'Apply': '/əˈplaɪ/',
  // week26
  'Form': '/fɔːrm/', 'Field': '/fiːld/', 'Label': '/ˈleɪbəl/', 'Required': '/rɪˈkwaɪərd/', 'Optional': '/ˈɑːpʃənəl/',
  // week27
  'Validate': '/ˈvælɪdeɪt/', 'Invalid': '/ɪnˈvælɪd/', 'Error Message': '/ˈɛrər ˈmɛsɪdʒ/', 'Success': '/səkˈsɛs/', 'Format': '/ˈfɔːrmæt/',
  // week28
  'Alert': '/əˈlɜːrt/', 'Warning': '/ˈwɔːrnɪŋ/', 'Caution': '/ˈkɔːʃən/', 'Notice': '/ˈnoʊtɪs/', 'Attention': '/əˈtɛnʃən/',
  // week29
  'Error': '/ˈɛrər/', 'Failure': '/ˈfeɪljər/', 'Fault': '/fɔːlt/', 'Bug': '/bʌɡ/', 'Crash': '/kræʃ/',
  // week30
  'Loading': '/ˈloʊdɪŋ/', 'Processing': '/ˈprɑːsɛsɪŋ/', 'Pending': '/ˈpɛndɪŋ/', 'Waiting': '/ˈweɪtɪŋ/', 'Progress': '/ˈprɑːɡrɛs/',
  // week31
  'Code': '/koʊd/', 'Variable': '/ˈvɛriəbəl/', 'Function': '/ˈfʌŋkʃən/', 'Loop': '/luːp/', 'Condition': '/kənˈdɪʃən/',
  // week32
  'String': '/strɪŋ/', 'Integer': '/ˈɪntɪdʒər/', 'Boolean': '/ˈbuːliən/', 'Operator': '/ˈɑːpəreɪtər/', 'Value': '/ˈvæljuː/',
  // week33
  'Compiler': '/kəmˈpaɪlər/', 'Debugger': '/diːˈbʌɡər/', 'Terminal': '/ˈtɜːrmɪnəl/', 'Console': '/ˈkɑːnsoʊl/', 'Script': '/skrɪpt/',
  // week34
  'Database': '/ˈdeɪtəbeɪs/', 'Table': '/ˈteɪbəl/', 'Row': '/roʊ/', 'Column': '/ˈkɑːləm/', 'Record': '/ˈrɛkərd/',
  // week35
  'Server': '/ˈsɜːrvər/', 'Client': '/ˈklaɪənt/', 'Request': '/rɪˈkwɛst/', 'Response': '/rɪˈspɑːns/', 'API': '/ˌeɪ piː ˈaɪ/',
  // week36
  'Manual': '/ˈmænjuəl/', 'Guide': '/ɡaɪd/', 'Readme': '/ˈriːdmiː/', 'Tutorial': '/tuːˈtɔːriəl/', 'Documentation': '/ˌdɑːkjəmɛnˈteɪʃən/',
  // week37
  'License': '/ˈlaɪsəns/', 'Copyright': '/ˈkɑːpiraɪt/', 'Author': '/ˈɔːθər/', 'Version': '/ˈvɜːrʒən/', 'Release': '/rɪˈliːs/',
  // week38
  'Security': '/sɪˈkjʊrəti/', 'Privacy': '/ˈpraɪvəsi/', 'Encryption': '/ɪnˈkrɪpʃən/', 'Authentication': '/ɔːˌθɛntɪˈkeɪʃən/', 'Authorization': '/ˌɔːθərəˈzeɪʃən/',
  // week39
  'Performance': '/pərˈfɔːrməns/', 'Optimization': '/ˌɑːptɪməˈzeɪʃən/', 'Speed': '/spiːd/', 'Efficiency': '/ɪˈfɪʃənsi/', 'Scale': '/skeɪl/',
  // week40
  'Review': '/rɪˈvjuː/', 'Project': '/ˈprɑːdʒɛkt/', 'Final': '/ˈfaɪnəl/', 'Summary': '/ˈsʌməri/'
  // 'Success' ya está en week27 (se repite en week40)
};

const manifest = JSON.parse(readFileSync('scripts/audio-manifest.json', 'utf8'));
let updated = 0, skipped = 0, missingIPA = [];

for (let week = 13; week <= 40; week++) {
  const nn = String(week).padStart(2, '0');
  const path = `src/data/weeks/week${nn}.ts`;
  let content = readFileSync(path, 'utf8');
  const words = manifest.filter(m => m.week === week).map(m => m.word);

  for (const word of words) {
    const phonetic = PHONETICS[word];
    if (!phonetic) { missingIPA.push(`week${nn}:${word}`); continue; }

    const entryRe = new RegExp(
      `(word: "${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",[\\s\\S]*?context: "[^"]*")`
    );
    const match = content.match(entryRe);
    if (!match) { missingIPA.push(`week${nn}:${word} (no encontrado)`); continue; }
    if (match[0].includes('phonetic:')) { skipped++; continue; }

    const url = `${BASE_URL}/week${nn}/${slug(word)}.mp3`;
    content = content.replace(entryRe,
      `$1,\n      phonetic: "${phonetic}",\n      audioUrl: "${url}"`);
    updated++;
  }

  writeFileSync(path, content);
}

console.log(`Actualizadas: ${updated} entradas, saltadas: ${skipped}`);
if (missingIPA.length) console.log('SIN RESOLVER:', missingIPA.join(', '));
