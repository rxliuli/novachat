<script>
  import './app.css'
  import Router from 'svelte-spa-router'
  import Home from './routes/page.svelte'
  import NotFound from './routes/404/page.svelte'
  import Chat from './routes/conversation/page.svelte'
  import { ModeWatcher, setMode } from 'mode-watcher'
  import { Toaster } from '$lib/components/ui/sonner'
  import Layout from '$lib/components/Layout.svelte'
  import Models from './routes/models/page.svelte'
  import Settings from './routes/settings/page.svelte'
  import { settingsStore } from '$lib/stores/settings'

  const routes = {
    '/': Home,
    '/conversation/:id': Chat,
    '/models': Models,
    '/settings': Settings,
    '*': NotFound,
  }

  $: if ($settingsStore.theme) {
    setMode($settingsStore.theme)
  }
</script>

<Layout>
  <Router {routes}></Router>
</Layout>
<ModeWatcher />
<Toaster richColors position="top-right" />
