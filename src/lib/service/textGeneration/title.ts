import type { Conversation } from '$lib/types/Conversation'
import { bot, type EndpointMessage } from '$lib/api/bot'

export async function generateTitleForConversation(
  conv: Conversation,
): Promise<string | undefined> {
  try {
    const userMessage = conv.messages.find((m) => m.from === 'user')
    // HACK: detect if the conversation is new
    if (conv.title !== 'New Chat' || !userMessage) {
      return
    }

    const prompt = userMessage.content
    const title = (await generateTitle(prompt, conv.model)) ?? 'New Chat'

    return title
  } catch (cause) {
    console.error(
      Error('Failed whilte generating title for conversation', { cause }),
    )
  }
}

export async function generateTitle(prompt: string, model: string) {
  const messages: EndpointMessage[] = [
    {
      from: 'system',
      content:
        "You are a summarization AI. Summarize the user's request into a single short sentence of four words or less. Do not try to answer it, only summarize the user's query. Always start your answer with an emoji relevant to the summary",
    },
    { from: 'user', content: 'Who is the president of Gabon?' },
    { from: 'assistant', content: '🇬🇦 President of Gabon' },
    { from: 'user', content: 'Who is Julien Chaumond?' },
    { from: 'assistant', content: '🧑 Julien Chaumond' },
    { from: 'user', content: 'what is 1 + 1?' },
    { from: 'assistant', content: '🔢 Simple math operation' },
    { from: 'user', content: 'What are the latest news?' },
    { from: 'assistant', content: '📰 Latest news' },
    { from: 'user', content: 'How to make a great cheesecake?' },
    { from: 'assistant', content: '🍰 Cheesecake recipe' },
    {
      from: 'user',
      content: 'what is your favorite movie? do a short answer.',
    },
    { from: 'assistant', content: '🎥 Favorite movie' },
    {
      from: 'user',
      content: 'Explain the concept of artificial intelligence in one sentence',
    },
    { from: 'assistant', content: '🤖 AI definition' },
    { from: 'user', content: 'Draw a cute cat' },
    { from: 'assistant', content: '🐱 Cute cat drawing' },
    { from: 'user', content: prompt },
  ]

  try {
    const { text: summary } = await bot.invoke({
      messages,
      model,
      controller: new AbortController(),
    })
    // add an emoji if none is found in the first three characters
    if (!/\p{Emoji}/u.test(summary.slice(0, 3))) {
      return '💬 ' + summary
    }
    return summary
  } catch (cause) {
    console.error('Failed while generating title', { cause })
  }
}
