/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module '*?data-uri' {
  const content: string
  export default content
}

declare module '@novachat/plugin' {
  export type * from '$lib/plugins/client/plugin'
  export * from '$lib/plugins/client/plugin'
}

declare module '*?script' {
  const content: string
  export default content
}

declare module '*?plugin' {
  const content: string
  export default content
}
