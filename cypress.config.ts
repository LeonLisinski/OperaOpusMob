import { defineConfig } from "cypress";
import { CapacitorConfig } from '@capacitor/cli';


const config: CapacitorConfig = {
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;





// export default defineConfig({
//   e2e: {
//     baseUrl: "http://localhost:5173",
//     setupNodeEvents(on, config) {
//       // implement node event listeners here
//     },
//   }
// });