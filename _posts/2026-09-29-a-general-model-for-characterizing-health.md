---
layout: post
title: "刻画健康的通用模型"
---

本文的讨论缘起于如下论文：

[A world model simulates the latent dynamics of human health](https://doi.org/10.64898/2026.09.19.26363460)

但本文不是论文复述或总结，亦不是针对论文的评审意见。

以这篇杰出的工作作为基础，我想通过这篇文章讨论“刻画健康的通用模型”这一长期困扰我自己的问题。

## Introduction

引文Abstract开篇前两句话清晰明了地点出了不可直接观测的“健康”与可以在不同时刻以不同手段测量的结果之间的差异，这与我的想法完全一致。

> Human health is a single underlying state that no measurement observes directly. Diagnoses, blood tests, molecular profiles and images capture different facets at different times.

接下来，引文作者给出了他们对自己工作的定位：

> HealthFlux, a … model that learns **the latent dynamics of health** from …

**Wait, ‘the latent dynamics of health’?**

这个词听起来像是圣杯，假使学到了，那么宏观尺度上的健康相关问题可能会像GPT解决语言问题那样被“通用地”解决。你不再需要针对每个专科疾病设计精巧的风险预警、诊断预测、治疗响应等模型，one model for all在理论上是可行的。

在Abstract的其他部分，作者通过大量的实验结果为one embedding for all tasks猜想提供了相当强的支持。所以，这是一篇杰出的工作。更因为此，我们得看得更细，它到底是怎么学到的？

## Objective Function

equation (7):

$$
\mathcal{L}_{WM} = \mathcal{L}_{event} + \mathcal{L}_{time} + 0.01D_{KL}(q_{\phi}\|p_{\theta})
$$

从这个损失函数来看，模型的优化目标包含三件事：

1. 能不能准确预测到下一个事件, i.e. What
2. 能不能准确预测到下一个事件何时发生, i.e. When
3. 在观测到新证据之前内部状态的分布 $p_{\theta}$，与观测到新证据之后的内部状态分布 $q_{\phi}$ 之间的距离

其中，第三点描述的是：看到新证据以后推断出的隐状态分布(posterior)，不要无必要地偏离模型在看到这项证据以前根据既往轨迹所预期的分布(prior)。这里既然提到“不要无必要地偏离”，那就要说明什么情况下可以偏离：如果新证据对于预测后续事件及其时间足够重要，模型可以付出这项KL代价进行较大的修正。0.01就是控制“必要性”的经验参数。

## 基于这样的损失函数，学出来的隐状态真的是 ‘latent dynamics of health’ 吗？

### 反面理由

- event和time不单纯是由“健康”或者生物属性决定的，而是受到医疗服务可及性、支付、患者本人意愿等多重因素的影响。给定上述损失函数定义，模型fit得越好，会不会学到的只是“预测”，而不是“健康”？

### 支持性证据

- UKB本身足够大（500k参与者），在独立测试集上的结果证明了模型对于未来20年的疾病预测能力相当准确，模型肯定学到了与未来何时发生某种疾病有关的关键特征，这不可能与健康无关。
- 作者专门做了“虚拟临床试验”，run “medication on” versus “medication off” from the **same pre-medication state**（Fig. 4），其预测结果与已发表的数据高度一致。
    - 此处有一处小瑕疵，可能存在selection bias，但暂且略过：The paper says the 210 medication–endpoint comparisons were **“selected for numerical agreement,”** requiring relative deviations of no more than 18%.
    - 作者自己在Fig. 4的Caption也注明 the action-conditioned simulations **“should not be interpreted as patient-level causal treatment effects.”**

### 到底学到了什么

我们把假说和引文的实验证据分层列出：

1. 隐状态包含了可以用于预测未来临床事件和发生时刻的有用信息。现有证据证实了这一点。
2. 隐状态参数化了未来临床事件轨迹的分布。我认为引文已经提供了相当有力的证据：模型不仅预测单一终点，还可以递归采样下一事件及其时间，将生成事件重新写回状态，并在长期模拟中保持对真实人群结局的预测能力。
3. 隐状态捕捉到了底层生物健康的动态过程。这里作者的跨模态实验和“虚拟临床试验”已经开始提供支持性证据，但距离确认这一更强的解释仍有缺口。

## 到底什么是“健康状态”，怎样才算建模刻画了“健康状态”？

你只能测量一个人的临床指标，没有人能直接观察到“健康状态”。

所以争论一个模型是不是刻画了“健康状态”，不能看它和某个金标准是否接近，得看它的行为是否做到了以下几点：

- Predict diverse future biological measurements: 假设t时刻之后没有任何肾脏相关检查，让隐状态基于其他测量结果继续演化数年，直到某一天，要求使用这个状态预测 eGFR / 尿液相关biomarker / 肾脏影像特征 / 症状变化。如果这个模型能相对准确地同时预测所有这些跨模态的测量结果，那么它捕捉到“健康”状态的可能性就很高。引文的工作很大程度上做到了这一点。

AND

- Remain invariant to changes in observation mechanism: 健康状态不应该因为观察手段的差异而变化。考虑两个国家A和B，它们的临床检查频率、保险政策、转诊规则等差异巨大。如果一个模型在A国家学到隐状态 $z_t$，到了检查频率、保险政策、转诊规则均不同的B国家，只需要调整“如何从状态产生观测”的部分，而隐状态的主要动态结构仍然能够解释和预测B国家的**生物学测量及其变化**，那么这才是更强的证据：模型捕捉到的不是A国医疗系统的运行规律，而是某种更接近底层健康过程的结构。
- 类似地，对于同一个地区A，不同时代也会存在不同的筛查策略、保险政策等要素变化。如果 $z_t$ 不因为这些外部因素而跳变，那么它捕捉到“健康”状态的可能性就很高。

AND

- Respond correctly to biological interventions: 正如引文中做的虚拟临床试验，任何号称捕捉到“健康”状态的模型都必须能够对外部扰动给出准确的响应。这里甚至要包含对于此前没见过的扰动形式（新药）给出响应。引文给出的证据是人群层面的，还没有个体层面，且存在选择偏倚的瑕疵。

这里仍然没有一个可以拿出来与 $z_t$ 比较的“真实健康状态”作为金标准。即使把临床诊断换成蛋白组、MRI或者连续生理指标，我们也只是换了一扇观察健康的窗口，并没有直接观察到健康本身。因此，上述标准不是为了“证明 $z_t$ 就是真实健康状态”，而是在不断增加彼此相对独立的约束，使其他解释越来越困难。**换言之，目标不是恢复某个唯一、可验证的内部坐标，而是寻找一个能够同时经受不同观察窗口检验的动态表征。**

所以，重建“健康状态”这个任务本身，可以被表述为：

> recover a latent dynamical state sufficient to explain and predict a broad set of biologically grounded observations across measurement modalities, timescales, environments, and interventions.

## Ending

Once again，引文是近年来我读到的临床风险建模中最接近“数据驱动”、scalable的工作，其指向的one model for all方向虽然在其他领域已经验证，在临床风险预测方面却一直缺乏有力的成果。引文补上了这个环节：给定足够的数据，是可以学出来“未来临床事件轨迹的分布”的参数化表征的，这可能是通用医学模型的新基线。

它也无心插柳地回答了“临床数据到底有没有用”、“是不是通用语言模型就能解决临床健康问题”等等一系列问题。至少，它给出了一个很有力的反例来回应两种极端观点：临床纵向数据并非因为稀疏、异步、受医疗过程影响就无法学到通用结构；另一方面，把医学问题简单归结为语言建模，也会遗漏这些数据中关于时间、测量和生物过程的结构。

同时，我也看到，建模“健康状态”这个任务本身仍然非常复杂，当前计算机领域专家的注意力还是在“预测疾病诊断”，如何更全面地扩展，实现当观测手段变化后保持不变性，实现个体层面的因果推断，仍然是这个领域的机遇与挑战。
