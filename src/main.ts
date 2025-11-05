import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// Import and expose Floating UI DOM globally for Preline
import * as FloatingUIDOM from '@floating-ui/dom'
window.FloatingUIDOM = FloatingUIDOM

// Import Preline (dynamic import ensures it loads after DOM is ready)
import('preline/dist/index.js')

const app = createApp(App)

app.mount('#app')
