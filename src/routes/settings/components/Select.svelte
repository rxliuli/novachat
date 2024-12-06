<script lang="ts">
  import * as Select from '$lib/components/ui/select'
  import { createEventDispatcher } from 'svelte'

  type Selected<Value> = {
    value: Value
    label?: string
  }
  interface Props {
    name: string
    value: any
    items: Selected<any>[]
    placeholder: string
    onChange?: (value: any) => void
  }

  let { name, value, items, placeholder, onChange }: Props = $props()
  let label = $derived(items.find((it) => it.value === value)?.label ?? value)
</script>

<Select.Root
  type="single"
  {name}
  bind:value
  onValueChange={() => onChange?.(value)}
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
