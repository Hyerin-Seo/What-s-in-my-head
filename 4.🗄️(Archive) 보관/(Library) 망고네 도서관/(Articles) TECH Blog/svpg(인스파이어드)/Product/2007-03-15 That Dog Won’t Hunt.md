---
title: "That Dog Won’t Hunt"
url: https://www.svpg.com/that-dog-wont-hunt/
date: 2007-03-15
author: Marty Cagan
category: Product
tags: [minimal-product, product-discovery]
source: SVPG (svpg.com)
유형: 자료
구역: 4.archive
분류:
  - (Library) 망고네 도서관
주제:
상태:
요약:
작성일: 2026-09-23
마감:
커버:
상위: "[[📖 SVPG(인스파이어드)]]"
링크:
담당:
작성자:
---

# That Dog Won’t Hunt

In the previous article I argued for some very significant changes to the way most teams produce software. Several of you wrote to me and asked that I elaborate on my final point, which had to do with the fact that once you have a product definition that works, you can’t just “piecemeal” it up and expect the same results. I believe this is a hugely important point, and gets to the underlying reason for a great many failed products and wasted releases.

Have you seen this movie before? The one where the product manager comes up with this great PRD that is packed with features, all clearly marked as P1/Must Have, P2/High Want, or P3/Nice to Have. Then he hands the PRD off to engineering, and they estimate the costs of the various features, and lay the features out against their staff availability, and they come up with a schedule that’s typically months longer than the product manager needs, so then the negotiating game starts – arguing estimates, cutting features, minimizing QA and beta times, trying to hire some extra contract staff, etc, all while the clock is ticking. I’m sure you know the story. Even if you haven’t seen the movie you can guess the ending. The product that eventually ships is far from a coherent whole; and nobody is happy with it – not the product manager, not the engineers, and definitely not the end-users.

Many teams think this is just how the game is played. But this is really just the natural consequence of a flawed process.

Instead, I argue for a very different model:

First, the job of the product manager, working with his designer, is to come up with a high-fidelity prototype with the minimal functionality necessary to meet the business objectives, yet with a user experience that users can figure out how to use and actually want to use. The reason it’s so important that the team come up with the minimal functionality, is that you all want to minimize implementation time and complexity, and also because it’s actually more likely the user experience will be good if there aren’t extraneous features.

Second, starting at the very beginning of this design process, someone from the engineering team (typically an architect or lead engineer), needs to participate in reviewing the product ideas as expressed in the prototype, so that he can help the product manager and designer understand the relative and absolute costs of the various product ideas. He can point out any dangerous directions the product might be heading in, or he can go investigate any areas he’s unsure about. But by the time the prototype is ready, this architect must have provided detailed estimates of the surviving features, so the many trade-offs of what is in and what’s cut have already been made, and made collaboratively, and at this point the engineering team must have a detailed estimate that they can commit to.

Third, it’s essential that this prototype be validated (tested) with real target users. Before committing the resources of the full product team, the product manager and designer must be confident they have come up with something that will succeed. It’s not enough to just believe the product definition is good, you have to test to make sure. You wouldn’t allow an engineer to ship code just because they believed it was good, you must test that code to make sure.

This is why once you’ve come up with this minimal product and have tested it with target users to the point that you have evidence that it will work, you can’t later just cut out some more features and assume that it’ll still work with users. If you could, then you didn’t really identify the minimal product earlier.

You will still have some cases where you have the same tough decision – a common situation is when one or more features takes engineering longer to build than they anticipated – but in this model, the normal response is a schedule slip rather than a feature cut. Remember, you’ve already done the cutting. The good news is that the estimates in this process are better than normal because engineering a high-fidelity prototype to base an estimate on rather than a paper document, they have had more time to evaluate the functionality, they feel more ownership in their estimates, and there is also less product to build, so when slips do occur, they’re not as severe or frequent as we are used to.

Similarly, once the engineering is underway, the product manager can’t just keep tossing in additional requirements, for essentially the same reasons. The good news here is that by far the most common reason that product managers add features is a consequence of not really thinking through the requirements in the first place, and the high-fidelity prototype will force most of these issues to the surface much earlier in the process.

Some people think that Agile methods like Scrum address these issues but in a different way. While I would love it if most teams switched to Agile methods tomorrow, as they really can make a positive difference, you’ll find they don’t really address these issues, and they create a couple of their own as well. More about that in an upcoming article.

So by all means prioritize as you’re thinking about the requirements and what’s most important, but by the time you come up with your final spec, make sure your product is already the minimal possible, and then yank all those P1/P2/P3 annotations from the spec, and make it clear to the team that this spec describes a whole product, and if you remove a leg, then as an old boss of mine would say, that dog won’t hunt.
