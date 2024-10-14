<script lang="ts">
  import { type PluginManifest } from '$lib/plugins/store'
  import InstallButton from '../components/InstallButton.svelte'
  import {
    activePluginFromLocal,
    installPluginForRemote,
    loadRemotePlugins,
  } from '$lib/plugins/command'
  import { toast } from 'svelte-sonner'
  import { onMount } from 'svelte'
  import { gfmFromMarkdown } from 'mdast-util-gfm'
  import { newlineToBreak } from 'mdast-util-newline-to-break'
  import { gfm } from 'micromark-extension-gfm'
  import { fromMarkdown } from 'mdast-util-from-markdown'
  import { toHast } from 'mdast-util-to-hast'
  import { toHtml } from 'hast-util-to-html'
  import { createHighlighter } from 'shiki'
  import type { Code } from 'mdast'
  import type { Element } from 'hast'

  export let params: { id: string } = { id: '' }

  let plugin: PluginManifest
  let readmeHtml: string = ''

  onMount(async () => {
    const plugins = await loadRemotePlugins()
    const findPlugin = plugins.find((it) => it.id === params.id)
    if (findPlugin) {
      plugin = findPlugin
    }
    const r = await fetch(
      `https://raw.githubusercontent.com/novachat/plugins/refs/heads/main/plugins/${plugin.id}/README.md`,
    )
    if (!r.ok) {
      return
    }
    const root = fromMarkdown(await r.text(), {
      extensions: [gfm()],
      mdastExtensions: [gfmFromMarkdown(), { transforms: [newlineToBreak] }],
    })
    const highlighter = await createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: ['typescript', 'javascript', 'json'],
    })
    const hast = toHast(root, {
      handlers: {
        code: (state, node, parent) => {
          const code = node as Code
          const lang = code.lang
          const value = code.value
          const hast = highlighter.codeToHast(value, {
            lang: lang!,
            themes: {
              light: 'github-light',
              dark: 'github-dark',
            },
          })
          return [hast.children[0] as Element]
        },
      },
    })
    readmeHtml = toHtml(hast)
  })

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

<div class="container p-2 md:p-4 max-w-3xl">
  {#if plugin}
    <div class="p-5 bg-gray-900 text-white">
      <div class="flex items-start mb-5">
        {#if plugin.icons}
          <img
            src={plugin.icons['128']}
            alt={plugin.name}
            class="w-16 h-16 mr-5"
          />
        {:else}
          <div
            class="w-16 h-16 mr-5 bg-gray-800 rounded-full flex items-center justify-center"
          >
            <span class="text-2xl font-bold">{plugin.name[0]}</span>
          </div>
        {/if}
        <div>
          <h1 class="text-2xl font-bold mb-2">{plugin.name}</h1>
          <p class="text-gray-300 mb-4">{plugin.description}</p>
          <InstallButton onClick={() => onInstallPlugin(plugin)}>
            Install
          </InstallButton>
        </div>
      </div>
      <div class="grid grid-cols-[auto_1fr] gap-x-4">
        <span class="text-sm text-gray-400">Author</span>
        <span>{plugin.author}</span>
        <span class="text-sm text-gray-400">Version</span>
        <span>{plugin.version}</span>
        <span class="text-sm text-gray-400">Updated</span>
        <span
          >{(plugin.lastUpdated
            ? new Date(plugin.lastUpdated)
            : new Date()
          ).toLocaleDateString()}</span
        >
        {#if plugin.homepage}
          <a
            href={plugin.homepage}
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-400 hover:underline">Website</a
          >
          <span />
        {/if}
      </div>
      <hr class="my-4" />
      <div
        class="prose dark:prose-invert max-sm:prose-sm max-w-none [&_p]:break-words [&_p]:break-all"
      >
        {@html readmeHtml}
      </div>
    </div>
  {:else}
    <div class="p-5 bg-gray-900 text-white">Plugin not found</div>
  {/if}
</div>
