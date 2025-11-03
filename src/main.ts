import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Import Preline
import 'preline/preline'
import { IStaticMethods } from 'preline/preline'

declare global {
  interface Window {
    HSStaticMethods: IStaticMethods
  }
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Reinitialize Preline components after each route change
router.afterEach(() => {
  setTimeout(() => {
    window.HSStaticMethods.autoInit()
  }, 100)
})

app.mount('#app')
