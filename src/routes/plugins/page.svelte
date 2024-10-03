<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { installPluginFromZip } from '$lib/plugins/command'
  import { pluginStore } from '$lib/plugins/store'
  import { fileSelector } from '$lib/utils/fileSelector'
  import { toast } from 'svelte-sonner'

  async function onInstallPluginFromLocal() {
    const files = await fileSelector({
      accept: '.zip',
    })
    if (!files) {
      return
    }
    try {
      await installPluginFromZip(files[0])
    } catch (err) {
      console.error(err)
      toast.error('Failed to install plugin')
    }
  }
</script>

<h1>Plugins</h1>
<Button on:click={onInstallPluginFromLocal}>Install Plugin From Local</Button>
<div>
  {#each $pluginStore.plugins as plugin}
    <div>{plugin.id}</div>
  {/each}
</div>
