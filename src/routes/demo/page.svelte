<script lang="ts">
  import { activePlugin, loadInstalledPlugins } from '$lib/plugins/command'
  import { onDestroy, onMount } from 'svelte'
  import { createModelCommand } from '$lib/plugins/commands/model'
  import { pluginStore } from '$lib/plugins/store'

  onMount(async () => {
    // createModelCommand()
    // const plugins = [
    //   ...(await import('$lib/plugins/internal')).internalPlugins,
    //   ...(await loadInstalledPlugins()),
    // ]
    // await Promise.all(plugins.map(activePlugin))
    // const r1 = await pluginStore.executeCommand('OpenAI.model.invoke', {
    //   model: 'gpt-4o',
    //   messages: [],
    // } as QueryRequest)
    // console.log(r1)
    // const stream = cb2gen<QueryChunkResponse>((cb) =>
    //   pluginStore.executeCommand(
    //     'OpenAI.model.stream',
    //     {
    //       model: 'gpt-4o',
    //       messages: [
    //         {
    //           from: 'user',
    //           content: 'hello',
    //         },
    //       ],
    //     } as QueryRequest,
    //     cb,
    //   ),
    // )
    // for await (const it of stream) {
    //   console.log(it)
    // }
  })

  onDestroy(() => {
    $pluginStore.plugins.forEach((it) => {
      it.worker.terminate()
    })
    $pluginStore.plugins = []
    $pluginStore.commands = []
    $pluginStore.models = []
  })
</script>

<h1>Demo</h1>
