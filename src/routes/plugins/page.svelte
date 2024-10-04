<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import {
    activePluginFromLocal,
    installPluginFromZip,
    stopPlugin,
    uninstallPlugin,
  } from '$lib/plugins/command'
  import { internalPlugins } from '$lib/plugins/internal'
  import { pluginStore } from '$lib/plugins/store'
  import { fileSelector } from '$lib/utils/fileSelector'
  import { BlocksIcon } from 'lucide-svelte'
  import { toast } from 'svelte-sonner'

  async function onInstallPluginFromLocal() {
    const files = await fileSelector({
      accept: '.zip',
    })
    if (!files) {
      return
    }
    try {
      const pluginId = await installPluginFromZip(files[0])
      if ($pluginStore.plugins.some((it) => it.id === pluginId)) {
        stopPlugin(pluginId)
      }
      await activePluginFromLocal(pluginId)
      console.log('installed', $pluginStore)
    } catch (err) {
      console.error(err)
      toast.error('Failed to install plugin')
    }
  }

  const internalPluginIds = internalPlugins.map((it) => it.manifest.id)

  async function onUninstallPlugin(pluginId: string) {
    await uninstallPlugin(pluginId)
    console.log('uninstalled', $pluginStore)
  }
</script>

<div>
  <div class="flex flex-col lg:flex-row min-h-screen">
    <main class="flex-1 p-6">
      <div class="mb-8 flex justify-between">
        <h2 class="text-2xl font-bold mb-2">Plugins</h2>
        <Button on:click={onInstallPluginFromLocal}>Install</Button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each $pluginStore.plugins as plugin}
          <div
            class="bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-4"
          >
            <BlocksIcon class="w-4 h-4" />
            <h3 class="text-lg font-semibold">{plugin.manifest.name}</h3>
            <p class="text-sm">
              {plugin.manifest.description || 'No description'}
            </p>
            {#if !internalPluginIds.includes(plugin.id)}
              <Button
                size="sm"
                class="mt-2"
                on:click={() => onUninstallPlugin(plugin.manifest.id)}
                >Uninstall</Button
              >
            {/if}
          </div>
        {/each}
      </div>
    </main>
  </div>
</div>
