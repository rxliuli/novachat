<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import {
    installPluginForRemote,
    activePluginFromLocal,
    uninstallPlugin,
  } from '$lib/plugins/command'
  import type { PluginManifest } from '$lib/plugins/store'
  import { toast } from 'svelte-sonner'
  import InstallButton from './InstallButton.svelte'
  import type { ResolvedPlugin } from '../types/plugin'

  interface Props {
    plugin: ResolvedPlugin;
    [key: string]: any
  }

  let { ...props }: Props = $props();

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

<div class={props.class}>
  {#if props.plugin.installed}
    {#if props.plugin.canUpdate}
      <InstallButton onClick={() => onInstallPlugin(props.plugin.manifest)}>
        Update
      </InstallButton>
    {/if}
    <Button
      size="sm"
      on:click={(ev) => {
        ev.preventDefault()
        uninstallPlugin(props.plugin.manifest.id)
      }}
    >
      Uninstall
    </Button>
  {:else}
    <InstallButton onClick={() => onInstallPlugin(props.plugin.manifest)}>
      Install
    </InstallButton>
  {/if}
</div>
