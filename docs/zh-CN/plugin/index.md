# 开发插件

在 NovaChat 中，插件是应用扩展功能的主要方式。运行支持新的 LLM、创建自定义的 Bot、或是集成一些其他功能。

## 原理

插件需要使用 JavaScript 开发，使用插件的时候，NovaChat 会使用 WebWorker 运行插件，并通过消息通信来调用插件的功能。

## 运行环境

需要注意的是，插件运行在 WebWorker 中，所以无法访问 DOM，并且以下 API 会被屏蔽，不应该使用它们：

- 缓存相关: localStorage/sessionStorage/indexedDB/cookie，考虑使用设置 API
- 远端代码: 包括 `eval/Function/import/import()`，不安全的代名词，请将代码都打包到一个文件

## 插件类型

目前插件主要分为 LLM Provider、Bot 两类。虽然都可以在 NovaChat 中使用，但后者不需要自定义 API Key 之类的，只会使用配置的默认 LLM Model。

## 感谢

插件系统参考了许多优秀的设计，例如 VSCode for Web、Figma、Joplin 等。
