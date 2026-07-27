import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const FILES_DIR_NAME = 'opera-dokumenti';

/**
 * Sprema base64 sadržaj datoteke u cache i otvara sistemski "share sheet" — ekvivalent
 * Ionic Filesystem.writeFile + FileOpener.openFile, korišteno i za privitke
 * (TabPrivitci.jsx onItemClick) i za REPX izvještaje (Tab4.jsx createAndOpenPdf).
 * `Sharing.shareAsync` je odabran umjesto direktnog "open with" jer expo-sharing
 * pokriva isti slučaj (odabir aplikacije za otvaranje) na Android i iOS bez dodatne
 * (nativne, config-plugin) ovisnosti kao @capawesome-team/capacitor-file-opener.
 */
export async function saveAndOpenFile(fileName: string, base64: string): Promise<void> {
  const directory = new Directory(Paths.cache, FILES_DIR_NAME);
  directory.create({ idempotent: true, intermediates: true });

  const file = new File(directory, fileName);
  file.write(base64, { encoding: 'base64' });

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Otvaranje datoteka nije dostupno na ovom uređaju.');
  }
  await Sharing.shareAsync(file.uri);
}
