# Using Plugins

By default, NovaChat does not support any LLM Providers, but you can easily download the necessary plugins to support them from the [plugin list](https://app.novachat.dev/#/plugins), and then configure them in the [settings](https://app.novachat.dev/#/settings).

![Plugin Usage](/images/plugin-usage-1.png)

## OpenAI

1. Download the OpenAI Provider
2. Open the [NovaChat settings page](https://app.novachat.dev/#/settings)
3. Enter your OpenAI API key in the **API key** field
4. Refresh the page
5. Select the model you want to use in the **Model** dropdown
   ![openai-1](/images/plugin-usage-openai-1.png)
6. Click **New Chat** to start a new conversation
7. Enter your question and press Enter to send
   ![openai-2](/images/plugin-usage-openai-2.png)

## Vertex Anthropic

1. Download the Vertex Anthropic Provider
2. Open the [NovaChat settings page](https://app.novachat.dev/#/settings)
3. Modify the settings `googleSaClientEmail/googleSaPrivateKey/region/projectId`
4. Select the model
   ![Vertex Anthropic](/images/plugin-usage-vertex-anthropic-1.png)
5. Start a new conversation
6. Enter your question and press Enter to send

## Ollama

1. Run Ollama locally, you must set an environment variable, check if `http://localhost:11434` is accessible, refer to: [How can I allow additional web origins to access Ollama?](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server)
   `OLLAMA_ORIGINS="https://app.novachat.dev" ollama serve`
2. Download the Ollama Provider
3. Open the [NovaChat settings page](https://app.novachat.dev/#/settings)
   ![Ollama](/images/plugin-usage-ollama-1.png)
4. Select the model
   ![Ollama](/images/plugin-usage-ollama-2.png)
5. Start a new conversation
6. Enter your question and press Enter to send
