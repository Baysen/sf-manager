import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// Import Preline
import 'preline/preline'
import type { IStaticMethods } from 'preline/preline'

declare global {
  interface Window {
    HSStaticMethods: IStaticMethods
  }
}

const app = createApp(App)

app.mount('#app')
