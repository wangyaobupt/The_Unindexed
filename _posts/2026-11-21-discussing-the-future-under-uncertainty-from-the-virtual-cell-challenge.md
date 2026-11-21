---
layout: post
title: "在未知下探讨未来：从 Virtual Cell Challenge 说起"
---

上学的时候，我被训练过：事实和观点应该分开。事实没有争议，但对未来的观点呢？如果两个理论都能解释同一个事实，是在“找到正确答案”前按兵不动，还是遵循内心选择一个方向，边干边摸索呢？

最近恰好遇到了这样一个 Fact，在当下二级市场云谲波诡的多事之秋，我想拿来作为一个案例讨论。

## 一个事实

Arc Institute 举办了 Virtual Cell Challenge 2026，比赛结束后，主办方发布了结果报告 **[Virtual Cell Challenge 2026: Winners and Wrap-Up](https://arcinstitute.org/news/virtual-cell-challenge-2026-wrap-up)**。

其中关于前三名技术方案的讨论如下：

> Notably, all three winning entries were modular pipelines rather than single end-to-end models that map a control state and a perturbation to a population of cells.

一篇中文讨论的标题更直接：[那些“虚拟细胞公司”到底在狂欢什么？](https://mp.weixin.qq.com/s/f3bZpC4KtavGzoV6TRuZSQ)。这篇讨论的逻辑并不难懂：从 2024 年 Cell 上发表的那篇 AI Virtual Cell 的 Perspective 开始，“业界主流”就认为基础模型是解决虚拟细胞的唯一路径，然而，今年的比赛证明的是，在真正的 zero-shot 迁移问题上，基础模型不如统计方法。

## 两种解释

观点 A：这就是 Sutton 在 The Bitter Lesson 中描述的“always helps in the short term, and is personally satisfying to the researcher”的人工知识方法。从长期看，纯粹计算方法一定会打败人工知识设计。让我再次引用 Sutton 老师的原话：

> 3) in the long run it plateaus and even inhibits further progress, and 4) breakthrough progress eventually arrives by an opposing approach based on scaling computation by search and learning

观点 B：在面对物理世界，特别是复杂系统（生物系统无疑是一种复杂系统）时，computing 不一定是 silver bullet。

Monologue：我写这句话的时候删改了很多遍，很多次特别想写成“尚未发现证据证明 The Bitter Lesson 成立，但同样没有证据说 The Bitter Lesson 一定不行”。当我写下来之后，我自己立刻意识到，这种逻辑上绝对错不了的句子，不就是 AI 比我擅长得多的语言方式吗？“逻辑上绝对正确”就能通向价值吗？

## Theology

在 2019 年 3 月 13 日，Sutton 老师发表 The Bitter Lesson 的那一天，你可以说这是 Hindsight。然而，此后几年 LLM 的日新月异，无疑证明了他的观点是 Foresight。

Foresight 的说服力是如此强大，以至于提出它的人被认为是 Prophet，所说的话被奉为真理。几天之前，Dario 的如下发言（依据两次发言的大意，见[11 月 13 日对谈](https://www.youtube.com/live/YHEaEpeY3ew)和[11 月 10 日路演](https://www.youtube.com/watch?v=eynv5VR9qos)）也可以看作 The Bitter Lesson 的演化：

> In a mid-November interview, he argued that while experts see clinical trials, manufacturing, and the FDA as permanent bottlenecks, exponential AI growth will tackle them step-by-step. During an IPO roadshow on November 10, he predicted major conditions like cancer and Alzheimer's could become "relics of the past" in under a decade.

其论证依据是“AI 已经在过去几年做到了那么多原本认为不可能的任务，如数学和 coding”，这被很多讨论者奉为圭臬。也因为 The Bitter Lesson 被证明了如此多次，相信 general computing 已经是一种 Theology。任何一个对本领域稍有了解的人，如果胆敢对 The Bitter Lesson 有任何怀疑，他自己就首先会被社区驱逐。我写下这段话时没有任何反讽的含义，我真诚地感谢 Sutton 老师在 The Bitter Lesson 中指出的方向，让我这些年少走了不必要的弯路。

## Into the unknown: on boundary

写到这里，我发现自己都快管不住自己的手了。我想基于这次 Virtual Cell Challenge 的结果讨论 The Bitter Lesson 的边界，但每次写到边界的时候，我都像触电了，不可控制地退几步回来，怕被说成“被 AI Scaling 抛弃的废物”。

但就像 Sutton 老师发表 The Bitter Lesson 的那一刻一样，人需要面对未知的未来，做出方向判断，即便这个方向判断可能是错的。有判断才有行动，有行动才有未来。

本次比赛结果让我更加倾向于“在面对物理世界，特别是复杂系统（生物系统无疑是一种复杂系统）时，computing 不一定是 silver bullet”。我还无法说清计算能解决的问题边界在哪里，但下面是我的几个观察：

- 以本次竞赛来说，第二名使用的是纯粹的公开数据。理论上讲，任何其他参赛队都具备和第二名一样的数据和 AI 工具。如果 AI 已经足够作为科学探索工具，那么应该有大量和第二名接近的方案，实际并没有。这对“AI Scientist”，特别是“AI 能开展原创性科学研究”是不利证据。

- 跳出本次比赛，此前被攻克的下棋、图像语音识别、自然语言 Chatbot、数学、代码，无一例外都是在人类构建的数字世界范畴内。

- 面向物理世界，如果你可以给它装一个数字世界的 Wrapper，那也行得通。比如拼多多的电商系统。货物的生产、流通是物理世界问题，但价格信号是数字世界的问题，同时价格信号又可以直接调度生产流通，这就是 wrapper；消费者的满意度是亿万个头脑内部的问题，但平台曾提供的“仅退款”这个按钮是数字世界可控的问题，这个按钮就是 wrapper。只要有了 wrapper，算法就能控制亿万人之间的生产、消费行为。

- 同样是物理世界，如果无法找到 wrapper，比如自动驾驶，即便是原教旨主义的旗手 Elon Musk，其面向消费者的 [FSD 仍然需要驾驶员监督](https://www.tesla.com/support/fsd)。

## Ending

作为一个人，要在未来还不确定的情况下采取行动，就必须基于自己不完备的观察、片面的看法、残缺的知识做出判断，并依据判断投入现在的精力。这种“投入今天的精力，追求明天的可能性”，是人对世界产生影响的必要条件。虽然我对 The Bitter Lesson 的边界不确定，但我非常确定的是，在这样的 Uncertain 条件下做决策，是任何一个人都必须面对的课题。

所以，我今天才会对 The Bitter Lesson 的边界写下上述讨论，它可能是错的，但我得先有方向，才能动起来。有判断才有行动，有行动才有未来。
