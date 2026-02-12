const fs = require('fs');
const path = require('path');
const https = require('https');

const QURAN_DIR = path.join(__dirname, '..', 'public', 'quran');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function downloadSurah(num) {
  const outFile = path.join(QURAN_DIR, `${num}.json`);
  if (fs.existsSync(outFile)) {
    return;
  }

  const url = `https://api.alquran.cloud/v1/surah/${num}/ar.alafasy`;
  try {
    const raw = await fetch(url);
    const json = JSON.parse(raw);
    if (json.code !== 200 || !json.data) throw new Error('Bad response');

    const surah = {
      number: json.data.number,
      name: json.data.name,
      englishName: json.data.englishName,
      numberOfAyahs: json.data.numberOfAyahs,
      ayahs: json.data.ayahs.map(a => ({
        number: a.number,
        text: a.text,
        numberInSurah: a.numberInSurah,
        juz: a.juz,
        page: a.page,
      })),
    };

    fs.writeFileSync(outFile, JSON.stringify(surah, null, 0), 'utf-8');
    process.stdout.write(`✓ ${num} `);
  } catch (e) {
    console.error(`\nError downloading surah ${num}: ${e.message}`);
  }
}

async function main() {
  if (!fs.existsSync(QURAN_DIR)) {
    fs.mkdirSync(QURAN_DIR, { recursive: true });
  }

  console.log('Downloading Quran data (114 surahs)...');

  // Download in batches of 5 to avoid rate limiting
  for (let i = 1; i <= 114; i += 5) {
    const batch = [];
    for (let j = i; j < Math.min(i + 5, 115); j++) {
      batch.push(downloadSurah(j));
    }
    await Promise.all(batch);
    // Small delay between batches
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\nDone!');

  // Verify
  let count = 0;
  for (let i = 1; i <= 114; i++) {
    if (fs.existsSync(path.join(QURAN_DIR, `${i}.json`))) count++;
  }
  console.log(`${count}/114 surahs downloaded.`);
}

main().catch(console.error);
