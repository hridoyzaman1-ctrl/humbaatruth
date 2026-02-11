import { Article, Author, Job, Category, MenuItem, SocialMediaLink, SiteSettings } from '@/types/news';

export const authors: Author[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    email: 'sarah@truthlens.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    bio: 'Senior investigative journalist with 15 years of experience.',
    role: 'editor'
  },
  {
    id: '2',
    name: 'James Chen',
    email: 'james@truthlens.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    bio: 'International affairs correspondent.',
    role: 'reporter'
  },
  {
    id: '3',
    name: 'Amira Hassan',
    email: 'amira@truthlens.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    bio: 'Environment and climate specialist.',
    role: 'reporter'
  },
  {
    id: '4',
    name: 'Michael Roberts',
    email: 'michael@truthlens.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    bio: 'Sports analyst and commentator.',
    role: 'reporter'
  },
  {
    id: '5',
    name: 'Jessica Park',
    email: 'jessica@truthlens.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    bio: 'Entertainment and culture correspondent.',
    role: 'reporter'
  }
];

export const articles: Article[] = [
  {
    id: '1',
    title: 'Soft-shell crab farming / The new gold of Sundarbans coast',
    slug: 'soft-shell-crab-farming-the-new-gold-of-sundarbans',
    excerpt: 'Soft-shell crab farming is emerging as a lucrative business in the coastal regions, offering new hope for economic prosperity.',
    content: `For generations, coastal families living near the Sundarbans have depended on shrimp farming, fishing, timber cutting, and honey collection to survive. Work has always been dangerous. People risk attacks by tigers and pirates, face floods and storms, and must follow strict forest rules. Seasonal fishing bans often leave families with no income for months, making daily survival difficult.

But over the past decade, a new livelihood - soft-shell crab farming - has brought new hope to these communities. The intensive, export-oriented form of aquaculture has expanded rapidly along the south-western coast, offering a steadier income than traditional fishing or shrimp cultivation.

In Satkhira district, particularly in Shyamnagar upazila, the industry has grown into a major source of employment and foreign exchange. It has also created a new set of environmental and regulatory challenges that now threaten its long-term sustainability.

HOW SOFT-SHELL CRAB FARMING WORKS

Up until a decade ago, black tiger shrimp (bagda) - once known as “white gold” - dominated coastal aquaculture. That boom has faded. Disease outbreaks, repeated natural disasters, falling international demand and volatile prices have eroded profitability. Many farmers have shifted to crabs, often farming them alongside shrimp in the same brackish-water ponds.

Crab farming requires less land, involves lower production risks and delivers quicker returns.

“Exporting naturally collected crabs is transforming lives here. It is creating small entrepreneurs and generating employment for many,” said Rajib Joyaddar, owner of Rohan Agro Crab Fisheries in Shyamnagar.

Joyaddar’s farm produces roughly 9,000 to 10,000 kilogrammes of crabs each month. The work is still vulnerable to storms and saline intrusion, but income is more predictable than before.

Women at a Shyamnagar soft-shell crab farm carefully tend individual crabs in floating cages, managing water and feeding to ensure healthy moulting, forming a vital part of the workforce. The photo was taken recently.

Soft-shell crab farming is highly specialised. Crabs are harvested during a brief period immediately after moulting, when their hard exoskeleton has not yet reformed. That window lasts only a few hours.

Farmers collect crab seed, mostly juveniles or sub-adults, from rivers, canals and mangrove creeks around the Sundarbans. Hatchery production remains negligible, forcing the industry to rely on wild stocks. Sub-adult crabs are preferred because they moult faster and survive better in captivity.

Each crab is kept separately in a small plastic box or cage suspended in shallow brackish water. Farmers carefully control salinity, water depth and cleanliness to reduce stress and prevent cannibalism. Crabs are fed small quantities of trash fish or snails every one or two days. Any delay in moulting, often caused by poor water quality, can result in death or loss of value.

When moulting begins, the clock starts. Crabs must be collected immediately, washed and placed in clean or chilled water before the shell hardens again. They are then graded, frozen or processed for export.

An alternative system, crab fattening, has also expanded. Hard-shell crabs bought from local markets are kept in cages for about three weeks, during which they can double in weight.

This method is cheaper, faster and less prone to disease, making it increasingly popular.`,
    category: 'national',
    author: authors[2],
    featuredImage: '/crab-farming.jpg',
    tags: ['agriculture', 'economy', 'sundarbans'],
    isBreaking: true,
    isFeatured: true,
    showOnHomepage: true,
    status: 'published',
    publishedAt: new Date('2026-01-17T08:00:00'),
    createdAt: new Date('2026-01-17T06:00:00'),
    updatedAt: new Date('2026-01-17T08:00:00'),
    views: 0,
    hasVideo: false
  },
  {
    id: '2',
    title: 'The little monarch of Madhabkunda',
    slug: 'the-little-monarch-of-madhabkunda',
    excerpt: 'Discovering the unique biodiversity of Madhabkunda through the lens of nature enthusiasts.',
    content: `The water of Madhabkunda does not simply fall—it sparkles.

It plunges from the heights in a silvery torrent, yet much of it hesitates below, lingering in shallow pools before resuming its restless journey downhill. As the water rushes onward, it gives birth to a chhara—a perennial hill stream fed year-round by the waterfall’s freshwater pulse. Massive boulders stand like ancient guardians, sheltering mosses, lichens, ferns, and stubborn little herbs. Wherever water spares a crack, a crevice, a damp ledge—or even a surprisingly dry niche—life claims its foothold.

These plants have not damaged the rocks; they have claimed them. Small colonies flourish in places that seem impossible to sustain life. Wherever plants exist, creepy-crawlies inevitably follow to feed on them, and the atmosphere around the waterfall was no exception.

Even the 61-metre plunge from the top of the waterfall fails to deter some resolute vegetation. Mosses and ferns cling calmly to the near-vertical rock face, growing along the very wall over which the hissing torrent descends. Water thunders, sprays, and roars—yet life persists quietly, insistently.

A sudden ruler of the falls

Amid this chaos of falling water, slippery stone, and stunted greenery, a sudden movement catches the eye.

A small bird darts across the rocks—fearless, confident, almost defiant. It pauses, stands upright, and flicks its tail.

In that instant, it is clear: this bird has declared himself the top boss of the waterfall.

From the mossy base to the wet rock wall, from sheltered ledges to hidden cracks behind the falling sheet of water, he moves with absolute freedom. He feeds wherever he pleases, snapping up insects and worms flushed out by spray and turbulence. At times, he ventures behind the watery curtain itself, vanishing briefly into the shimmering veil, only to reappear moments later at a chosen vantage point—prey secured.

The bird is unmistakable.

A white-capped, reddish-black fellow—sharp-eyed, alert, endlessly active. His gleaming white crown contrasts starkly with dark rock, resembling a tiny Turkish fez perched proudly atop a crimson robe. Each flick of his tail flashes vermilion red edged with black, vivid against grey stone and silver water. Apart from the white cap, the head, neck, back, wings, throat, and breast are jet black, while the rest of the body glows deep red.

This is no ordinary resident bird.`,
    category: 'national',
    author: authors[1],
    featuredImage: 'https://www.thedailystar.net/sites/default/files/styles/big_580_435/public/2026-01/bird.jpg?h=4cefbda2',
    tags: ['nature', 'wildlife', 'conservation'],
    isBreaking: true,
    isFeatured: true,
    showOnHomepage: true,
    status: 'published',
    publishedAt: new Date('2026-01-17T09:30:00'),
    createdAt: new Date('2026-01-17T07:00:00'),
    updatedAt: new Date('2026-01-17T09:30:00'),
    views: 0,
    hasVideo: false
  },
  {
    id: '3',
    title: 'The lost soul of Jatra',
    slug: 'the-lost-soul-of-jatra',
    excerpt: 'Exploring the declining tradition of Jatra folk theatre and its cultural significance.',
    content: `Today, like many traditional art forms in Bangladesh, Jatra stands on the verge of extinction. What once echoed through open fields and village fairs is now fading into memory. Last December, the Bangladesh Shilpakala Academy organised a month-long traditional Jatra (folk theatre) performance festival to celebrate and support artists striving to preserve the form. Yet such festivals and celebrations are too few and far between to create a lasting impact or bring meaningful change to the lives of these artists.

A theatre of the people

The word Jatra means “journey”, and the name fits well. Troupes travel from one district to another, performing on temporary open-air stages throughout the winter months. In its early days, Jatra drew heavily from myth and religion. By the late nineteenth century, however, scripts began to evolve. Social issues, political resistance, and rebellion increasingly came to dominate the stage.

During the colonial era, British authorities viewed these political undertones as a threat. As the struggle for independence neared its peak, Jatra’s social and political messages became a powerful voice for the oppressed. Another major transformation came with the introduction of women performers, a revolution in its own right.

Modhurima Guha Neogi, in her study “Jatrapala, the Foremost but a Diminishing Art of Bengali Culture,” noted that women’s entry into Jatra was fraught with ridicule and prejudice. For a time, only sex workers dared to step onto the stage. Over the years, however, women from all social classes joined, reshaping the identity of the art form itself.`,
    category: 'entertainment',
    author: authors[4],
    featuredImage: 'https://www.thedailystar.net/sites/default/files/styles/big_580_435/public/2026-01/photo-collected.jpg?h=be16704d',
    tags: ['culture', 'arts', 'history'],
    isBreaking: true,
    isFeatured: true,
    showOnHomepage: true,
    status: 'published',
    publishedAt: new Date('2026-01-16T18:00:00'),
    createdAt: new Date('2026-01-16T10:00:00'),
    updatedAt: new Date('2026-01-16T18:00:00'),
    views: 0,
    hasVideo: false
  },
  {
    id: '4',
    title: 'Why we fail to save our rivers',
    slug: 'why-we-fail-to-save-our-rivers',
    excerpt: 'An in-depth analysis of the systemic failures in river conservation efforts.',
    content: `Our country is a riverine land. Rivers are deeply intertwined with the very formation of this land. Yet, even today, the definition of a river has not been finalised in Bangladesh. Without a settled definition, it is impossible to determine the actual number of rivers. In 2023, the National River Conservation Commission proposed a definition of a river. However, it does not appear that all government agencies have accepted this definition. Had it been accepted, the same definition would have been followed in determining the number of rivers.

Does only what was marked as a river in the British-era CS (Cadastral Survey) maps qualify as a river? Are flows that local people have, for generations, called rivers not rivers at all? Unless it is clearly defined which flow can be called a river, it will never be possible to calculate their number. And without knowing the number of rivers, it is also impossible to say how much river area has fallen into the hands of illegal grabbers.

To our knowledge, during the British cadastral surveys there were no clear guidelines on which flow would be considered a river. Many wide and long flows were recorded as khals (canals), while comparatively narrow and short flows were recorded as rivers. It appears that surveyors simply recorded flows according to the names used locally: what people called a khal was recorded as a khal; what they called a dara was recorded as a dara; similarly khari, dohor, or chhara were recorded as such. As a result, many sections within rivers, canals, daras, chharas, dohors, and kharis were recorded as wetlands or waterbodies.

Officially prepared lists of rivers in Bangladesh have changed year after year. Many of us who have worked on river issues for a long time believe that Bangladesh has more than two thousand rivers. In 2005, the Bangladesh Water Development Board spoke of 230 rivers. In 2011, the same institution reported 405 rivers. In 2024, the National River Conservation Commission stated that there are 1,008 rivers. In 2025, the Ministry of Water Resources of the interim government published a list identifying 1,415 rivers. This list was prepared within a very short period of time by the interim government.`,
    category: 'national',
    author: authors[0],
    featuredImage: 'https://www.thedailystar.net/sites/default/files/styles/portrait_356_475/public/2026-01/river.jpg?h=ed27e282',
    tags: ['environment', 'pollution', 'rivers'],
    isBreaking: false,
    isFeatured: true,
    showOnHomepage: true,
    status: 'published',
    publishedAt: new Date('2026-01-16T14:45:00'),
    createdAt: new Date('2026-01-16T12:00:00'),
    updatedAt: new Date('2026-01-16T14:45:00'),
    views: 0,
    hasVideo: false
  },
  {
    id: '5',
    title: 'Why hospital bills scare Dhaka patients more than disease',
    slug: 'why-hospital-bills-scare-dhaka-patients-more-than-',
    excerpt: 'Rising healthcare costs are becoming a major burden for residents of the capital.',
    content: `In a streak of unfortunate crises, a lot of my family members and friends had to be hospitalised with various health emergencies recently, in all kinds of upscale to medium-range hospital facilities in Dhaka. The experience of running around to deal with the urgency of their medical condition brought me to my current realisation. Before I share my thoughts on hospital care in Dhaka and our ability to access personalised and exclusive healthcare, I would like to state that I have no bias against boutique hospitals, government hospitals, or mid-range hospital facilities in Dhaka or its outskirts. I am not discussing their treatment strategies, nor am I commenting on the healthcare industry as a whole. I am simply acknowledging their effort for prioritising hygiene and aesthetics when building the hospital structures, for offering a wide range of general and niche medical services, for the hospital amenities, and importantly, for their relentless patience in attending to our inane complaints. I say this because on the far end of concierge facilities is a scary experience I once had in a post-operative ward, where the bed had splattered blood marks on the mattress, which was without a proper bed sheet. Believe it or not, cats were roaming freely in the post-operative room! It was my misfortune to land there in an unavoidable health emergency with someone I love, thus my review on how far the hospital care industry has flourished in Dhaka. Having experienced both the north pole and south pole of hospital facilities in Dhaka, I have set my mind on an affordable health facility, simply because the specialised doctors and experts in private hospitals all have a day job at the government institutions. This means we get diagnosed by the best in town, with only a token fee in the state-run hospital facilities. Recently, a friend travelled to Singapore for surgery for a rare and aggressive cancer, at a cost so enormous it exhausted her finances. Coming back to Dhaka, she went to a private hospital for some discomfort; the bill there almost took her to the grave -- again. “I was admitted to a hospital for observation. I found their customer care very amiable, the nursing staff efficient, the food decent, and the cost of my airy room all impressive,” says a friend, who is a consultant in a publishing house. “If I am to think about how much the bill is spiking every hour with each test and diagnosis done, each expert opinion given, then the recovery becomes taxing. Whenever I am in a hospital, regardless of its ratings, I have a nagging feeling about the financial burden I have put my family under and on my savings. The service, if I compare, between the city's boutique hospitals and ordinary ones, I would say that the difference is solely financial, with or without the hospital’s cleanliness fanfare,” she adds. Then again, for many, it is not about money. I was struggling to put my old caretaker, who has dementia, in an old home facility. There is no hospice, rest home, or nursing home for the toiling mass of Dhaka, and hospital bills for them can lead to selling their poor family’s arable lands. I don’t know how many of you have seen the affordable hospitals’ corridors teeming with patients and attendants. The bottom line is that the cost for a clean hospital, good care, and amiable service is directly proportional to our savings account. So, my simple conclusion is that state-run hospitals should be visited by more patients, allowing them to earn enough to care for both people and the hospital’s upkeep.`,
    category: 'national',
    author: authors[0],
    featuredImage: 'https://www.thedailystar.net/sites/default/files/styles/portrait_356_475/public/2026-01/ezgif.com-avif-to-png-converter%20%2884%29.png?h=c06fab7e',
    tags: ['health', 'economy', 'dhaka'],
    isBreaking: false,
    isFeatured: true,
    showOnHomepage: true,
    status: 'published',
    publishedAt: new Date('2026-01-17T11:00:00'),
    createdAt: new Date('2026-01-17T09:00:00'),
    updatedAt: new Date('2026-01-17T11:00:00'),
    views: 0,
    hasVideo: false
  },
  {
    id: '6',
    title: 'Next Step / Why some good leaders stop getting better',
    slug: 'next-step-why-some-good-leaders-stop-getting-bette',
    excerpt: 'Leadership stagnation: Understanding why growth stalls for even the most promising leaders.',
    content: `‘Far enemy’ and ‘near enemy’ are concepts that come from Buddhist psychology and can be very useful in self-development. The idea behind this is that virtues have enemies. A far enemy is the obvious opposite of a virtue. For example, the far enemy of compassion is cruelty, inflicting, or causing suffering. In contrast, a near enemy is something that impersonates the virtue in question but subtly undermines it and is a hidden obstacle to growth. Usually, these concepts are used for cultivating virtues such as kindness, connection, joy, etc., but can also be very useful in unpacking development feedback that we receive from our bosses. The far enemy of empathy is dismissiveness - bypassing emotions in favour of logic or simplicity. Its near enemy is sympathy without accountability. The far enemy of strategic thinking is short-term focus - driven by urgency rather than long-term vision. Its near enemy is over-analysis & over-thinking. Humility’s far enemy is arrogance - inflated ego and sense of self-worth. Its near enemy is performative openness. Micromanaging is the far enemy of empowerment. Its subtler near enemy is supporting without passing over authority. Interrupting is the far enemy of deep listening. Its near enemy is passive listening. The far enemy of accepting feedback is defensiveness. The more complex near enemy is intellectualising feedback. The development of many high-performing employees plateaus not because of the easy-to-detect far enemies, but because of near enemies masquerading as progress. When you receive development feedback, ask yourself if your plan is actually going to tackle the issue at the core, or if you are simply choosing an easier and more comfortable route that delivers short-term gains but barely scratches the surface.`,
    category: 'economy',
    author: authors[1],
    featuredImage: 'https://www.thedailystar.net/sites/default/files/styles/portrait_356_475/public/2026-01/good%20leaders.png?h=b39c5fef',
    tags: ['leadership', 'business', 'career'],
    isBreaking: false,
    isFeatured: false,
    showOnHomepage: true,
    status: 'published',
    publishedAt: new Date('2026-01-15T10:00:00'),
    createdAt: new Date('2026-01-15T08:00:00'),
    updatedAt: new Date('2026-01-15T10:00:00'),
    views: 0,
    hasVideo: false
  },
  {
    id: '7',
    title: 'Toxic waste in our rivers: Stop this threat immediately',
    slug: 'toxic-waste-in-our-rivers-stop-this-threat-immedia',
    excerpt: 'Industrial dumping is turning our lifelines into hazardous zones.',
    content: `Globally, the boundary for biogeochemical flows of natural nutrient cycles, mainly nitrogen and phosphorus, has already passed a safe operating space for humanity. River pollution in Bangladesh is driven by various waste products, including sewage, industrial effluents, and chemicals. The rivers surrounding Dhaka, including the Buriganga, Turag, and Shitalakkhya, are among the most polluted. They receive vast amounts of untreated waste from thousands of factories. Heavy metals like chromium, lead, and arsenic are alarmingly high. Agricultural runoff also plays a significant role, entering the food chain and posing health risks. Coastal rivers are highly saline due to sea-level rise and reduced freshwater flow. To combat this, we need regular monitoring, digital dashboards for pollution data, and strict enforcement of sustainability reporting (ESG). Higher taxes on small plastic packaging and better waste collection systems are essential. Transboundary water diplomacy must include pollution management, especially with India and China. A systems approach and shifting towards a circular economy are critical to restoring our wetlands and rivers before a social-ecological catastrophe occurs.`,
    category: 'national',
    author: authors[2],
    featuredImage: 'https://www.thedailystar.net/sites/default/files/styles/portrait_356_475/public/2026-01/Sarwar_Hossain.jpg?h=7f41b5a5',
    tags: ['environment', 'pollution', 'urgent'],
    isBreaking: false,
    isFeatured: true,
    showOnHomepage: true,
    status: 'published',
    publishedAt: new Date('2026-01-17T07:00:00'),
    createdAt: new Date('2026-01-17T05:00:00'),
    updatedAt: new Date('2026-01-17T07:00:00'),
    views: 0,
    hasVideo: false
  },
  {
    id: '8',
    title: 'Politics, the IPL and a World Cup flashpoint: Explaining the India–Bangladesh cricket rift',
    slug: 'politics-the-ipl-and-a-world-cup-flashpoint-explai',
    excerpt: 'Analyzing the tensions affecting the cricketing relationship between the two neighbors.',
    content: `The chain of events began with the dramatic removal of Bangladesh star pacer Mustafizur Rahman from IPL franchise Kolkata Knight Riders, triggering widespread debate and controversy. The fallout has since escalated, leading to Bangladesh's refusal to play the upcoming T20 World Cup on Indian soil and an unprecedented strain in India–Bangladesh cricketing relations. In this episode of Star Explains, we break down the entire saga -- from Mustafizur's IPL exit to the broader political and cricketing implications -- and explore how this unfolding crisis could reshape regional cricket dynamics.`,
    category: 'sports',
    author: authors[3],
    featuredImage: 'https://www.thedailystar.net/sites/default/files/2025-11/star-multimedia-banner.jpeg',
    tags: ['cricket', 'diplomacy', 'sports'],
    isBreaking: false,
    isFeatured: false,
    showOnHomepage: true,
    status: 'published',
    publishedAt: new Date('2026-01-16T20:00:00'),
    createdAt: new Date('2026-01-16T18:00:00'),
    updatedAt: new Date('2026-01-16T20:00:00'),
    views: 0,
    hasVideo: false
  },
  {
    id: '9',
    title: 'Watch / No more silence: Akram urges BCB to show courage',
    slug: 'watch-no-more-silence-akram-urges-bcb-to-show-cour',
    excerpt: 'Former captain speaks out on the current state of cricket administration.',
    content: `Former Bangladesh captain Akram Khan has slammed the exclusion of Mustafizur Rahman from KKR as an injustice that hurt both the player and Bangladeshi fans. Speaking to The Daily Star, the former BCB director warned that politics and unclear processes are widening the gap between Bangladesh and India, urging cricket authorities to act decisively. Silence, he argued, has cost Bangladesh before. Now, he insists, the BCB must protect national interests, speak firmly and present its demands with courage -- without fear or hesitation -- for the future of Bangladeshi cricket.`,
    category: 'sports',
    author: authors[3],
    featuredImage: 'https://www.thedailystar.net/sites/default/files/styles/big_4/public/images/2026/01/03/161231_159.jpg',
    videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
    tags: ['cricket', 'BCB', 'sports'],
    isBreaking: false,
    isFeatured: true,
    showOnHomepage: true,
    status: 'published',
    publishedAt: new Date('2026-01-17T12:00:00'),
    createdAt: new Date('2026-01-17T10:00:00'),
    updatedAt: new Date('2026-01-17T12:00:00'),
    views: 0,
    hasVideo: true
  },
  {
    id: '10',
    title: 'In Focus / The untold history of why Khaleda Zia entered politics',
    slug: 'in-focus-the-untold-history-of-why-khaleda-zia-ent',
    excerpt: 'Revisiting the pivotal moments that shaped the political journey of the former Prime Minister.',
    content: `The military takeover by Army Chief Lt. Gen. Hussain Muhammad Ershad in 1982 failed to block the nationalist forces led by the BNP. Begum Khaleda Zia, an unlikely successor to Zia the statesman, rose to the occasion, joining the BNP and learning the art of leadership. The assassination of President Ziaur Rahman in 1981 had debilitated the party, and it was looking for a rallying point. While some senior members initially doubted her, she became a symbol of unity. In January 1982, she accepted party membership after significant persuasion from various factions. Though she initially withdrew from a chairmanship contest against Justice Sattar to maintain party unity, the internal contradictions and the need for a leader who carried Zia's legacy eventually made her the ultimate choice. Her entry into politics transformed her from a typical housewife into a charismatic national leader who could counterbalance other political forces. This excerpt from Mahfuz Ullah's book explores the circuitous path she took to steer the party through conspiracies and splits, ultimately winning the political battle for the BNP's future.`,
    category: 'politics',
    author: authors[0],
    featuredImage: 'https://www.thedailystar.net/sites/default/files/styles/big_580_435/public/images/2025/12/30/2_1.png?h=d75b87d0',
    tags: ['politics', 'history', 'bangladesh'],
    isBreaking: false,
    isFeatured: true,
    showOnHomepage: true,
    status: 'published',
    publishedAt: new Date('2026-01-15T14:00:00'),
    createdAt: new Date('2026-01-15T12:00:00'),
    updatedAt: new Date('2026-01-15T14:00:00'),
    views: 0,
    hasVideo: false
  },
  {
    id: '11',
    title: 'In Pictures: Winter chills across the country',
    slug: 'in-pictures-winter-chills',
    excerpt: 'A photo essay capturing the impact of the cold wave gripping the northern districts.',
    content: `As the winter chill tightens its grip across the country, life has become a struggle for many, especially the homeless and those living in rural areas. Thick fog and biting winds have disrupted daily activities and transport. Intro: As a severe cold wave grips Bangladesh, the winter chills have become a daily struggle for many. These images across the country show how people are coping with the dropping temperatures. Captions: 1. Thick fog blankets the highways, making travel hazardous and slow. 2. A group of people huddle around a roadside bonfire to stay warm in the early morning. 3. Vulnerable communities receive warm clothes from volunteers as the temperature dips. 4. The sun struggles to break through the dense mist in rural Bangladesh.`,
    category: 'national',
    author: authors[0],
    featuredImage: 'https://www.thedailystar.net/sites/default/files/styles/medium_300_170/public/2026-01/cold_0.jpg?h=5164e377',
    tags: ['weather', 'winter', 'photography'],
    isBreaking: false,
    isFeatured: false,
    showOnHomepage: true,
    status: 'published',
    publishedAt: new Date('2026-01-17T06:30:00'),
    createdAt: new Date('2026-01-17T05:00:00'),
    updatedAt: new Date('2026-01-17T06:30:00'),
    views: 0,
    hasVideo: false
  },
  {
    id: '12',
    title: 'Tech Giants Face New Regulations: What It Means for Digital Privacy',
    slug: 'tech-giants-new-regulations-privacy',
    excerpt: 'Comprehensive legislation aims to reshape how technology companies handle user data and privacy.',
    content: 'New regulatory frameworks are set to transform the digital landscape as governments worldwide crack down on data privacy violations.',
    category: 'technology',
    author: authors[1],
    featuredImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=800&fit=crop',
    tags: ['technology', 'privacy', 'regulation'],
    isBreaking: false,
    isFeatured: false,
    showOnHomepage: true,
    status: 'published',
    publishedAt: new Date('2026-01-13T15:00:00'),
    createdAt: new Date('2026-01-13T10:00:00'),
    updatedAt: new Date('2026-01-13T15:00:00'),
    views: 0,
    hasVideo: false
  },
  {
    id: '13',
    title: 'Award Season: Surprise Winners Shake Up Hollywood',
    slug: 'award-season-surprise-winners',
    excerpt: 'This year\'s awards ceremony delivered unexpected results that have critics and fans buzzing.',
    content: 'The entertainment industry is still reeling from an awards night full of surprises, with indie films and first-time nominees taking home the biggest honors.',
    category: 'entertainment',
    author: authors[4],
    featuredImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=800&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/kJQP7kiw5Fk',
    tags: ['entertainment', 'awards', 'hollywood'],
    isBreaking: false,
    isFeatured: false,
    showOnHomepage: true,
    status: 'published',
    publishedAt: new Date('2026-01-14T09:00:00'),
    createdAt: new Date('2026-01-14T07:00:00'),
    updatedAt: new Date('2026-01-14T09:00:00'),
    views: 0,
    hasVideo: true
  }
];

export const jobs: Job[] = [
  {
    id: '1',
    title: 'Senior Investigative Reporter',
    department: 'Editorial',
    type: 'full-time',
    description: 'Join our award-winning investigative team to uncover stories that matter.',
    requirements: [
      '5+ years of investigative journalism experience',
      'Strong research and analytical skills',
      'Published portfolio of investigative pieces',
      'Excellent written and verbal communication'
    ],
    deadline: new Date('2026-02-28'),
    isOpen: true,
    createdAt: new Date('2026-01-10')
  },
  {
    id: '2',
    title: 'Digital Content Editor',
    department: 'Digital',
    type: 'full-time',
    description: 'Lead our digital content strategy and manage online publishing.',
    requirements: [
      '3+ years of digital editing experience',
      'SEO and analytics expertise',
      'CMS proficiency',
      'Team leadership skills'
    ],
    deadline: new Date('2026-02-15'),
    isOpen: true,
    createdAt: new Date('2026-01-08')
  },
  {
    id: '3',
    title: 'Editorial Intern',
    department: 'Editorial',
    type: 'internship',
    description: 'Learn from experienced journalists while contributing to our newsroom.',
    requirements: [
      'Currently enrolled in journalism or related field',
      'Strong writing skills',
      'Eagerness to learn',
      'Ability to meet deadlines'
    ],
    deadline: new Date('2026-03-01'),
    isOpen: true,
    createdAt: new Date('2026-01-12')
  },
  {
    id: '4',
    title: 'Sports Reporter',
    department: 'Sports',
    type: 'full-time',
    description: 'Cover major sporting events and provide insightful analysis.',
    requirements: [
      '2+ years sports journalism experience',
      'Deep knowledge of multiple sports',
      'Strong interviewing skills',
      'Ability to work under tight deadlines'
    ],
    deadline: new Date('2026-02-20'),
    isOpen: true,
    createdAt: new Date('2026-01-11')
  },
  {
    id: '5',
    title: 'Entertainment Correspondent',
    department: 'Entertainment',
    type: 'full-time',
    description: 'Report on entertainment news, celebrity interviews, and industry trends.',
    requirements: [
      '3+ years entertainment journalism experience',
      'Industry contacts preferred',
      'Social media savvy',
      'Strong storytelling abilities'
    ],
    deadline: new Date('2026-02-25'),
    isOpen: true,
    createdAt: new Date('2026-01-12')
  }
];

export const categories: { id: Category; name: string; description: string }[] = [
  { id: 'national', name: 'National', description: 'News from across the nation' },
  { id: 'international', name: 'International', description: 'Global news and events' },
  { id: 'economy', name: 'Economy', description: 'Business and financial news' },
  { id: 'entertainment', name: 'Entertainment', description: 'Movies, music, and celebrity news' },
  { id: 'sports', name: 'Sports', description: 'Sports news and highlights' },
  { id: 'politics', name: 'Politics', description: 'Political news and analysis' },
  { id: 'technology', name: 'Technology', description: 'Tech news and innovations' },
  { id: 'editorial', name: 'Editorial', description: 'Opinion and analysis' },
  { id: 'untold-stories', name: 'Untold Stories', description: 'Investigative journalism' }
];

export const headerMenuItems: MenuItem[] = [
  { id: '1', label: 'National', path: '/category/national', type: 'category', isVisible: true, order: 1, showInMainNav: true },
  { id: '2', label: 'International', path: '/category/international', type: 'category', isVisible: true, order: 2, showInMainNav: true },
  { id: '3', label: 'Economy', path: '/category/economy', type: 'category', isVisible: true, order: 3, showInMainNav: true },
  { id: '4', label: 'Entertainment', path: '/category/entertainment', type: 'category', isVisible: true, order: 4, showInMainNav: true },
  { id: '5', label: 'Sports', path: '/category/sports', type: 'category', isVisible: true, order: 5, showInMainNav: true },
  { id: '6', label: 'Politics', path: '/category/politics', type: 'category', isVisible: true, order: 6, showInMainNav: false },
  { id: '7', label: 'Technology', path: '/category/technology', type: 'category', isVisible: true, order: 7, showInMainNav: false },
  { id: '8', label: 'Untold Stories', path: '/category/untold-stories', type: 'category', isVisible: true, order: 8, highlight: true, showInMainNav: false },
  { id: '9', label: 'Internship', path: '/internship', type: 'page', isVisible: true, order: 9, highlight: true, icon: '🎓', showInMainNav: false },
  { id: '10', label: 'Our Team', path: '/team', type: 'page', isVisible: true, order: 10, showInMainNav: false, icon: '👥' },
];

export const socialMediaLinks: SocialMediaLink[] = [
  { id: '1', platform: 'facebook', url: 'https://facebook.com/truthlens', isVisible: true },
  { id: '2', platform: 'twitter', url: 'https://twitter.com/truthlens', isVisible: true },
  { id: '3', platform: 'instagram', url: 'https://instagram.com/truthlens', isVisible: true },
  { id: '4', platform: 'youtube', url: 'https://youtube.com/@truthlens', isVisible: true },
  { id: '5', platform: 'linkedin', url: 'https://linkedin.com/company/truthlens', isVisible: true },
  { id: '6', platform: 'tiktok', url: '', isVisible: false },
  { id: '7', platform: 'whatsapp', url: '', isVisible: false },
  { id: '8', platform: 'telegram', url: '', isVisible: false },
];

export const siteSettings: SiteSettings = {
  siteName: 'TruthLens',
  tagline: 'Authentic Stories. Unbiased Voices.',
  siteDescription: 'Your trusted source for fact-based journalism.',
  contactEmail: 'contact@truthlens.com',
  socialLinks: socialMediaLinks,
};
