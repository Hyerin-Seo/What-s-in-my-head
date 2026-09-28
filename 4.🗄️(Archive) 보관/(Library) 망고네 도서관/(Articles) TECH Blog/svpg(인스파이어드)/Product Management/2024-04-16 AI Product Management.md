---
title: "AI Product Management"
url: https://www.svpg.com/ai-product-management/
date: 2024-04-16
author: Marty Cagan
category: Product Management
tags: [ai, ai-product-management, gen-ai, generative-ai, product-management, product-risks]
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

# AI Product Management

By Marty Cagan and Marily Nika

*Marty’s Note: Recently I have co-authored a few articles allowing me to highlight different product coaches, and in this article, I’d like to highlight [Marily Nika](https://www.linkedin.com/in/marilynika/). Marily specializes in helping product teams create AI-powered products and services. She has a PhD in machine learning, and has had an impressive career building AI products at both Meta and Google, and she runs a [popular course](https://maven.com/marily-nika/ai-pm-bootcamp) teaching product managers what they need to know to build effective AI-powered products.* *In [an earlier article](https://www.svpg.com/preparing-for-the-future/), I wrote about how we can expect AI to impact product teams in general, and the product management role in particular (and Marily served as an expert reviewer in that article). In this article, we discuss the products that these teams build.*

To be clear on nomenclature, when we refer to “AI Product Management” we are referring to *the creation of AI-powered products*.

In very much the same way as “Mobile Product Management” refers to creation of mobile products. And just as how “Mobile PM” was an especially in-demand skill when mobile was new, and now most PM’s are expected to have the skills to develop products for mobile, we expect the same to become true for AI Product Managers. In a few year’s time, we expect most PM’s will need to be skilled at building AI-powered products and services.

## Infrastructure vs Applications

Another important distinction is to clarify that we are focusing here on AI-powered *applications*, and not on the underlying AI infrastructure, which involves the model training process itself.

The distinction is similar to the difference between a platform product and an experience product. The platform product enables the experience products. Both types of products are interesting and important, but the vast majority of AI product managers will be responsible for experience products – the applications – so that’s what we’ll focus on here.

## The Nature of AI-Powered Products

Most products have significant risks, and product teams are cross-functional so that they have the range of skills needed to address those risks. Few products highlight the critical need for strong product management more than AI-powered products.

By “AI-powered products,” we mean products that utilize AI technologies to create experiences that solve problems for our customers or our company.

The term “’AI” includes both traditional AI, such as machine learning, and generative AI. These technologies enable a wide range of capabilities, including smart suggestions, personalized experiences, or matching two sides of a marketplace.

Examples of AI applications include smart home devices that employ speech and natural language understanding to process human voices, fraud detection systems, and, in the case of generative AI, advanced functions like content creation, summarization, and synthesis.

AI-powered products are especially challenging when it comes to the product risks.

And this means that the product manager, the product designer, and the tech lead will need to collaborate closely to come up with effective solutions.

Note that while AI product managers may not have ML scientists as dedicated members of their core product team, especially in the context of AI application products, they will frequently want to consult with ML scientists. This collaboration can be crucial for leveraging underlying AI technologies effectively.

This article tries to make clear the reasons why AI-powered products can be especially challenging.

## Feasibility Risk

Generative AI, by its nature, is probabilistic, not deterministic. For conventional solutions, we can generally count on the fact that if a program is given the same inputs, it will generate a consistent output.

For generative AI powered solutions, there can be literally billions of inputs, and weightings can change as a result of learning, potentially resulting in different outputs over time.

Certain types of products and capabilities are very well suited to probabilistic solutions, and others are not. This is perhaps the most fundamental consideration.

If the product is a personalized news feed, then if, on occasion, a recommendation is not perfectly aligned with the user’s stated preferences, this can likely be managed in the user experience.

However, if the product is controlling a dose of medication, such as insulin, then a dosage outside of medical guidelines would be unacceptable.

So it’s critical that the AI product manager ensures that the technology is a good match for the specific product or solution.

This leads directly to the critical topic of quality assurance. What are acceptable error rates? What are the possible types of mistakes? How will the product handle each type of mistake? Are there ways to mitigate mistakes with the user experience?

Speaking of mistakes, much of the time the focus will be on the training data. The quality of the data used to train the AI model is critical. Product managers need to have a clear and deep understanding of the training data, and how the model has been trained and tuned.

All large data sets have potential biases and limitations. The ethical implications of biases in the data are discussed in *viability* risk below, but the AI product manager needs to be on top of these issues, and understand how the issues may manifest in the final product.

More generally, for many AI powered product efforts today, the major stumbling block is the training data itself. There may not yet be sufficient volume or quality of training data to power a feasible commercial product.

When it comes to feasibility, the AI product manager will need to work closely with the tech lead, and possibly consult with an ML scientist if your company has one, to determine the most appropriate trade-offs.

For example, a highly accurate model might require larger investments in training data, significant processing power and time, and computational resources, impacting the user experience, the scalability and the cost.

It is also important to mention technical debt and infrastructure and address questions such as: Does the company have the necessary technical infrastructure to support the AI product? Consider factors like data storage, processing power, and ongoing maintenance costs. High technical debt can hinder scalability, and overall feasibility and viability.

## Usability Risk

The customer experience is important for any product, but with AI, it takes on a new level of importance and complexity.

For AI products, we need to design user experiences that clearly set expectations about what the technology can and can’t do, and at least conceptually, how the product works. This transparency is key to building trust and avoiding frustration when encountering limitations.

Traditionally, product managers lean heavily on the product designers in terms of building user trust. However, AI introduces an additional layer of constraints and complexities, many of which are coming from the product manager.

We need users and customers to feel comfortable with how their data is used, and what the AI’s capabilities are. This can mean new types of user interactions.

The product designer will need to work hand in glove with the AI product manager to ensure that AI-powered experiences are easy to learn, use, understand and trust.

Furthermore, in many cases, explaining the “why” behind the AI’s decisions and behaviors can become essential in certain applications. This transparency builds trust, and helps users build confidence in their interactions with the product. What is the level of explainability needed to generate the necessary trust?

As with assessing feasibility, the AI product manager will need to collaborate closely with the product designer to analyze the trade-offs that can impact the user experience. For example, a highly accurate AI recommendation system might take longer to produce results, leading to user frustration. Similarly, a simpler AI model designed for faster processing might struggle with complex user interactions, or less accuracy.

Finding the right balance between accuracy, speed, operational cost, and user experience is essential.

## Value Risk

Value is always a critical risk. AI-powered products hold the promise of significant value, which is why so much of the world is rushing towards applying this technology.

But we can also see many examples today of AI-products that are AI in name only. So the AI product manager’s first responsibility is ensuring that the AI-powered features and products deliver genuine, incremental value to users and customers.

This means solving real problems in ways that are demonstrably better than existing solutions, or even solving problems that otherwise wouldn’t be possible without the new enabling AI technologies.

We want to avoid the temptation to implement AI solely for the sake of marketing or competitive parity. Our job is to ensure the perceived value is clear and compelling.

As with most complex product capabilities, we want to use our range of tools to evaluate value. Normally this means combining quantitative evidence (e.g. A/B testing) with qualitative insights (e.g. user testing).

We also need to collaborate closely with product marketing to ensure we can communicate this value effectively. While on the subject of product marketing, below we discuss important *viability* work around user privacy and ethical data usage, and we want to be sure that, if appropriate, we message these points clearly and effectively as well.

## Viability Risk

While AI holds immense potential especially in terms of providing real value to users and customers, the business viability challenges are often substantial, and mistakes and oversights regarding viability risk tend to dominate today’s news headlines.

For any product, we need to ensure that the product is something that can be effectively marketed, sold, serviced, funded, monetized, and is legal and compliant with any relevant regulatory constraints.

But for AI products, these viability risks can be especially important and challenging.

It is still very early in terms of the unit economics of AI-powered products, but today the costs can be quite high.

Further, for several types of products, there are genuine questions about data provenance and copyright for the training data, biases in that data, and the ramifications of recommendations based on this data.

More generally, companies are still working to understand the legal responsibilities and implications of providing probabilistic solutions to customers.

Last but not least, ethical considerations are an ongoing and growing concern. This goes beyond potential biases in the training data. If users misunderstand a result, or the model hallucinates in a way that creates a danger, what are the legal and ethical ramifications?

Realize that with probabilistic solutions, it is very possible for an AI-powered system to both save lives (by performing a critical task more accurately than humans), yet also put lives in danger (by making a mistake). Companies today must deal proactively with these ethical considerations.

Similarly, the AI product manager must strive to anticipate the consequences of bad actors, using the products in illegal or inappropriate ways. An important part of business viability is protecting the assets and reputation of the company. There may also be societal or environmental impacts, depending on the application. The AI product manager is expected to consider and analyze these risks, and work with the company’s legal team to protect customers as well as the company.

And to be clear, these critical viability risk questions fall squarely on the shoulders of the AI product manager.

## Summary

Hopefully this note makes clear how the product risks are impacted with AI products, and how the AI product manager likely has only more responsibility and obligations to deal with the uncertainties.

The successful AI product manager will require deep knowledge of the users and customers, the data, the business, and the market in order to perform the difficult role that’s required. Moreover, AI literacy is yet another example of the reason why product managers need a strong foundation in technology.

As with mobile PM, over time our expectation is that all PM’s will need to have at least a foundation level of these skills. Most product managers will be expected to be AI product managers in the future, in the sense that it will be expected that product managers understand how the enabling AI technology works, what are the range of risks involved, and the work required to mitigate the risks.
