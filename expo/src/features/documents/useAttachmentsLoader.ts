import { useEffect } from 'react';

import { loadAttachments, moduleHasAttachments, readItemId } from '@/features/documents/documentsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/** Dohvaća privitke kad korisnik uđe u karticu Privitci — isto kao useDocumentLinesLoader za stavke. */
export function useAttachmentsLoader(): void {
  const dispatch = useAppDispatch();
  const route = useAppSelector((state) => state.documents.route);
  const layout = useAppSelector((state) => state.documents.layout);
  const item = useAppSelector((state) => state.documents.selectedItem);
  const attachmentsForItemId = useAppSelector((state) => state.documents.attachmentsForItemId);
  const attachmentsStatus = useAppSelector((state) => state.documents.attachmentsStatus);

  useEffect(() => {
    if (!moduleHasAttachments(route, layout) || !item || !route) {
      return;
    }
    const itemId = readItemId(route, item);
    if (itemId === undefined) {
      return;
    }
    if (attachmentsForItemId === itemId && !attachmentsStatus.error) {
      return;
    }
    if (attachmentsStatus.loading) {
      return;
    }
    dispatch(loadAttachments());
  }, [dispatch, route, layout, item, attachmentsForItemId, attachmentsStatus.loading]);
}
