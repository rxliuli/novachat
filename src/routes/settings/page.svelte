<script lang="ts">
  import { settingsStore } from '$lib/stores/settings'
  import * as Select from '$lib/components/ui/select'
  import { Input } from '$lib/components/ui/input'
  import { Separator } from '$lib/components/ui/separator'
  import { settingSchemaStore } from '$lib/stores/settingSchema'

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
          <Select.Root
            name={it.name}
            selected={{
              value: $settingsStore[it.name],
              label: $settingsStore[it.name],
            }}
            onSelectedChange={(value) => {
              value?.value && onChange(it.name, value.value)
            }}
          >
            <Select.Trigger class="w-full">
              {it.schema.enumDescriptions?.[
                it.schema.enum.indexOf($settingsStore[it.name])
              ] ??
                $settingsStore[it.name] ??
                it.schema.enumDescriptions?.[
                  it.schema.enum.indexOf(it.schema.default)
                ] ??
                it.schema.default ??
                'Please select'}
            </Select.Trigger>
            <Select.Content class="overflow-y-auto max-h-[20rem]">
              {#each it.schema.enum as value, index}
                <Select.Item {value}
                  >{it.schema.enumDescriptions?.[index] ?? value}</Select.Item
                >
              {/each}
            </Select.Content>
          </Select.Root>
        {:else if it.schema.type === 'string'}
          <Input
            type={it.schema.format ?? 'text'}
            id={it.name}
            name={it.name}
            value={$settingsStore[it.name] ?? it.schema.default}
            on:input={(e) => onChangeInput(e, it.name)}
          />
        {/if}
      </div>
    {/each}
  </form>
</div>
