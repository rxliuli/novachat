# 使用插件

默认情况下，NovaChat 本身不支持任何 LLM Provider，但你可以轻松在[插件列表](https://app.novachat.dev/#/plugins)下载需要的插件支持它，然后在[设置](https://app.novachat.dev/#/settings)中配置它。

![Plugin Usage](/images/plugin-usage-1.png)

## OpenAI

1. 下载 OpenAI Provider
2. 打开 [NovaChat 设置页面](https://app.novachat.dev/#/settings)
3. 在 **API key** 中输入你的 OpenAI API key
4. 在 **Model** 中选择你想要使用的模型
   ![openai-1](/images/plugin-usage-openai-1.png)
5. 点击 **New Chat** 开始新的会话
6. 输入你的问题，然后按回车发送
   ![openai-2](/images/plugin-usage-openai-2.png)

## Vertex Anthropic

1. 下载 Vertex Anthropic Provider
2. 打开 [NovaChat 设置页面](https://app.novachat.dev/#/settings)
3. 修改设置 `googleSaClientEmail/googleSaPrivateKey/region/projectId`
4. 选择模型
   ![Vertex Anthropic](/images/plugin-usage-vertex-anthropic-1.png)
5. 开始新的会话
6. 输入你的问题，然后按回车发送

## Ollama

1. 在本地运行 Ollama，必须设置环境变量，检查 `http://localhost:11434` 是否可以访问，参考：[How can I allow additional web origins to access Ollama?](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server)
   `OLLAMA_ORIGINS="https://app.novachat.dev" ollama serve`
2. 下载 Ollama Provider
3. 打开 [NovaChat 设置页面](https://app.novachat.dev/#/settings)
   ![Ollama](/images/plugin-usage-ollama-1.png)
4. 选择模型
   ![Ollama](/images/plugin-usage-ollama-2.png)
5. 开始新的会话
6. 输入你的问题，然后按回车发送
