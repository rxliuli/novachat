<script lang="ts">
  import { settingsStore } from '$lib/stores/settings'
  import * as Select from '$lib/components/ui/select'
  import { Input } from '$lib/components/ui/input'
  import { Separator } from '$lib/components/ui/separator'
  import { settingSchemaStore } from '$lib/stores/settingSchema'
  import { Textarea } from '$lib/components/ui/textarea'
  import SelectUI from './components/Select.svelte'
  import { pluginStore } from '$lib/plugins/store'

  function onChange(name: string, value: any) {
    ;($settingsStore as any)[name] = value
  }
  function onChangeInput(e: InputEvent, name: string) {
    onChange(name, (e.target as HTMLInputElement).value)
  }

  let search = ''

  $: schemas = $settingSchemaStore
    .flatMap((it) =>
      Object.entries(it.properties).map(([key, value]) => ({
        name: key as keyof typeof $settingsStore,
        title: it.title,
        schema: value,
      })),
    )
    .filter(
      (it) =>
        search.trim().length === 0 ||
        it.name.includes(search) ||
        it.title.includes(search) ||
        it.schema.description?.includes(search),
    )
</script>

<div class="container p-2 md:p-4 max-w-3xl">
  <h1 class="text-2xl font-bold">Settings</h1>
  <Input
    type="text"
    class="my-2"
    bind:value={search}
    placeholder="Search settings"
  />
  <Separator />
  <form class="py-2">
    {#each schemas as it}
      <div class="mb-2">
        <label for={it.name} class="block mb-1">{it.schema.description}</label>
        {#if it.schema.enum}
          <SelectUI
            name={it.name}
            value={$settingsStore[it.name]}
            on:change={(ev) => onChange(it.name, ev.detail)}
            items={it.schema.enum.map((value, index) => ({
              value,
              label: it.schema.enumDescriptions?.[index] ?? value,
            }))}
            placeholder="Please select"
          />
        {:else if it.schema.type === 'string'}
          {#if it.schema.format === 'markdown'}
            <Textarea name={it.name} bind:value={$settingsStore[it.name]}
            ></Textarea>
          {:else if it.schema.format === 'model'}
            <SelectUI
              name={it.name}
              value={$settingsStore[it.name]}
              on:change={(ev) => onChange(it.name, ev.detail)}
              placeholder="Please select"
              items={$pluginStore.models
                .filter((it) => it.type === 'llm')
                .map((it) => ({
                  value: it.id,
                  label: it.name,
                }))}
            />
          {:else}
            <Input
              type={it.schema.format ?? 'text'}
              id={it.name}
              name={it.name}
              value={$settingsStore[it.name] ?? it.schema.default}
              on:input={(e) => onChangeInput(e, it.name)}
            />
          {/if}
        {/if}
      </div>
    {/each}
  </form>
</div>
