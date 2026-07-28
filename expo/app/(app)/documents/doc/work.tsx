import { DocumentLinesView } from '@/components/DocumentLinesView';

/** "Rad" je vlastita ruta jer native tab navigator ne može imati dvije instance iste rute. */
export default function DocumentWorkTab() {
  return <DocumentLinesView kind="rad" />;
}
