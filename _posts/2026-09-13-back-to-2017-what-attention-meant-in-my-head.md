---
layout: post
title: "回到2017，我头脑中的Attention是什么？"
---

虽然开头的数学有点长，但这不是一篇讲解 Transformer 的文章。这是我重新走回 2017 年的那条路。

过去几天，我重新从数学上读了一遍 Attention。出发时只是想补一堂九年前没有认真学过的课，却意外回答了另一个问题：**假使回到 2017 年，我究竟 miss 了什么？**

答案不是某个公式，也不是所谓的 taste，而是当时的我没有看见公式背后的**结构**。

更有意思的是，当我带着这层理解回到 2026 年，再看今天被尝试应用到完全不同领域的Transformer，我发现另一个几乎相反的问题正在出现：

**2017 年，我们可能低估了一个通用结构；2026 年，我们会不会又把一个在特定领域取得巨大成功的结构，误认为了普遍规律？**

# Prologue

## What

我们先开始复习功课，Attention的数学表达A(X)如下

$$
Y = A(X)XW_V = A(X)V
$$

$$
A(X) = softmax(\frac{XW_Q(XW_K)^T}{\sqrt{d_k}}) = softmax(\frac{QK^T}{\sqrt{d_k}})
$$

第二行的 $QK^T$ 实质上是一张全连接的计算图，将这个matrix定义为S，则

$$
s_{ij} = x_i^TMx_j/\sqrt{d_k}
$$

in which, $M = W_QW_K^T$，这是一个head。如果你有multi-head，那就有多个不同的M。

然后，X是什么？只是输入序列的embedding构成的matrix吗？
如果这么想，你就会发现，如果交换X的不同row（即permutation，shuffle输入序列的顺序），上面的Y具备permutation equivariance性质，$Y(PX) = PY(X)$。

对于人类语言，这合理吗？这不是“bag of vectors”吗？
于是有了Positional Encoding。

在2017的原版文章中，PE函数定义为pos（绝对位置），i（dimension序号，取值范围[0, d/2]）和d（维度数量）的函数。对于(2i, 2i+1)连续两个维度，由i和d决定的角频率，由pos决定旋转量。对于 pos_j = pos_i + abs(j-i)，有可能在某个维度pair上，k恰好等于频率的整数倍，使得pos_j在这个特定维度pair上的PE与前面的i位置的PE相同，然而，因为不同维度pair的频率不同，在整个PE matrix中，不可能出现对于不同的i，j，其PE vector完全相同。

That's it. 

## Why

为什么设计不同频率、周期函数的PE？老师讲过，因为这样的三角函数具备了如下性质

$$
PE(p+k) = R(k)\,PE(p)
$$

序列的相对距离k被表达为几何空间里面的旋转量。Good,
不过2017年的论文只是假设attention会自己学会利用这个几何，直到2021年4月的RoPE（RoFormer, Su et al.）才把旋转显式放进attention的内积里，行业花了四年才把几何显式化。

为什么不使用线性函数做PE，例如$PE(pos) = pos$，暂不考虑pos无限增大的问题，$PE(p+k) = PE(p) + k$，这不也是将“相对距离”k投影到几何空间了吗？
老师进一步循循善诱：
在几何空间中，$R(k)PE(p)$是线性变换：你把PE(p)旋转得到PE(p+k)，旋转量只由k决定。而$PE(p) + k$是向量加法，不具备旋转这样明确的几何含义。进一步，你如果去推公式，会发现 $QK^T$ 将出现p(p+k)这样的相乘项，这不是相对距离，而是绝对位置与相对距离共同作用项，即便可以计算，又代表什么呢？
Good Enough！

站在今天，我坦诚地说，当年我没回答过这个why，甚至没有正经问过。因为大家都在说这篇文章taste很好，我要是去问这样的“细节”，我是不是很low。

## So, what?

关于PE的讨论一言以蔽之：

> 💡 Not merely encode the position information.
> Encode it in a geometry where the operations you want, i.e. relative distance matters on output, become simple.

于是，当今流传广泛的一句话“Transformer is able to find whatever patterns from sequence you give them”，需要先说一个前提：你要研究的sequence-to-sequence任务的信息来自什么结构，你如何把这个结构embedding到适合线性代数计算的几何空间。
即便在今天，无数个讲解Attention的课堂/教材里，能谈到“what geometry they inhabit”的时刻仍然并不常见。

# 假使回到2017，我miss了什么？

Attention不是2017年出来的新词，从15年开始，大家用RNN/LSTM做NMT任务的时候，就发现了the decoder could dynamically weight different encoder states，所谓attention layer。在2017年那一刻，我读完这篇文章，头脑中真实的反应只是softmax。这是another attention paper。

## 我遗漏了什么？

“Attention is **ALL** you need”

- 此前人们需要设计复杂的“计算结构”，例如LSTM，去表达“记忆”、“遗忘”，计算结构是人设计出来的；attention是器，是一个工具。
- 而本文的作者们，用ALL这个词，在对我说：别去设计计算结构，只要你认为“序列中任意位置i,j之间的关系包含了任务的（近乎）全部信息”, which 对于人类语言和代码基本成立，那么Attention is **ALL** you need

我不是在说绕口令，我是在说

1. attention = communication among positions
2. FFN = local nonlinear computation
3. Stacked Transformer Network is

$$
(communication + computation)^L
$$

简单、可级联。任何scaling的东西，最基本的模块必须是这样的。
至于什么结构是最优的，the bitter lesson早有分教，任何一个人不应该相信他能找到比数据更好的答案。

所以，再问我自己一遍，我当时看漏了什么？
当时的我头脑中没有“结构”和“计算”这样的框架。我看到的是又一个尝试解决NMT问题的神经网络。作者真正在大声说的是：

> 💡 不要过早设计 information flow 的具体路径；设计**一个足够简单、足够通用、可以被数据配置的结构**

## 站在当时，什么是“看到”？

不只是我一个人的限制，如果有足够多的人看到这一层，应该有很多人去研究BERT或者GPT。
更进一步，只有看出这一层，即“Attention is ALL you need”（你不需要设计计算结构）的人，才有可能看出来，这个技术不止是一个更好的NMT神经网络架构，而是

> 💡 （至少适用于人类语言）序列的通用计算架构

如果看出这一层，针对当时NLP的几大类“下游任务”的专门优化就毫无意义，BERT在2018就证明了这一点。即便到了那一刻，行业里说出“（至少适用于人类语言）序列的通用计算架构”的人仍然寥寥无几。
我们还得等两年，the bitter lesson才会面世。
那一刻，只有少数看到了“结构”的人，才有可能问出一个问题

> 💡 Given transformer's capturing capability, what happens if this keeps working at 10×, 100×, 1000× scale?


## Name matters: 名正则言顺

BERT和GPT是很好的一个案例。

如果你称研究对象是 Bidirectional Encoder Representations from Transformers，你已经认识到这是通用任务了，Encoder Representations不需要管下游任务是什么。Generative Pre-trained Transformer 同样没有任何任务，就是Generative。这两个名字证明了，我今天说的“看到结构”不完全是牵强附会，至少是他们当时想法的一种“可能的重建”。

## 什么不是当时可以看到的？

“web-scale pretraining + RLHF + instruction tuning + tool use”，这些后来的成功的必要配方，不可能、**也不需要**在当时看到。
2017年底的OpenAI和Google Brain，没有人能保证web-scale pretraining带来什么样的结果，CEO也没条件先拿到1T USD去买卡和数据。真正的伟大恰恰是从这个时候开始的。

# 回到2026，这对我意味着什么

抽象地说，在下一次技术变革时看到结构，肯定比2017年知乎上说“你要有taste”管用。但也没有那么管用，谁知道下一次突变时刻我自己的认知准备到了哪一层呢？
所以，我用一个具象的案例来说。
2023-2024期间，Nature系列期刊发表了一系列用Transformer作为“新方法”解决计算生物学问题的文章，特别是用RNA-seq data建立细胞基础模型，乃至AI Virtual Cell的尝试。我直到今天还记得scGPT的开篇

> 💡 texts comprise words; similarly, cells are defined by genes

然而，如我们前面复习时提到的，语言包含顺序，图片的token也包含顺序；而一次RNA-seq的数据集，其中测量了d=20000个gene的表达量，矩阵的第一列“被标记为”gene_1, 随后是gene_2, gene_3, …如果谁真把这个列顺序当作位置，就得先回答：谁分配的这个顺序，gene_1和gene_2的间隔1存在任何已知的意义吗？
事实上，scGPT和Geneformer都主动放弃了顺序——前者用gene name做token、不加positional encoding，后者按表达量排序做rank-value encoding——于是问题变成：放弃顺序之后，序列里还剩下什么结构？

进一步，RNA-seq数据包含virtual cell任务所需的所有信息吗？Virtual Cell想要做一个cell的digital twin。Cell是动态、开放系统：RNA翻译成蛋白质之后，蛋白质的功能（结构）、运动对整个细胞都有影响，而蛋白又受到细胞内外微环境的影响。RNA-seq在多大程度上包含了这些信息呢？更进一步，“假使我们perturb这个cell，接下来这个cell的状态会怎样变化”，要回答counterfactual问题，总得学出来因果规律吧，大量观察性原始数据是否包含呢？

这一串问题就不是“人来设计计算结构”的问题，而是“任务目标是否在序列中全部包含”的问题。前者我认同The Bitter Lesson，但后者是科学问题，“RNA-seq数据包含了虚拟细胞所需的全部信息”是比“人类语言包含了NLP任务的全部信息”强得多的假设。假设越强，越需要证据。
这就是我要讲的故事，我不是说Virtual Cell做不成，很可能通过非Transformer路线，或者找到更好的几何表征、更多的数据后Transformer也能解决。重点是，

> 💡 领域A的方法应用到领域B的时候，两个领域的哪些根本性质差异会对方法产生影响？

不回答上面的问题，我只能用一句很模糊的话提醒你：
"Attention is all you need" does not grant you "Scaling is all you need". Scaling only works after you ask what is being scaled.
