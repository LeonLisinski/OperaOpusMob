import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

import type { AttachmentUploadFile } from '@/services/api/attachmentsApi';

/**
 * Otvara sistemski file picker i učitava odabrane datoteke kao base64 — ekvivalent
 * Ionic `FilePicker.pickFiles({ readData: true })` (v. TabPrivitci.jsx). `copyToCacheDirectory`
 * mora biti `true` da bi `File.base64()` mogao odmah čitati sadržaj.
 * Vraća `null` ako korisnik odustane, prazan niz se ne događa (picker zahtijeva odabir).
 */
export async function pickAttachmentFiles(): Promise<AttachmentUploadFile[] | null> {
  const result = await DocumentPicker.getDocumentAsync({
    multiple: true,
    copyToCacheDirectory: true,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return Promise.all(
    result.assets.map(async (asset) => {
      const file = new File(asset.uri);
      const data = await file.base64();
      return {
        name: asset.name,
        mimeType: asset.mimeType ?? 'application/octet-stream',
        data,
        size: asset.size ?? undefined,
      };
    }),
  );
}
