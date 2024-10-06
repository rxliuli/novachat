<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import {
    activePluginFromLocal,
    installPluginForRemote,
    installPluginFromZip,
    loadRemotePlugins,
    uninstallPlugin,
  } from '$lib/plugins/command'
  import {
    installedPlugins,
    pluginStore,
    type PluginManifest,
  } from '$lib/plugins/store'
  import { fileSelector } from '$lib/utils/fileSelector'
  import { uniq, uniqBy } from 'lodash-es'
  import { BlocksIcon, Loader2Icon } from 'lucide-svelte'
  import { toast } from 'svelte-sonner'
  import InstallButton from './components/InstallButton.svelte'

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

  async function onUninstallPlugin(pluginId: string) {
    await uninstallPlugin(pluginId)
  }

  let remotePlugins: PluginManifest[] = []
  $: plugins = uniqBy(
    remotePlugins.concat($pluginStore.plugins.map((it) => it.manifest)),
    (it) => it.id,
  ).map((manifest) => ({
    manifest: manifest,
    installed: uniq([
      ...$pluginStore.plugins.map((it) => it.id),
      ...$installedPlugins.map((it) => it.id),
    ]).some((it) => it === manifest.id),
  }))

  async function onLoadRemotePlugins() {
    remotePlugins = await loadRemotePlugins()
  }
  const loadPluginsState = onLoadRemotePlugins()

  async function onInstallPlugin(manifest: PluginManifest) {
    try {
      await installPluginForRemote(manifest)
      await activePluginFromLocal(manifest.id)
    } catch (err) {
      console.error(err)
      toast.error('Failed to install plugin')
    }
  }
</script>

<div>
  <div class="flex flex-col lg:flex-row min-h-screen">
    <main class="flex-1 p-6">
      <div class="mb-8 flex justify-between">
        <h2 class="text-2xl font-bold mb-2">Plugins</h2>
        <Button on:click={onInstallPluginFromLocal}>Install</Button>
      </div>

      {#await loadPluginsState}
        <div class="flex justify-center items-center h-full">
          <Loader2Icon class="w-4 h-4 animate-spin" />
        </div>
      {:then _loadPluginsState}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {#each plugins as plugin}
            <div
              class="bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-4"
            >
              <BlocksIcon class="w-4 h-4" />
              <h3 class="text-lg font-semibold">{plugin.manifest.name}</h3>
              <p class="text-sm mb-2">
                {plugin.manifest.description || 'No description'}
              </p>
              <div>
                {#if plugin.installed}
                  <Button
                    on:click={() => onUninstallPlugin(plugin.manifest.id)}
                  >
                    Uninstall
                  </Button>
                {:else}
                  <InstallButton
                    onInstall={() => onInstallPlugin(plugin.manifest)}
                  />
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {:catch somError}
        <div class="flex justify-center items-center h-full">
          <p class="text-sm text-gray-500">
            Failed to load plugins: {somError.message}
          </p>
          <Button on:click={() => onLoadRemotePlugins()}>Refresh</Button>
        </div>
      {/await}
    </main>
  </div>
</div>
