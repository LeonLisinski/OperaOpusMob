import { Redirect } from 'expo-router';

/** Default ruta (app) grupe — uvijek vodi na kontrolni centar. */
export default function AppIndexScreen() {
  return <Redirect href="/(app)/apps" />;
}
