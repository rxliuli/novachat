<script lang="ts">
  import { onMount } from 'svelte'
  import { createHighlighter } from 'shiki'
  import { md2html } from '../../../lib/utils/md2html'
  import PluginActions from '../components/PluginActions.svelte'
  import { serializeError } from 'serialize-error'
  import { loadPlugins, plugins } from '../store/plugin'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb'

  export let params: { id: string } = { id: '' }

  const loadPluginsState = loadPlugins()

  $: plugin = $plugins.find((it) => it.manifest.id === params.id)
  let readmeHtml: string = ''

  onMount(async () => {
    await loadPluginsState
    if (!plugin) {
      return
    }
    const r = await fetch(
      `https://raw.githubusercontent.com/novachat/plugins/refs/heads/main/plugins/${plugin.manifest.id}/README.md`,
    )
    if (!r.ok) {
      return
    }
    const highlighter = await createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: ['typescript', 'javascript', 'json'],
    })
    readmeHtml = md2html(await r.text(), highlighter)
  })
</script>

<div class="container p-2 md:p-4 max-w-3xl">
  <script lang="ts">
    import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js'
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
  </script>

  <Breadcrumb.Root>
    <Breadcrumb.List>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#/plugins">Plugins</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Page>{plugin?.manifest.name}</Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb.Root>
  {#await loadPluginsState}
    <div class="flex justify-center items-center h-full">
      <div class="spinner spinner-primary"></div>
    </div>
  {:then _}
    {#if plugin}
      <div class="p-5 bg-gray-900 text-white">
        <div class="flex items-start mb-5">
          {#if plugin.manifest.icons}
            <img
              src={plugin.manifest.icons['128']}
              alt={plugin.manifest.name}
              class="w-16 h-16 mr-5"
            />
          {:else}
            <div
              class="w-16 h-16 mr-5 bg-gray-800 rounded-full flex items-center justify-center"
            >
              <span class="text-2xl font-bold">{plugin.manifest.name[0]}</span>
            </div>
          {/if}
          <div>
            <h1 class="text-2xl font-bold mb-2">{plugin.manifest.name}</h1>
            <p class="text-gray-300 mb-4">{plugin.manifest.description}</p>
            <PluginActions {plugin} />
          </div>
        </div>
        <div class="grid grid-cols-[auto_1fr] gap-x-4">
          <span class="text-sm text-gray-400">Author</span>
          <span>{plugin.manifest.author}</span>
          <span class="text-sm text-gray-400">Version</span>
          <span>{plugin.manifest.version}</span>
          <span class="text-sm text-gray-400">Updated</span>
          <span
            >{(plugin.manifest.lastUpdated
              ? new Date(plugin.manifest.lastUpdated)
              : new Date()
            ).toLocaleDateString()}</span
          >
          {#if plugin.manifest.homepage}
            <a
              href={plugin.manifest.homepage}
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-400 hover:underline">Website</a
            >
            <span />
          {/if}
        </div>
        <hr class="my-4" />
        <div
          class="prose prose-h1:text-[1.5rem] prose-h2:text-[1.25rem] prose-h3:text-[1.125rem] prose-h4:text-[1rem] prose-h5:text-[0.875rem] prose-h6:text-[0.75rem] dark:prose-invert max-sm:prose-sm max-w-none [&_p]:break-words [&_p]:break-all"
        >
          {@html readmeHtml}
        </div>
      </div>
    {:else}
      <div class="p-5 bg-gray-900 text-white">Plugin not found</div>
    {/if}
  {:catch _err}
    <div class="prose">{serializeError(_err).message}</div>
  {/await}
</div>
