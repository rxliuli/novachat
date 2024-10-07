# Developing Plugins

In NovaChat, plugins are the primary way to extend the application's functionality. They can be used to support new LLMs, create custom Bots, or integrate other features.

## Principle

Plugins need to be developed using JavaScript. When using a plugin, NovaChat will run the plugin in a WebWorker and use message communication to call the plugin's functions.

## Runtime Environment

It's important to note that plugins run in a WebWorker, so they cannot access the DOM. Additionally, the following APIs are blocked and should not be used:

- Cache-related: localStorage/sessionStorage/indexedDB/cookie, consider using the settings API instead
- Remote code: including `eval/Function/import/import()`, which are synonymous with insecurity. Please bundle all code into a single file

## Plugin Types

Currently, plugins are mainly divided into two categories: LLM Provider and Bot. Although both can be used in NovaChat, the latter doesn't require custom API keys and will only use the configured default LLM Model.

## Acknowledgements

The plugin system has drawn inspiration from many excellent designs, such as VSCode for Web, Figma, Joplin, and others.