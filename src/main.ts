import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// Import and expose Floating UI DOM globally for Preline
import * as FloatingUIDOM from '@floating-ui/dom'
declare global {
  interface Window {
    FloatingUIDOM: typeof FloatingUIDOM
  }
}
window.FloatingUIDOM = FloatingUIDOM

// Import Preline
import 'preline/preline'

const app = createApp(App)

app.mount('#app')
