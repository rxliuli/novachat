<script lang="ts">
  import * as Select from '$lib/components/ui/select'
  import { createEventDispatcher } from 'svelte'

  type Selected<Value> = {
    value: Value
    label?: string
  }
  export let name: string
  export let value: any
  export let items: Selected<any>[]
  export let placeholder: string
  $: label = items.find((it) => it.value === value)?.label ?? value

  const dispatch = createEventDispatcher<{
    change(value: any): void
  }>()
</script>

<Select.Root
  {name}
  selected={{
    value,
    label,
  }}
  onSelectedChange={(ev) => dispatch('change', ev?.value)}
>
  <Select.Trigger class="w-full">
    {label ?? placeholder}
  </Select.Trigger>
  <Select.Content class="overflow-y-auto max-h-[20rem]">
    {#each items as it}
      <Select.Item value={it.value}>{it.label ?? it.value}</Select.Item>
    {/each}
  </Select.Content>
</Select.Root>
