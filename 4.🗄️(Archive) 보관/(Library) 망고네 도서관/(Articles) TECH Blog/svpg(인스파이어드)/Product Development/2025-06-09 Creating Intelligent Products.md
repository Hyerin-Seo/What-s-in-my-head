---
title: "Creating Intelligent Products"
url: https://www.svpg.com/creating-intelligent-products/
date: 2025-06-09
author: Marty Cagan
category: Product Development
tags: [gen-ai, generative-ai, product-development]
source: SVPG (svpg.com)
유형: 책
구역: 4.archive
분류:
  - (Library) 망고네 도서관
주제:
상태:
요약:
작성일: 2026-09-23
마감:
커버:
상위:
링크:
담당:
작성자:
---

# Creating Intelligent Products

This is an article about the potential future of the products we will create, and how we will create those products.

However, to understand where we’re heading, we need to look back over the past 40 years.

Consider this quote:

“Applying AI to the software development process is a major research topic. There is tremendous potential for improving the productivity of the programmer, the quality of the resulting code, and the ability to maintain and enhance applications…we are working on intelligent programming environments that help users assess the impact of potential modifications, determine which scenarios could have caused a particular bug, systematically test an application, coordinate development among teams of programmers…other significant software engineering applications include automatic programming, syntax-directed editors, automatic program testing…”

When I asked ChatGPT the most likely source of this quote, it suggested that it is very similar to several recent articles and papers, from both industry and academia, mostly from the past year.

But the crazy truth is that this quote is from the [very first article I ever published](https://www.svpg.com/the-hp-ai-workstation/), way back in March of 1986. That is not a typo.

I’m not sharing this to highlight how old I am, or to brag about being able to predict anything. In fact, we were truly clueless about just how hard it would be to solve these problems.

But it is true that I’ve been thinking about creating these types of intelligent products for a very long time, and I have been watching the various attempts over the years at different approaches to AI, with more than an average amount of interest.

What I wanted to discuss in this article, is the nature of the products I believe that most of us will be working on for at least the next several years. Not all of us, but most of us.

I’m referring to these types of products as “intelligent products,” which is meant to reflect a blend of deterministic and probabilistic approaches, where the intent is to create substantially more useful and valuable solutions for our customers.[1](https://www.svpg.com/articles/#b62de156-2537-4bb1-98fc-3a643c52fbec)

If you do read the 1986 article, you’ll see that our main approach at the time to creating intelligent applications was an approach referred to as [expert systems](https://en.wikipedia.org/wiki/Expert_system). The idea was to try to capture the decision making process of human experts, mainly in the form of rule-based systems, and use logic (inference engines) to come to conclusions.

Now to be clear, I was just a young engineer working on building small parts of all this[2](https://www.svpg.com/articles/#bf6b413c-517d-4c23-b6ce-288d00efc81e), but I do remember tagging along on one of the interviews with a physician at Stanford, where I first realized that maybe we were barking up the wrong tree when it came to solving these types of problems.

The “knowledge systems engineer” was asking the physician about what his decision process was in some clinical situation. If I remember correctly, this was about patient monitoring.

But it quickly became clear that the scale of the rules that would need to be captured was really beyond anything we knew how to deal with, but even more importantly, I remember the doctor explaining that yes there are many rules that you essentially learn in med school, but he told us that what he really did was make “educated guesses based on *probabilities*,” and then he would run specific tests when possible to either confirm or rule out that guess.[3](https://www.svpg.com/articles/#e609dbd7-ec7a-4195-b598-566172cbfc2f)

In hindsight it’s not hard to understand why the early approaches to AI were not going to deliver the results we were seeking.

But the real point here is that *probabilistic solutions are not edge cases*. They are *integral* to creating intelligent solutions.

If a human, or a foundation model, makes predictions about what is most likely, then when the predictions prove to be mostly right, we consider that person or model “intelligent,” even if at times the guesses are incorrect.

I would argue that this applies to virtually every type of expertise – from diagnosing a broken engine, to forecasting sales, to providing investment advice, to developing a new medication.

I view probability as central to intelligence, not an alternative.

Why am I making such a big deal about this point? Because I keep hearing from product teams, especially in the B2B space, that while probabilistic solutions might be “intriguing” they believe they are not relevant to their mission-critical, regulated or compliance-constrained businesses.

It’s also important to remind product teams that intelligent products include more than just generative AI based solutions. There are several other very important classes of AI products.

While [ChatGPT](https://openai.com/) and [Midjourney](https://www.midjourney.com/home) are probably the “killer apps” that awoke the world to the potential of AI in general, and generative AI in particular, maybe the single most impressive intelligent product that I’ve personally experienced thus far is the [Waymo Driver](https://www.youtube.com/watch?v=hA_-MkU0Nfw).[4](https://www.svpg.com/articles/#ff7ec67a-47a6-4090-86c7-343a6dc2bbcb)

If you consider for a moment the larger problem of autonomous driving, it’s not hard to imagine some of the many hard problems that need to be solved in order to provide an effective intelligent product. The Waymo product currently represents more than a decade of product discovery and delivery, with a gradually expanding rollout, along with continuous learning and improvement.

And to be clear, this technology is responsible for not only getting you to your destination, but also to comply with laws, and to protect the lives of the passengers, pedestrians, cyclists and other drivers.

This product encounters new situations constantly, and must consistently make good decisions.

But imagine the aggregate power of all 1500 cars in the fleet learning from what each car encounters every day, representing over 50 million miles of real world driving, and more than 20 million miles of simulated driving per day.[5](https://www.svpg.com/articles/#7f573c68-c207-49dd-bcbc-5cfab67789d1)

And there are other truly impressive machine-learning-based intelligent products that you may have been using and not realized the extent of the AI technology behind the product. [Google Translate](https://translatepress.com/history-of-google-translate/), [Spotify’s Discover Weekly](https://www.svpg.com/product-model-at-spotify/), and [Netflix Recommendations](https://www.argoid.ai/blog/netflix-ai) are a few good examples.

And yes, generative AI is already contributing some very impressive examples of intelligent products, even beyond generating text, voice or images. Some of my favorites include [Shopify Magic](https://www.shopify.com/magic), [Cursor AI](https://www.cursor.com/en), and [Tome](https://tome.app/).

Now, I am not an AI researcher. I am just trying to encourage product people to think beyond products as either purely deterministic, or purely probabilistic. Moreover, I hope to encourage product creators to embrace probabilistic behavior not as a bolted on feature, *but as a key to intelligent products.*

My belief is that product teams need a more nuanced view of the distinctions between deterministic and probabilistic solutions, and that going forward it will be common for our products to contain a blend of both.

I expect that many of the most valuable uses of AI will be in situations where probability is precisely what is used by human experts, and what is needed in a solution.

1. Note that I’m not referring to Artificial General Intelligence (AGI) here both because I have no idea if and when that will be achieved, but more importantly, this is not required for the types of products I’m referring to here.
[↩︎](https://www.svpg.com/articles/#b62de156-2537-4bb1-98fc-3a643c52fbec-link)
2. I mainly worked on an object-oriented implementation of an integrated development environment (IDE).
[↩︎](https://www.svpg.com/articles/#bf6b413c-517d-4c23-b6ce-288d00efc81e-link)
3. Some years later, neural networks emerged as a very different way to try to represent knowledge and data, and you can trace today’s successful AI products to that approach.
[↩︎](https://www.svpg.com/articles/#e609dbd7-ec7a-4195-b598-566172cbfc2f-link)
4. As of this writing, the service is live in four major US cities (SF, LA, Phoenix and Austin), and I’d encourage anyone that has not yet experienced the product to book a ride if you have the opportunity.
[↩︎](https://www.svpg.com/articles/#ff7ec67a-47a6-4090-86c7-343a6dc2bbcb-link)
5. To see an example of how to evaluate the efficacy including safety of an intelligent product such as autonomous driving, see [this dashboard](https://waymo.com/safety/impact/).
[↩︎](https://www.svpg.com/articles/#7f573c68-c207-49dd-bcbc-5cfab67789d1-link)
