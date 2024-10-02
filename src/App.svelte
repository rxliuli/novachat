<script lang="ts">
  import './app.css'
  import Router, { location } from 'svelte-spa-router'
  import Home from './routes/page.svelte'
  import NotFound from './routes/404/page.svelte'
  import Chat from './routes/conversation/page.svelte'
  import { ModeWatcher, setMode } from 'mode-watcher'
  import { Toaster } from '$lib/components/ui/sonner'
  import Layout from '$lib/components/Layout.svelte'
  import Models from './routes/models/page.svelte'
  import Settings from './routes/settings/page.svelte'
  import { settingsStore } from '$lib/stores/settings'
  import { onMount } from 'svelte'
  import { dbApi, initDB } from '$lib/api/db'
  import { convStore } from '$lib/stores/converstation'
  import { migrateLocalStorageToIdb } from '$lib/migrations/localStorageToIdb'

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

  onMount(async () => {
    await initDB()
    if (import.meta.env.DEV) {
      // await migrateLocalStorageToIdb()
      // convStore.subscribe((state) => {
      //   console.log(state.id, state.conversations)
      // })
    }
    const list = await dbApi.conversations.getAll({ limit: 100 })
    convStore.init(list.data.map((it) => ({ ...it, messages: [] })))
  })
</script>

<Layout>
  {#if !$location.startsWith('/conversation/') || $convStore.conversations.length}
    <Router {routes}></Router>
  {/if}
</Layout>
<ModeWatcher />
<Toaster richColors position="top-right" />
