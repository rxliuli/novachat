<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import {
    activePluginFromLocal,
    installPluginFromZip,
  } from '$lib/plugins/command'
  import { pluginStore } from '$lib/plugins/store'
  import { fileSelector } from '$lib/utils/fileSelector'
  import { BlocksIcon, Loader2Icon } from 'lucide-svelte'
  import { toast } from 'svelte-sonner'
  import PluginActions from './components/PluginActions.svelte'
  import { loadPlugins, plugins } from './store/plugin'

  async function onInstallPluginFromLocal() {
    const files = await fileSelector({
      accept: '.zip',
    })
    if (!files) {
      return
    }
    try {
      const pluginId = await installPluginFromZip(files[0])
      await activePluginFromLocal(pluginId)
      console.log('installed', $pluginStore)
    } catch (err) {
      console.error(err)
      toast.error('Failed to install plugin')
    }
  }

  const loadPluginsState = loadPlugins()
</script>

<div>
  <div class="flex flex-col lg:flex-row min-h-dvh">
    <main class="flex-1 p-6">
      <div class="mb-8 flex justify-between">
        <h2 class="text-2xl font-bold mb-2">Plugins</h2>
        <Button on:click={onInstallPluginFromLocal}>Install</Button>
      </div>

      {#await loadPluginsState}
        <div class="flex justify-center items-center h-full">
          <Loader2Icon class="w-4 h-4 animate-spin" />
        </div>
      {:then _}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {#each $plugins as plugin}
            <a
              class="bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col justify-between"
              href={`#/plugins/${plugin.manifest.id}`}
            >
              <BlocksIcon class="w-4 h-4" />
              <h3 class="text-lg font-semibold">{plugin.manifest.name}</h3>
              <p class="text-sm mb-2">
                {plugin.manifest.description || 'No description'}
              </p>
              <PluginActions class="mt-auto" {plugin} />
            </a>
          {/each}
        </div>
      {:catch somError}
        <div class="flex justify-center items-center h-full">
          <p class="text-sm text-gray-500">
            Failed to load plugins: {somError.message}
          </p>
          <Button on:click={loadPlugins}>Refresh</Button>
        </div>
      {/await}
    </main>
  </div>
</div>
