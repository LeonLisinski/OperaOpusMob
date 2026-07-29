import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const FILES_DIR_NAME = 'opera-dokumenti';

function sanitizeFileName(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop() ?? 'privitak';
  return base.replace(/[^\w.\- ()[\]]+/g, '_') || 'privitak';
}

function normalizeBase64(value: string): string {
  const commaIndex = value.indexOf(',');
  if (value.startsWith('data:') && commaIndex >= 0) {
    return value.slice(commaIndex + 1);
  }
  return value.trim();
}

function guessMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Sprema base64 sadržaj datoteke u cache i otvara sistemski "share sheet" — ekvivalent
 * Ionic Filesystem.writeFile + FileOpener.openFile (TabPrivitci.jsx onItemClick).
 * Legacy `writeAsStringAsync` s Base64 encodingom — provjereno ponašanje na produkcijskom Ionicu.
 */
export async function saveAndOpenFile(fileName: string, base64: string): Promise<void> {
  const safeName = sanitizeFileName(fileName);
  const payload = normalizeBase64(base64);

  if (payload.length === 0) {
    throw new Error('Privitak nema sadržaj za otvaranje.');
  }

  const cacheRoot = FileSystem.cacheDirectory;
  if (!cacheRoot) {
    throw new Error('Cache direktorij nije dostupan na ovom uređaju.');
  }

  const directoryUri = `${cacheRoot}${FILES_DIR_NAME}/`;
  await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true });

  const fileUri = `${directoryUri}${safeName}`;
  await FileSystem.writeAsStringAsync(fileUri, payload, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Otvaranje datoteka nije dostupno na ovom uređaju.');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: guessMimeType(safeName),
    dialogTitle: safeName,
  });
}
