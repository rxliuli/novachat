<script lang="ts">
  import './app.css'
  import Router, { location } from 'svelte-spa-router'
  import Home from './routes/page.svelte'
  import NotFound from './routes/404/page.svelte'
  import Chat from './routes/conversation/page.svelte'
  import { ModeWatcher, setMode } from 'mode-watcher'
  import { Toaster } from '$lib/components/ui/sonner'
  import Layout from '$lib/components/Layout.svelte'
  import Plugins from './routes/plugins/page.svelte'
  import Settings from './routes/settings/page.svelte'
  import { settingsStore } from '$lib/stores/settings'
  import { onDestroy, onMount } from 'svelte'
  import { dbApi, initDB } from '$lib/api/db'
  import { convStore } from '$lib/stores/converstation'
  import { initPluginSystem, destoryPluginSystem } from '$lib/plugins/command'
  import { pluginStore } from '$lib/plugins/store'

  const routes = {
    '/': Home,
    '/conversation/:id': Chat,
    '/plugins': Plugins,
    '/settings': Settings,
    '*': NotFound,
  }

  $: if ($settingsStore.theme) {
    setMode($settingsStore.theme)
  }

  onMount(async () => {
    await initDB()
    const list = await dbApi.conversations.getAll({ limit: 100 })
    convStore.init(list.data.map((it) => ({ ...it, messages: [] })))
  })

  onMount(async () => {
    await initPluginSystem()
    // console.log($pluginStore)
  })
  onDestroy(destoryPluginSystem)
</script>

<Layout>
  {#if !$location.startsWith('/conversation/') || $convStore.conversations.length}
    <Router {routes}></Router>
  {/if}
</Layout>
<ModeWatcher />
<Toaster richColors position="top-right" />
