import { useEffect, useRef } from 'react';

import {
  loadDocumentLines,
  moduleHasDstLines,
  readItemId,
  refreshLayoutDstQueries,
} from '@/features/documents/documentsSlice';
import { layoutHasDstActions } from '@/features/documents/dstLineHelpers';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/** Dohvaća dst stavke kad korisnik uđe u detalj/stavke — isto kao Ionic getListItem nakon odabira retka. */
export function useDocumentLinesLoader(): void {
  const dispatch = useAppDispatch();
  const layout = useAppSelector((state) => state.documents.layout);
  const item = useAppSelector((state) => state.documents.selectedItem);
  const route = useAppSelector((state) => state.documents.route);
  const dstLinesForItemId = useAppSelector((state) => state.documents.dstLinesForItemId);
  const dstLinesStatus = useAppSelector((state) => state.documents.dstLinesStatus);
  const dstRefreshAttemptedFor = useRef<string | null>(null);

  const routeKey = route ? `${route.kind}:${route.folder}` : null;

  useEffect(() => {
    if (!route || !routeKey) {
      return;
    }
    if (layoutHasDstActions(layout)) {
      dstRefreshAttemptedFor.current = routeKey;
      return;
    }
    if (dstRefreshAttemptedFor.current === routeKey) {
      return;
    }
    dstRefreshAttemptedFor.current = routeKey;
    void dispatch(refreshLayoutDstQueries());
  }, [dispatch, layout, route, routeKey]);

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
