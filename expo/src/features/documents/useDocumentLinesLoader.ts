import { useEffect } from 'react';

import { loadDocumentLines, moduleHasDstLines, readItemId } from '@/features/documents/documentsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/** Dohvaća dst stavke kad korisnik uđe u detalj/stavke — isto kao Ionic getListItem nakon odabira retka. */
export function useDocumentLinesLoader(): void {
  const dispatch = useAppDispatch();
  const layout = useAppSelector((state) => state.documents.layout);
  const item = useAppSelector((state) => state.documents.selectedItem);
  const route = useAppSelector((state) => state.documents.route);
  const dstLinesForItemId = useAppSelector((state) => state.documents.dstLinesForItemId);
  const dstLinesStatus = useAppSelector((state) => state.documents.dstLinesStatus);

  useEffect(() => {
    if (!moduleHasDstLines(layout) || !item || !route) {
      return;
    }
    const itemId = readItemId(route, item);
    if (itemId === undefined) {
      return;
    }
    if (dstLinesForItemId === itemId && !dstLinesStatus.error) {
      return;
    }
    if (dstLinesStatus.loading) {
      return;
    }
    dispatch(loadDocumentLines());
  }, [dispatch, layout, item, route, dstLinesForItemId, dstLinesStatus.loading, dstLinesStatus.error]);
}
