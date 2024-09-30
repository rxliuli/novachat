import type { Message } from '$lib/types/Message'
import { Random } from 'mockjs'
import code1 from './code1.md?raw'

export const EXAMPLE_MESSAGES: Message[] = [
  '你能帮我写一首古诗么？',
  `
当然可以。以下是我为您创作的一首古诗:

秋夜思

皓月当空照,
清风拂面来。
树影婆娑动,
虫鸣声声哀。
远山如黛淡,
近水似镜开。
独坐临窗畔,
思绪万千怀。

这首诗采用了七言绝句的形式,描绘了一个秋夜的景象,表达了诗人的思绪。希望这首诗能够符合您的期望。如果您有任何特定的主题或风格要求,我也可以尝试根据您的需求进行创作。
  `,
  '再生成一首',
  `
好的,我再为您创作一首古诗:

春日田园

春风拂柳绿如烟,
桃李争妍满园鲜。
蝶舞蜂喧花间闹,
鸟啼婉转枝头传。
农夫挥锄勤耕作,
牧童骑牛笛声悠。
一片田园春意闹,
此景此情最惬怀。

这首诗采用了八句七言诗的形式,描绘了一幅生机勃勃的春日田园景象。诗中包含了视觉、听觉等多种感官描述,试图营造出一个充满生机与活力的春天氛围。希望这首诗能够给您带来愉悦的感受。如果您还有其他要求,我很乐意继续为您创作。
  `,
].map((it, i) => ({
  content: it,
  from: i % 2 === 0 ? 'user' : 'assistant',
  id: Random.id(),
  createdAt: Random.datetime(),
  updatedAt: Random.datetime(),
}))

export const EXAMPLE_MESSAGES_2: Message[] = [
  '帮我生成一个入门的 chrome 插件',
  code1,
].map((it, i) => ({
  content: it,
  from: i % 2 === 0 ? 'user' : 'assistant',
  id: Random.id(),
  createdAt: Random.datetime(),
  updatedAt: Random.datetime(),
}))
