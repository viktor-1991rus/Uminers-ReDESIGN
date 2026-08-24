// ── Uminers Academy: knowledge base ───────────────────────────────────────
// Educational content on mining, Bitcoin and blockchain as a subject area.
// Nothing here states a fact about Uminers: no dates, no capacities, no
// client or partner claims. Where a supplier is mentioned it is as a
// category of counterparty, never with a commitment attached.
// Domain figures used below are public protocol constants (21M cap,
// 210,000-block halving, 2016-block retarget, 3.125 BTC subsidy since the
// April 2024 halving) or clearly-marked illustrative arithmetic.
// Cover art rotates across the three pill assets exported from Figma.
// `formatDate` for these lives in @/data/blog — one date formatter for both
// blog posts and academy courses, since ArticleView.vue treats them as the
// same "article" template (Figma 2064:2235).

export const ACADEMY_CATEGORIES = [
  'Cryptocurrency and Blockchain Basics',
  'Mining Economics & Management',
  'Security & Risks',
  'Trends & Outlook 2025–2026',
  'Practice: From Hobby to Business'
]
export const ACADEMY_LEVELS = ['Beginner', 'Medium', 'Expert']
export const ACADEMY_FORMATS = ['Listen', 'Read']

const PILL = {
  bitcoin: '/assets/academy/pill-what-is-bitcoin.jpg',
  mining: '/assets/academy/pill-mining-made-simple.jpg',
  growth: '/assets/academy/pill-why-mining-growing.jpg'
}

export const ACADEMY_COURSES = [
  /* ══ Cryptocurrency and Blockchain Basics ════════════════════════════ */
  {
    slug: 'what-is-bitcoin',
    category: 'Cryptocurrency and Blockchain Basics',
    level: 'Beginner',
    format: 'Read',
    durationMins: 8,
    date: '2025-09-10',
    pill: PILL.bitcoin,
    title: 'What is Bitcoin?',
    excerpt: 'A simple explanation of the first cryptocurrency for absolute beginners.',
    body: [
      'Bitcoin is a ledger. Every balance and every transfer that has ever existed sits in one public file, copied on tens of thousands of computers worldwide. No head office holds the master version. When copies disagree, the network follows one rule: the chain with the most computational work behind it wins.',
      'That ledger is written in blocks. Roughly every ten minutes a new block of transactions is appended, and each block carries a cryptographic fingerprint of the one before it. Alter an old transaction and every fingerprint after it breaks. This is why a settled Bitcoin transaction is expensive to rewrite and cheap for anyone to verify.',
      'Ownership works through key pairs. A private key, in practice a very large random number, signs transactions. An address derived from that key receives them. The network never checks identity, only whether the signature matches. Lose the key and the coins stay visible on the ledger forever, unspendable. No support line restores them, which is the reason custody discipline gets its own track in this library.',
      'Supply is fixed by the protocol. New bitcoin enters circulation only as a reward paid to whoever adds the next block. That reward began at 50 BTC in 2009 and halves every 210,000 blocks, roughly every four years. Since the April 2024 halving it has been 3.125 BTC. Halvings continue until issuance rounds to zero, capping total supply at 21 million coins, of which more than 19.5 million already exist.',
      'Blocks also pay transaction fees. Block space is scarce, so users bid for inclusion, and the winning bids go to the miner alongside the subsidy. As the subsidy shrinks with each halving, fees take a larger share of what a machine earns. Anyone running hardware watches both.',
      'Three things Bitcoin is not. It is not anonymous: addresses are pseudonymous and chain analysis is a mature industry. It is not fast in the retail sense, since a base-layer transaction settles in minutes, not milliseconds. It is not issued or guaranteed by any company, so there is no counterparty to appeal to and no counterparty to fail.',
      'For a buyer evaluating hardware, all of this reduces to three variables that decide revenue: the bitcoin price, the block subsidy, and how much total computing power competes for it. The rest of this track takes those apart one at a time.'
    ]
  },
  {
    slug: 'mining-made-simple',
    category: 'Cryptocurrency and Blockchain Basics',
    level: 'Beginner',
    format: 'Listen',
    durationMins: 12,
    date: '2025-09-24',
    pill: PILL.mining,
    title: 'Mining Made Simple',
    excerpt: 'How cryptocurrency mining works and why it’s essential for the network.',
    body: [
      'Mining is a guessing contest with a prize attached. A machine takes the block it wants to publish, adds a changeable number called a nonce, and runs the whole package through the SHA-256 hash function. The output is a fixed-length string that cannot be predicted or reversed. If that output falls below a target value, the block is valid and the reward is paid. If not, the machine changes the nonce and tries again.',
      'There is no shortcut. The only strategy is volume, which is why the industry measures machines in hashes per second. A modern unit performs hundreds of trillions of attempts per second, written as terahashes, and the whole network is measured in exahashes, a million times larger again.',
      'The target adjusts. Every 2016 blocks, about two weeks, the protocol compares how long those blocks actually took against the ten minutes each was supposed to take, and moves the difficulty to correct the gap. Add machines to the network and difficulty rises until the ten-minute average returns. This feedback loop is the single most important fact in mining economics: your share of the reward falls automatically whenever competitors plug in.',
      'Winning alone is improbable. A single machine against a network of hundreds of exahashes might find a block once in a human lifetime. Pools solve this. Thousands of miners point their hardware at one coordinator, submit partial solutions called shares as proof of effort, and split the reward in proportion to shares contributed. Payment schemes differ: full-pay-per-share pays a steady rate and lets the pool absorb luck, while pay-per-last-N-shares passes both good and bad luck to the miner at a lower fee.',
      'Why the network needs this. Proof of work turns the right to write history into something you must buy with electricity. Rewriting a confirmed block means redoing all the work behind it while the honest network keeps extending, so an attack costs more than it can extract. Security here is not a promise from an institution. It is an ongoing energy bill.',
      'What a mining machine actually is. An ASIC does one operation, SHA-256, and nothing else. It cannot render video, train a model, or run an operating system beyond a small control board. That specialisation is why it beats general-purpose hardware by orders of magnitude, and also why it has no second life when its efficiency stops paying for power.',
      'The practical loop: a machine hashes, a pool aggregates, the protocol adjusts difficulty, and the reward lands in a wallet address you control. Everything else in this library is detail hung on that loop.'
    ]
  },
  {
    slug: 'how-a-block-gets-confirmed',
    category: 'Cryptocurrency and Blockchain Basics',
    level: 'Beginner',
    format: 'Read',
    durationMins: 9,
    date: '2025-10-08',
    pill: PILL.growth,
    title: 'How a Block Gets Confirmed',
    excerpt: 'The path a transaction takes from broadcast to settlement, and what a confirmation actually proves.',
    body: [
      'A transaction starts life in the mempool. When a wallet broadcasts it, nodes check the signature and the balance, then hold it in memory alongside every other unconfirmed transaction. The mempool is not a queue. It is a waiting room where entries compete on price.',
      'Miners select from that room. Block space is capped, so a miner assembling a candidate block sorts by fee per byte and takes the most profitable set that fits. A transaction paying a high rate on a small footprint outranks a large transaction paying more in absolute terms. This is why consolidating many small inputs into one is expensive, and why wallets quote fees in satoshis per virtual byte rather than in currency.',
      'When a machine finds a valid hash, the block propagates. Neighbouring nodes verify it independently, in milliseconds, and relay it onward. Verification is cheap and finding the block was expensive, which is the asymmetry the whole system rests on. A block that breaks any rule is rejected by every honest node, and the work that produced it is wasted.',
      'Occasionally two miners publish valid blocks at nearly the same height. The network briefly holds two candidate chains, and the tie breaks when the next block lands on one of them. The abandoned block becomes stale, its reward disappears, and its transactions return to the mempool. Nothing is broken. The rule that the heaviest chain wins simply resolved a race.',
      'Confirmations count how many blocks now sit on top of yours. One confirmation means a miner included it. Six confirmations, the customary threshold for large amounts, means reversing it would require outpacing the entire network across six blocks, which is priced in electricity and rarely worth it. Confirmations are a probability curve, not a switch.',
      'Two practical consequences. First, a transaction that is stuck is usually underpriced rather than lost, and replace-by-fee or a child-pays-for-parent spend can raise the bid without recreating it. Second, fee spikes are demand events. When the mempool fills, everyone pays more, and miners earn more, which is exactly the mechanism that will carry block rewards as the subsidy shrinks.',
      'For an operator, the useful habit is watching mempool depth alongside the price chart. Sustained congestion lifts revenue per block above what a subsidy-only model predicts, and quiet weeks pull it below.'
    ]
  },
  {
    slug: 'hashrate-difficulty-and-the-ten-minute-block',
    category: 'Cryptocurrency and Blockchain Basics',
    level: 'Medium',
    format: 'Read',
    durationMins: 11,
    date: '2025-10-22',
    pill: PILL.mining,
    title: 'Hashrate, Difficulty and the Ten-Minute Block',
    excerpt: 'The three numbers that decide how much bitcoin a machine earns, and how they push against each other.',
    body: [
      'Hashrate is a rate of attempts. One terahash per second is a trillion guesses each second. A petahash is a thousand terahashes, an exahash a thousand petahashes. A single current-generation unit sits in the low hundreds of terahashes, and the global network sits in the hundreds of exahashes, so one machine holds roughly a millionth of a millionth of the total. That ratio, not the raw specification, determines the payout.',
      'Difficulty is the protocol’s throttle. It sets how low the winning hash must be, and it retargets every 2016 blocks against the observed block interval. Blocks arriving faster than ten minutes on average push difficulty up. Blocks arriving slower pull it down, with each adjustment capped at a factor of four in either direction so the chain cannot be destabilised by a sudden exit.',
      'The relationship is mechanical. Your expected share of daily issuance equals your hashrate divided by network hashrate. If the network grows twenty percent and your fleet does not, your bitcoin output falls by about seventeen percent, regardless of price. Hardware does not degrade in performance. It degrades in relevance.',
      'Efficiency is the number that survives this. Joules per terahash measures how much energy a machine spends per unit of work. Current-generation air-cooled units land roughly in the mid-teens, the previous generation closer to thirty, and machines from the 2016 era near a hundred. Since power is the dominant recurring cost, efficiency decides which machines stay switched on when difficulty rises or price falls. A fleet is not obsolete when it is old. It is obsolete when its joules per terahash cost more in electricity than the bitcoin it produces.',
      'Variance deserves respect. Mining is a Poisson process, so a solo operator with meaningful hashrate can go months above or below expectation without anything being wrong. Pools exist largely to convert that variance into a predictable daily figure. When you compare a pool statement against theoretical output, compare across weeks, not days.',
      'Reported hashrate versus effective hashrate is a common source of confusion. A pool infers your contribution from accepted shares over time, so the figure fluctuates around the true value and settles as the sample grows. Persistent gaps between the two, however, are a diagnostic signal: rejected shares, failing hashboards, thermal throttling, or a network path dropping submissions.',
      'The operating conclusion is unglamorous. Track three series over time, your effective hashrate, network difficulty, and machine efficiency, and most decisions about when to buy, when to curtail, and when to retire hardware answer themselves.'
    ]
  },

  /* ══ Mining Economics & Management ═══════════════════════════════════ */
  {
    slug: 'mining-economics-101',
    category: 'Mining Economics & Management',
    level: 'Medium',
    format: 'Read',
    durationMins: 18,
    date: '2025-11-05',
    pill: PILL.mining,
    title: 'Mining Economics 101',
    excerpt: 'Break-even hashprice, power contracts and the math behind a farm that survives a bear market.',
    body: [
      'Mining reduces to one comparison: the value of the bitcoin a machine produces against the cost of the electricity it consumes. Everything else is a second-order adjustment on that line.',
      'Start with revenue. The industry expresses it as hashprice, the daily earnings per unit of hashrate, quoted as dollars per petahash per day. Hashprice already contains the bitcoin price, the block subsidy, network difficulty and average fees, which makes it the single most useful number to track. When hashprice halves, every machine in the world halves its revenue on the same day.',
      'Now the cost. Take a machine drawing 3.4 kilowatts. Over 24 hours that is 81.6 kilowatt-hours. At five cents per kilowatt-hour the daily power bill is $4.08. At ten cents it is $8.16. Nothing about the machine changed, and the operating margin moved by the full difference.',
      'Put them together with an illustrative case. A 200 TH/s unit at 3,400 watts runs at 17 joules per terahash. At a hashprice of $40 per petahash per day it earns 0.2 × $40, or $8.00 daily. At five cents power it clears roughly $3.92 a day before anything else. At ten cents it clears nothing. These figures are arithmetic on assumed inputs, not a forecast.',
      'The number worth calculating once and remembering is your break-even power price: the tariff at which revenue exactly equals the electricity bill. Below it you have a business. Above it you have a heater. Because efficiency sets that threshold, a fleet at 17 J/TH and a fleet at 30 J/TH are not the same business even at the same site.',
      'The costs that get forgotten are the ones that close farms. Pool fees take one to three percent of revenue. Hosting or facility overhead adds a per-kilowatt charge on top of energy. Failure rates require spare hashboards, power supplies and control boards, plus labour to fit them. Cooling, filtration and network gear draw parasitic load that never appears on a machine specification. Budget infrastructure separately from energy and the model stops flattering itself.',
      'Then the capital side. Hardware is a depreciating asset in a market where the replacement is more efficient and difficulty only rises. Payback period, not headline hashrate, is the purchase metric, and it should be stress-tested against a hashprice materially below today’s. Buying at the top of a cycle at spot prices has ended more operations than any technical failure.',
      'Which brings you to the discipline that separates farms that survive. Model three scenarios, not one: hashprice as it is, hashprice down forty percent, and hashprice down seventy percent with difficulty still climbing. If the operation only works in the first scenario, the power contract is the problem, not the hardware.',
      'This is also why cheap energy alone is not a strategy. A low tariff with high demand charges, poor uptime, or a curtailment regime you cannot control can cost more per mined coin than a higher headline rate at a well-run site. Compare all-in cost per bitcoin produced, which is the only figure that lets two very different sites be judged on the same scale.',
      'Finally, treat the treasury as part of the model. Selling daily, holding, or hedging with forward sales are three different businesses with the same machines. Decide the policy before the market forces the decision, because a policy written during a drawdown is usually a liquidation.'
    ]
  },
  {
    slug: 'hashprice-explained',
    category: 'Mining Economics & Management',
    level: 'Medium',
    format: 'Read',
    durationMins: 12,
    date: '2025-11-19',
    pill: PILL.bitcoin,
    title: 'Hashprice: The One Number That Prices a Farm',
    excerpt: 'What hashprice bundles together, why it falls even in a rising market, and how to use it to time hardware purchases.',
    body: [
      'Hashprice answers a single question: what does one unit of hashrate earn today. It is normally quoted in dollars per petahash per day, sometimes in satoshis per terahash. Both express the same thing, and the difference matters more than it looks.',
      'Four inputs move it. The bitcoin price scales everything. The block subsidy, fixed at 3.125 BTC until the next halving, sets base issuance. Network difficulty divides that issuance among more or fewer competitors. Transaction fees add a variable top-up that can be negligible for weeks and then double a block’s value during congestion.',
      'Because difficulty sits in the denominator, hashprice can fall while the bitcoin price rises. A thirty percent price rally alongside a forty percent difficulty increase leaves miners earning less per machine than before the rally started. Operators who track only the price chart are reading the wrong series.',
      'The dollar and satoshi quotes tell different stories on purpose. Dollar hashprice tells you whether the site pays its electricity bill this month. Satoshi hashprice strips currency out and shows how your share of issuance is eroding as the network grows. A treasury that holds coin cares about the second. A treasury that sells daily cares about the first.',
      'Hashprice is also the cleanest way to compare hardware. Divide the daily power cost of a machine by its hashrate and you get the hashprice at which it breaks even. A unit at 17 joules per terahash on five-cent power breaks even near $20 per petahash per day; the same unit on ten-cent power needs roughly double that. Line every model you are considering against the same curve and the ranking rarely matches the marketing.',
      'Use the number for timing, not for prediction. Hardware is cheapest when hashprice is depressed, because sellers are liquidating and manufacturers are discounting, and it is most expensive when margins are wide and everyone is expanding. Buying counter-cyclically is not clever, it is just the arithmetic of a market where every buyer faces the same public revenue figure.',
      'Two limits to keep in view. Hashprice is a network average, so it says nothing about your uptime, your rejected shares, or your pool fee. And it assumes machines run continuously, which a curtailable power contract deliberately does not. Adjust for realised uptime before comparing your statement to any published chart.'
    ]
  },
  {
    slug: 'power-contracts-for-miners',
    category: 'Mining Economics & Management',
    level: 'Expert',
    format: 'Read',
    durationMins: 16,
    date: '2025-12-03',
    pill: PILL.growth,
    title: 'Power Contracts: Fixed, Indexed and Curtailable',
    excerpt: 'Why the headline cents-per-kilowatt-hour rate hides most of the bill, and which contract terms decide margin.',
    body: [
      'The advertised tariff is rarely what a site pays. An industrial electricity bill separates energy, the kilowatt-hours consumed, from demand, the highest sustained draw recorded during the billing period, and adds transmission, capacity and regulatory charges on top. A site quoted four cents can settle above six once demand and delivery charges land.',
      'Demand charges punish spikes. Because they price your peak rather than your average, a fleet that restarts all at once after an outage can set a peak that follows you for a full billing cycle, and in some tariffs for a full year. Staged restart logic is a financial control, not just an electrical courtesy.',
      'Mining is unusual in one respect that fixes this: load factor. A farm runs near constant draw around the clock, so its average sits close to its peak and demand charges spread across a large volume of kilowatt-hours. That flat profile is exactly why grid operators and generators find mining load attractive, and it is the strongest argument a buyer has at the negotiating table.',
      'Fixed-rate contracts buy certainty. You know the cost per kilowatt-hour for the term, which makes break-even calculable and financing possible. The cost of that certainty is a premium above average market price and no upside when wholesale prices collapse.',
      'Indexed contracts pass the wholesale price straight through. They are cheaper on average and occasionally free or negative in oversupplied markets, but they expose the operation to price events that can exceed mining revenue by an order of magnitude for hours at a time. An indexed contract without a shutdown trigger written into operations is an uncapped liability.',
      'Curtailable and demand-response arrangements convert flexibility into revenue. The site accepts instructions to reduce load during scarcity and receives a lower rate, capacity payments, or both. Model this properly: a lower tariff at eighty-five percent uptime can beat a higher tariff at ninety-eight, or lose to it, depending on how curtailment hours cluster and on hashprice during those hours. Ask for historical curtailment data before signing rather than an annual average.',
      'Read the surrounding clauses as carefully as the rate. Interconnection capacity and its energisation timeline decide when machines actually earn. Take-or-pay minimums bill for power you cannot use during a downturn. Termination rights, rate-review triggers, and who receives curtailment credits in a hosted arrangement all move the effective price more than a half-cent negotiation on the headline number.',
      'The synthesis: price the contract in dollars per bitcoin produced under three hashprice scenarios, including one where the machines run only part of the year. A contract that only works at full utilisation is a bet on difficulty staying flat, and difficulty has never stayed flat for long.'
    ]
  },
  {
    slug: 'what-a-hosting-contract-covers',
    category: 'Mining Economics & Management',
    level: 'Medium',
    format: 'Listen',
    durationMins: 14,
    date: '2025-12-17',
    pill: PILL.mining,
    title: 'What a Hosting Contract Actually Covers',
    excerpt: 'Uptime definitions, pass-through rates and exit terms: the clauses that decide whether hosted machines earn what the spreadsheet promised.',
    body: [
      'Hosting moves machines you own into someone else’s facility, with power, cooling, networking and hands-on maintenance supplied for a fee. It removes construction risk and electrical work from the buyer and replaces them with counterparty risk. The contract is where that trade is priced.',
      'Start with how power is billed. An all-in rate per kilowatt-hour bundles energy and service into one number and is easy to model. A pass-through rate plus a hosting margin is more transparent but leaves you exposed to tariff movement. Neither is inherently better. What matters is knowing which one you signed and what happens when the underlying rate changes.',
      'Define uptime precisely, because the word carries at least three meanings. Facility power availability, machine online time, and delivered hashrate against nameplate are different measurements, and a site can hit ninety-nine percent on the first while your fleet delivers far less. Ask for the metric, the measurement interval, the exclusions, and the remedy when the number is missed. An uptime guarantee with no service credit attached is a sentence, not a term.',
      'Curtailment needs explicit treatment. Establish who decides to shut down, how much notice is given, whether machines restart automatically, and above all who keeps any payments the facility receives for reducing load. If the host earns curtailment revenue while your machines sit idle, the economics of the arrangement are not what the rate suggested.',
      'Maintenance scope separates cheap contracts from workable ones. Clarify response times for a downed unit, who supplies spare hashboards and power supplies, whether repair is included or billed per incident, and how long a machine may sit dead before someone is accountable. Ask what percentage of the fleet the host holds as spares. The answer tells you how seriously the site takes downtime.',
      'Keep control of the money. Payouts should go to a pool account you own, sending to an address only you control. Hosting arrangements where the operator receives coin and remits your share introduce a credit exposure that no rate discount compensates for. Insist on read-only visibility into per-machine telemetry as well, so performance disputes are settled by data rather than by email.',
      'Then the boring clauses that decide the worst day. Deposits and how they are returned. Notice periods for termination on both sides. Who pays for de-installation and freight if you leave. What happens to your hardware if the host enters insolvency, and whether your ownership is documented well enough to survive that. Insurance coverage, and whether it covers your equipment or only the building.',
      'Suppliers of hosting and hardware, Uminers among them, will differ on all of these points, and the comparison is not really about the advertised rate. Two sites quoting the same cents per kilowatt-hour can produce materially different revenue per machine per year once uptime definitions, curtailment treatment and repair turnaround are held side by side. Build the comparison on those terms and the choice usually becomes obvious.'
    ]
  },

  /* ══ Security & Risks ════════════════════════════════════════════════ */
  {
    slug: 'securing-a-mining-operation',
    category: 'Security & Risks',
    level: 'Expert',
    format: 'Read',
    durationMins: 22,
    date: '2026-01-14',
    pill: PILL.bitcoin,
    title: 'Securing a Mining Operation',
    excerpt: 'Custody, site access and the operational-security checklist most farms skip until it is too late.',
    body: [
      'A mining operation has an unusual risk profile: it holds valuable, portable hardware in a physical location, it produces a bearer asset every day, and it runs thousands of embedded devices with minimal security hardening on one network. Each of those is a separate discipline, and an operation that hardens only one of them is not protected.',
      'The payout path is the highest-value target. Everything a farm earns eventually flows to one address configured in a pool account, and an attacker who changes that address collects the revenue with no need to touch a single machine. Protect the pool account with hardware-key two-factor authentication rather than SMS, enable payout address locks with a mandatory delay where the pool supports it, and set an alert that fires on any account configuration change. Review the configured address on a schedule, not only when a payment goes missing.',
      'Custody of the coin itself deserves a written policy. Define which wallet receives pool payouts, how funds move to cold storage, who can authorise a transfer, and what threshold requires more than one person. Multi-signature arrangements exist precisely so that a single compromised laptop or a single departing employee cannot drain a treasury. Test recovery from backups before you need it, because an untested seed backup is an assumption rather than a control.',
      'Firmware is a supply chain. Custom firmware can improve efficiency and is widely used, but it also runs with full control over the device and, in some builds, over where the hashrate is directed. Install only from sources you can verify, prefer signed images, and treat a build that arrives through a chat group as untrusted by default. Malware that quietly redirects a fraction of a fleet’s hashrate to an attacker’s pool has been observed repeatedly, and it is deliberately sized to look like ordinary variance.',
      'Network segmentation is the highest-return control on this list. Mining hardware should sit on an isolated VLAN with no route to the public internet beyond what pools and monitoring require, no inbound exposure at all, and administrative access only through a VPN or bastion host. Change every default credential during commissioning. A fleet reachable from the open internet with factory passwords will be found by automated scanning within days.',
      'Monitoring is a security function, not only an operations one. Alert on pool configuration drift across the fleet, on unexpected firmware version changes, on individual machines whose reported hashrate diverges from historical baseline, and on any device attempting outbound connections to an unknown host. These signals catch hashrate theft long before the monthly statement does.',
      'Physical security is straightforward and frequently neglected. Control who enters, log it, and keep the log. Track hardware by serial number from receipt to rack to repair to disposal, so a missing unit is detected in inventory rather than in an audit a year later. Cameras covering doors, aisles and the loading area matter more than perimeter fencing, because most hardware losses involve someone who was legitimately inside.',
      'Insider risk is the case the checklist usually misses. The people with rack access, pool credentials and firmware authority are the same people who can quietly reroute a small share of production. Separate duties so no one person controls hardware, pool configuration and payout destination. Rotate credentials when staff change roles, and revoke on the day of departure rather than at the end of the month.',
      'Vendor and counterparty exposure closes the loop. Hosting providers, repair partners and pools all touch either your hardware or your revenue. Ask how each authenticates instructions from you, and establish a verification step for any change to payment details that does not rely on email alone. Payment-diversion fraud through spoofed correspondence remains one of the most effective attacks against businesses of this size.',
      'Finally, write the incident playbook before the incident. Who is called, in what order, what gets disconnected first, how the pool is contacted out of hours, where the backups are, and who speaks to counterparties. An operation that has rehearsed this recovers in hours. One that has not spends the first day deciding who is in charge.'
    ]
  },
  {
    slug: 'custody-without-illusions',
    category: 'Security & Risks',
    level: 'Medium',
    format: 'Read',
    durationMins: 13,
    date: '2026-01-28',
    pill: PILL.growth,
    title: 'Custody Without Illusions',
    excerpt: 'Self-custody, exchanges and qualified custodians compared on the risks each one actually removes.',
    body: [
      'Custody is the question of who can move the coin. Every arrangement answers it differently, and each answer trades one category of risk for another. There is no option that removes risk, only options that relocate it.',
      'Self-custody with a hardware wallet puts the private key under your control and removes counterparty failure entirely. In exchange it hands you operational risk in full: losing the seed phrase loses the funds, and a single seed held by a single person is a single point of failure that no amount of care fully mitigates. For a business, sole-signer custody is rarely defensible once balances become material.',
      'Multi-signature raises the bar without introducing an outside party. A two-of-three arrangement requires two independent keys to authorise a spend, so one stolen device, one compromised laptop or one lost backup does not move funds. Keys should be held by different people, generated on different devices, and stored in different physical locations, otherwise the redundancy is cosmetic.',
      'Exchange accounts are convenient and structurally weak for storage. The exchange holds the keys, so you hold a claim rather than an asset, and that claim depends on the solvency and integrity of the operator. Exchanges are appropriate for the hours around a conversion and poor as a resting place for a treasury. The historical record on this point is long enough that it needs no elaboration.',
      'Qualified custodians occupy the middle. A regulated custodian brings insurance, audited controls, segregated accounts and a legal framework that many institutional counterparties require. You still accept counterparty risk, now against a supervised entity, and you accept withdrawal processes that are slower by design. For an operation with external investors or lenders, that trade is often mandatory rather than optional.',
      'Whatever the model, a few controls apply universally. Whitelist withdrawal addresses so funds can only leave to destinations approved in advance, with a time delay on adding new ones. Verify every address on the device screen rather than in the browser, because clipboard-replacing malware is common and cheap. Split holdings between a small hot balance sized to operational needs and cold storage for the rest, so a breach of the working wallet is a bounded loss.',
      'Write the policy down and test it. Which balance sits where, who signs, what threshold requires a second approver, how a compromised key is rotated, and how funds are recovered if a signer is unavailable. Then rehearse a recovery from backup on a small amount before you rely on it. Untested backups fail at exactly the moment they are needed.',
      'Two failure modes deserve explicit planning. Succession: if the only people who know the recovery procedure become unavailable, the treasury is gone, and inheritance or continuity instructions belong in the policy. And social engineering: most losses at this scale begin with a convincing message rather than a broken algorithm, which is why any change to payment destinations should require verification through a channel separate from the one that requested it.'
    ]
  },
  {
    slug: 'firmware-pools-and-the-attack-surface',
    category: 'Security & Risks',
    level: 'Expert',
    format: 'Read',
    durationMins: 17,
    date: '2026-02-11',
    pill: PILL.mining,
    title: 'Firmware, Pools and the Attack Surface Nobody Audits',
    excerpt: 'How hashrate is stolen quietly, why it looks like variance, and the monitoring that catches it.',
    body: [
      'A mining fleet is a fleet of embedded Linux devices with a web interface, default credentials on arrival, and an update mechanism that many operators never think of as a supply chain. Attacks on that surface do not aim to break the machines. They aim to keep them running for someone else.',
      'Custom firmware is the central tension. Third-party builds offer autotuning, undervolting and per-chip frequency control that can meaningfully improve joules per terahash, which is why they are widespread. They also replace the entire software stack on a device that controls where your work is submitted. Most reputable builds disclose a development fee, a small percentage of hashrate directed to the developer, and that disclosure is exactly what makes an undisclosed diversion hard to spot: a few percent of redirected work sits comfortably inside normal variance.',
      'Treat firmware sources the way you would treat a payments vendor. Download from the developer’s verified channel, check signatures where they are published, keep a record of which version is on which machine, and refuse images distributed through forums or chat groups regardless of who vouches for them. Where the vendor supports signed firmware and secure boot, enable it, and accept the loss of tuning flexibility as the price of a verifiable device.',
      'The pool connection is the other lever. Stratum V1 traffic is unauthenticated and, in most deployments, unencrypted, so anyone positioned on the network path can observe it and in principle interfere with it. Stratum V2 adds encryption, authentication and the option for miners to select their own transaction sets, which is a meaningful improvement where both the pool and the firmware support it. Until it is universal, treat the path from fleet to pool as untrusted and keep it inside your own network boundary.',
      'Configuration drift is the detection signal that matters most. Poll every device for its pool URL, worker name, firmware version and hashrate on a schedule, store the results, and alert on any change that no one authorised. A machine whose pool endpoint differs from the fleet standard is either a commissioning error or an incident, and both need to be seen the same day.',
      'Pool selection carries its own exposure. A pool holds your earnings between payouts, so payout frequency and minimum thresholds are credit terms as much as conveniences. Understand which payment scheme you are on, since full-pay-per-share transfers luck risk to the pool at a higher fee while pay-per-last-N-shares keeps it with you. Concentration is a risk in itself: splitting a large fleet across more than one pool limits the damage from an outage or a failure at any single operator.',
      'Two more surfaces round out the picture. Management software and monitoring dashboards frequently run with fleet-wide credentials and are often exposed more casually than the miners themselves, so they deserve the same access controls as the machines they command. And repair workflows move devices outside your perimeter, which means a unit returning from a third party should be reflashed to your standard image and re-provisioned before it rejoins the fleet.',
      'The practical posture is unremarkable and effective. Known-good firmware from verified sources, no default credentials anywhere, no inbound reachability from the internet, fleet-wide configuration monitoring with alerting, and periodic reconciliation of realised output against theoretical output. Hashrate theft is designed to hide inside noise, and the only reliable answer is a baseline precise enough that the noise becomes visible.'
    ]
  },

  /* ══ Trends & Outlook 2025–2026 ══════════════════════════════════════ */
  {
    slug: 'why-mining-popularity-is-growing',
    category: 'Trends & Outlook 2025–2026',
    level: 'Beginner',
    format: 'Read',
    durationMins: 10,
    date: '2026-02-25',
    pill: PILL.growth,
    title: 'Why Mining Popularity is Growing',
    excerpt: 'Brief history and prospects of digital asset extraction.',
    body: [
      'Mining began on ordinary laptops. In 2009 a general-purpose processor was enough to find blocks, because almost nobody was competing. As the reward acquired value, competition arrived, and the hardware moved through four generations in under a decade: CPUs, then graphics cards, then programmable FPGAs, then application-specific chips that do nothing but SHA-256. Each step raised output per watt by orders of magnitude and pushed the previous generation out of profitability.',
      'That progression turned a hobby into an industrial process. Once the only remaining variables were chip efficiency and electricity price, the activity migrated to wherever power was cheap, abundant and preferably otherwise wasted. Mining became an energy business that happens to produce a digital asset, and it is now analysed with the tools used for aluminium smelting or data-centre siting rather than those used for software.',
      'Three forces explain the growth in participation. The first is capital: publicly listed mining companies gave institutional investors exposure to the sector and gave operators access to debt and equity markets, which funded facilities at a scale individuals could never reach. The second is energy economics: grid operators discovered that a large, flexible, interruptible load is genuinely useful for balancing supply, so miners increasingly earn from reducing consumption as well as from producing hashrate.',
      'The third is the treatment of wasted energy. Stranded hydro in wet seasons, curtailed wind at night, and gas flared at wellheads all represent generation with no buyer nearby. Mining is unusual in that it can be built next to the source rather than waiting for transmission, which turns a disposal problem into a revenue stream. This is also the argument that has shifted much of the environmental debate from headline consumption toward the marginal source of the electricity.',
      'Heat is the emerging second product. A machine converts nearly all its input power into heat, and projects across Europe and North America now route that heat into district heating, greenhouses, drying processes and swimming pools. It does not change the mining economics dramatically, but it changes the permitting conversation and the local politics, which is often the harder constraint.',
      'The pressure running against all of this is the halving. Every four years the block subsidy drops by half, and the industry responds within months by retiring inefficient machines, renegotiating power, and consolidating around operators with the lowest all-in cost. Each cycle has ended with fewer, larger, more efficient participants, and the 2024 halving followed the same pattern.',
      'The outlook that follows is not that mining becomes easier. It is that mining becomes more clearly a specialised infrastructure business, judged on cost per bitcoin produced, quality of power contracts, and uptime. That is a higher barrier for casual entrants and a more legible proposition for serious ones, which is precisely why professional participation keeps rising.'
    ]
  },
  {
    slug: 'mining-after-the-fourth-halving',
    category: 'Trends & Outlook 2025–2026',
    level: 'Medium',
    format: 'Read',
    durationMins: 14,
    date: '2026-03-11',
    pill: PILL.bitcoin,
    title: 'Mining After the Fourth Halving',
    excerpt: 'What a 3.125 BTC subsidy did to fleet composition, hosting rates and the growing weight of transaction fees.',
    body: [
      'The April 2024 halving cut the block subsidy from 6.25 to 3.125 BTC. Revenue per unit of hashrate fell by roughly half overnight while costs stayed exactly where they were, and the industry spent the following months redistributing capacity toward whoever could absorb that.',
      'The first effect is an efficiency floor that keeps rising. Every halving moves the joules-per-terahash threshold at which a machine still pays for its power, and machines below the line either move to cheaper electricity or stop. Older-generation units near thirty joules per terahash survive only on unusually low tariffs or during periods of elevated hashprice. This is why secondary-market hardware prices move so violently around halvings: an asset that is marginal at one power price is worthless at another.',
      'The second effect is on hosting. When margins compress, hosted miners scrutinise every component of the rate, and facilities that were viable on a subsidy of 6.25 BTC face renegotiation or vacancy. Sites with genuinely low energy costs and high uptime gained share. Sites competing on headline rate while delivering poor availability did not.',
      'The third effect is the rising importance of fees. With issuance halved, transaction fees represent a structurally larger fraction of block revenue, and periods of network congestion now measurably change monthly results. Fee income is volatile and hard to forecast, which makes it a poor basis for a business plan and an increasingly significant line in the actuals. Any model that assumes subsidy alone understates good months and overstates bad ones.',
      'Consolidation followed, as it did after every previous halving. Operators with balance-sheet capacity bought distressed hardware and sites at prices unavailable during expansion. Operators financed on the assumption of continuously rising hashprice found that difficulty had climbed while their revenue had not. The pattern is consistent enough to plan around: the halving does not select for the largest operator, it selects for the one with the lowest all-in cost and the least fragile financing.',
      'Two structural shifts came out of this cycle rather than the previous ones. Flexibility became a revenue line in its own right, with demand-response participation and curtailment payments now central to siting decisions rather than incidental. And a portion of the sector began evaluating whether its power, land and interconnection are worth more to compute buyers than to hashing, a question examined separately in this track.',
      'For anyone sizing a purchase now, the practical guidance is to model against the next halving rather than the last one. Hardware bought today will still be racked when the subsidy drops again, and a machine that only breaks even at current hashprice has a defined end date already written into the protocol.'
    ]
  },
  {
    slug: 'ai-compute-and-mining-sites',
    category: 'Trends & Outlook 2025–2026',
    level: 'Medium',
    format: 'Listen',
    durationMins: 15,
    date: '2026-03-25',
    pill: PILL.growth,
    title: 'Why AI Compute Is Bidding for Mining Sites',
    excerpt: 'Power and interconnection are the scarce inputs both industries need, and the reasons most mining halls still cannot host GPUs.',
    body: [
      'The competition between mining and AI compute is not about chips. It is about energised megawatts. Securing a large grid connection takes years in most markets, and mining operators spent the last decade acquiring exactly that: land, substations, transformers and interconnection agreements at sites with cheap power. AI infrastructure needs the same input and needs it sooner than the queue allows.',
      'That is why site valuations changed. A facility that was priced on its ability to produce hashrate began to be priced on its ability to deliver power to any tenant, and contracted capacity with a firm energisation date became the asset. Several listed miners restructured around this directly, converting part of their footprint or signing long-term compute leases.',
      'The reasons conversion is harder than it sounds start with tolerance for downtime. A mining hall that loses power for an hour loses an hour of revenue and nothing else. A training cluster that loses power mid-run can lose far more than the elapsed time, so AI tenants expect redundant utility feeds, uninterruptible power, generator backup and concurrent maintainability. Building that into a shell designed for interruptible load is a capital project, not a retrofit.',
      'Density is the second gap. Mining racks are arranged for high airflow and modest heat per square metre by data-centre standards. Current AI accelerators concentrate far more power per rack and increasingly require direct-to-chip liquid cooling, which means new mechanical plant, water treatment, pumps, and floor loading that many mining structures were never engineered for.',
      'Connectivity is the third, and it is frequently decisive. Mining tolerates high latency and needs almost no bandwidth, so sites were sited for electricity and not for fibre. AI workloads need substantial, redundant, low-latency connectivity, and a site with excellent power and a single fibre path serves a narrower set of tenants than its megawatt figure suggests.',
      'The economics differ in shape as much as in size. Mining revenue is volatile, unsecured and priced daily by the network. Compute revenue arrives as multi-year contracts with creditworthy counterparties, which supports very different financing. The trade is that capital cost per megawatt for AI-grade infrastructure is several times higher and construction is slower, so the higher revenue is bought with far greater upfront commitment and a much longer payback.',
      'Not every site converts, and the ones that do not are not therefore obsolete. Interruptible mining load remains valuable to grids precisely because AI load is not interruptible, and a fleet that can shed hundreds of megawatts in seconds is a balancing asset that a training cluster can never be. The likely outcome is specialisation rather than replacement: sites with redundancy, fibre and water lean toward compute, while sites optimised for the cheapest possible interruptible energy keep hashing.',
      'For an operator, the useful exercise is an honest audit: contracted capacity, redundancy of feed, fibre routes, water availability, floor loading, and the timeline and cost to close each gap. That audit, rather than a view on either market, tells you which business your site is actually in.'
    ]
  },

  /* ══ Practice: From Hobby to Business ════════════════════════════════ */
  {
    slug: 'from-hobby-to-business',
    category: 'Practice: From Hobby to Business',
    level: 'Medium',
    format: 'Listen',
    durationMins: 15,
    date: '2026-04-08',
    pill: PILL.growth,
    title: 'From Hobby to Business',
    excerpt: 'What actually changes — legally, financially, operationally — once mining stops being a side project.',
    body: [
      'The shift from hobby to business is not a threshold in machine count. It happens the moment the operation depends on outcomes rather than tolerating them: when downtime costs money you had planned to spend, when a counterparty needs paperwork from you, or when the electricity bill needs a contract rather than a domestic tariff.',
      'Legal structure comes first because everything else attaches to it. An operating entity separates personal assets from equipment liabilities, gives you something to sign power and hosting contracts with, and creates the bank relationship that mining revenue will need. Banking is often the slowest step, so start it early and expect to explain the business model in detail rather than in summary.',
      'Accounting stops being optional. Once mining is a trade, mined coin is generally recognised as income at its value on the day it is received, equipment is capitalised and depreciated rather than expensed at purchase, and electricity becomes a deductible cost tied to that activity. Rules differ by jurisdiction and change, so treat this as the shape of the problem and take the specifics from a professional in your country.',
      'Record-keeping is the part that scales badly if it is left late. Every payout needs a date, an amount, a value at receipt and a destination. Every disposal needs a cost basis. Reconstructing two years of pool payouts retroactively is expensive and sometimes impossible, while capturing them daily from the start costs almost nothing.',
      'Operations change character. A hobby fleet is monitored by looking at it, and a business fleet is monitored by exception: alerting on offline units, on hashrate below baseline, on temperature excursions, and on configuration drift. Spare parts move from something you order when a machine dies to something you hold on the shelf, because revenue lost during a two-week shipping wait usually exceeds the cost of the spare.',
      'Power is where the largest single improvement lives. Domestic and small-commercial tariffs are rarely compatible with mining margins at scale, and the practical routes are an industrial contract at your own site or a hosting arrangement with someone who already has one. Both require the entity, both require diligence on terms rather than headline rates, and both take longer to arrange than the hardware takes to arrive.',
      'Treasury policy deserves a decision in advance. Selling daily to cover costs, holding production, or hedging part of it are three different risk profiles built on identical machines. Written policy protects against the version of yourself that makes decisions during a seventy percent drawdown.',
      'Finally, plan the exit alongside the entry. Hardware depreciates against a difficulty curve that only rises, so decide up front at what efficiency threshold or hashprice level machines are sold or retired. Operations that never define that point tend to discover it involuntarily, at the moment when the equipment is worth least.'
    ]
  },
  {
    slug: 'first-machine-checklist',
    category: 'Practice: From Hobby to Business',
    level: 'Beginner',
    format: 'Read',
    durationMins: 11,
    date: '2026-04-22',
    pill: PILL.mining,
    title: 'Your First Machine: A Pre-Purchase Checklist',
    excerpt: 'Power, noise, heat and warranty: the practical constraints that decide whether a first ASIC runs at home, in a garage, or not at all.',
    body: [
      'Before comparing models, check the wall. Most modern ASICs expect 200 to 240 volt single-phase supply, and a unit drawing above three kilowatts needs a dedicated circuit with a breaker sized for continuous load, typically at 125 percent of the machine’s rated draw. In regions on 110 to 120 volt domestic wiring this alone rules out running one in an ordinary room without electrical work.',
      'Plan the connectors, not just the amperage. Machines usually terminate in C13 or C14 inlets, sometimes C19 or C20 on higher-draw units, and connecting several through domestic extension leads is a fire risk rather than a shortcut. A rack PDU rated for continuous load is the correct answer, and it costs a fraction of the machine.',
      'Then the noise, because this is the constraint that most often ends a home deployment. An air-cooled ASIC at full speed produces roughly 75 decibels at a metre, comparable to a vacuum cleaner running permanently. It is audible through walls, it does not stop at night, and enclosures that reduce it also reduce airflow, which raises chip temperatures and shortens hardware life.',
      'Heat follows the same arithmetic as power. A machine drawing 3.4 kilowatts releases essentially 3.4 kilowatts of heat into the room, comparable to three electric heaters running continuously. That requires a genuine air path, intake and exhaust, and in most climates a plan for summer. Recirculating hot exhaust into the intake is the most common cause of throttling in improvised setups.',
      'On the purchase itself, buy from a source that provides a warranty you can actually exercise, with a stated repair or replacement path and a support channel in a language and time zone you can use. Suppliers of new hardware, Uminers among them, typically sell against manufacturer warranty terms, while private secondary-market sales generally carry none. Ask specifically who repairs a failed hashboard and where the unit ships to.',
      'Second-hand hardware is a legitimate route with different diligence. Ask for the manufacturing batch, current firmware, hours run, whether it has been overclocked, and a recent screenshot of per-chip temperatures and hashrate. Older units are cheap because their efficiency only pays at low power prices, so calculate the break-even tariff before treating the discount as a bargain.',
      'Set up the money before the machine arrives. Create the pool account, enable two-factor authentication with a hardware key, and configure the payout to an address in a wallet whose recovery phrase you control and have written down offline. Send a small test payout and confirm it lands where you expect.',
      'Finally, decide honestly between home and hosting. Hosting removes electrical work, noise, heat and most of the maintenance, and replaces them with a monthly rate and a counterparty. For a first machine on a domestic tariff, hosting is frequently the option that turns a negative margin into a positive one, which is a better reason to choose it than convenience.'
    ]
  },
  {
    slug: 'how-mining-income-is-taxed',
    category: 'Practice: From Hobby to Business',
    level: 'Medium',
    format: 'Read',
    durationMins: 13,
    date: '2026-05-06',
    pill: PILL.bitcoin,
    title: 'How Mining Income Is Usually Taxed',
    excerpt: 'The general shape of mining taxation across major jurisdictions, and the records that make it manageable.',
    body: [
      'This is general information about how mining is commonly treated, not tax advice. Rules vary by country, change frequently, and depend on facts specific to each operation. Use this to ask better questions of a qualified adviser in your jurisdiction.',
      'The common starting point is that mined cryptocurrency is income when it is received, valued at its market price on that date. In the United States, guidance from the IRS has treated mining rewards this way since 2014, and many other jurisdictions arrive at a similar position through ordinary trading-income principles. The practical consequence is that a tax liability arises on the day of the payout, regardless of whether the coin was sold.',
      'That valuation then becomes the cost basis. When the coin is later sold, converted or spent, the difference between the disposal proceeds and that basis is typically a capital gain or loss. Coin held through a large drawdown can therefore produce an income tax bill on the receipt and a capital loss on the sale, with those two sitting in different parts of a return and sometimes offsetting nothing.',
      'Whether the activity is a business or a hobby usually determines what you may deduct. A genuine trade, characterised by scale, continuity, commercial organisation and profit intent, generally permits deduction of electricity, hosting fees, pool fees, repairs, rent and depreciation on equipment. Hobby activity commonly permits far less while still taxing the income.',
      'Equipment is normally capitalised rather than expensed at purchase, with the cost recovered across a depreciation schedule. Several jurisdictions offer accelerated or immediate expensing for qualifying assets, which can materially change the timing of tax paid in the year of a large purchase. This is one of the highest-value questions to put to an adviser before ordering hardware rather than after.',
      'Indirect taxes deserve separate attention. Imported machines can attract customs duty and import VAT, sometimes at rates that change the landed cost significantly, and treatment of mining rewards for VAT purposes differs between jurisdictions. Cross-border hosting adds a further layer, since running machines in another country may create tax presence there.',
      'Records are what make all of this tractable. Keep, for every payout, the date and time, the quantity, the fair market value at receipt and the source. Keep invoices for hardware, electricity and hosting. Keep the wallet and pool addresses associated with the business, separated from personal holdings, because commingled wallets are extremely difficult to reconstruct later. Export pool data at least monthly, as history is not always retained indefinitely.',
      'Two errors recur often enough to name. The first is holding all mined coin and having no liquid funds to pay tax on income that was recognised at much higher prices. The second is starting record-keeping in year two and attempting to rebuild year one from memory. Both are cheap to avoid at the start and expensive to fix afterwards.'
    ]
  },
  {
    slug: 'scaling-from-ten-machines-to-a-thousand',
    category: 'Practice: From Hobby to Business',
    level: 'Expert',
    format: 'Read',
    durationMins: 20,
    date: '2026-05-20',
    pill: PILL.mining,
    title: 'Scaling from Ten Machines to a Thousand',
    excerpt: 'Where a small fleet stops working: monitoring, spares ratios, repair capability and the staffing a site actually needs.',
    body: [
      'A ten-machine fleet is managed by attention. A thousand-machine fleet is managed by systems, because the failure rate that produced one dead unit a month now produces several a week, and nobody notices individually.',
      'Monitoring is the first thing that must change. Manual dashboards give way to fleet management software that polls every device, records hashrate, temperature, fan speed, firmware version and pool configuration, and alerts on deviation from a per-model baseline. The critical design choice is alerting on underperformance rather than only on offline status, since a machine running at seventy percent of nameplate for a month costs more than one that failed outright and was replaced the same day.',
      'Physical organisation determines how quickly anything gets fixed. Serial numbers mapped to rack positions, consistent labelling, and IP addressing that reflects physical layout mean a technician walks directly to the right unit. Without that mapping, every ticket begins with a search, and technician time becomes the constraint on uptime.',
      'Spares stop being optional inventory. Common failures cluster in power supplies, fans, hashboards and control boards, and lead times on replacements can run to weeks. Holding a percentage of fleet value as spares is cheaper than the revenue lost while units wait for shipping, and the correct ratio comes from your own observed failure data rather than from a general rule.',
      'At some scale, repair capability moves in-house. A bench with a hot-air station, a power supply tester, a chip tester and a trained technician converts a several-week external repair cycle into a same-week one, and recovers boards that would otherwise be scrapped. The break-even point depends on failure volume and local labour cost, but it arrives sooner than most operators expect.',
      'Standardisation is what makes the rest possible. One firmware version per model, one tuning profile, one pool configuration, one commissioning procedure. Heterogeneous fleets multiply the number of behaviours that look abnormal, which floods alerting and trains staff to ignore it. Version control the configuration and treat any deviation as an incident.',
      'Environment does more damage than most operators credit. Dust degrades cooling gradually until throttling looks like hardware failure, so filter maintenance belongs on a schedule with a named owner. Intake and exhaust separation, positive pressure where appropriate, and humidity control all extend hardware life measurably, and none of them announce themselves when neglected.',
      'Staffing tends to follow megawatts rather than machine count, and the requirement is a mix rather than a headcount: someone accountable for electrical safety, someone for network and software, and technicians for the floor. Shift coverage matters because failures do not respect business hours, and the cost of a night without response is calculable directly from hashprice.',
      'Financial reporting has to scale with the operation. Track cost per bitcoin produced by site and by machine cohort, realised uptime against contracted uptime, and effective hashrate against nameplate. Those three series expose an underperforming cohort or a failing site long before the aggregate revenue number does, and they are the metrics any lender or investor will ask for.',
      'Then plan the fleet as a rolling portfolio rather than a fixed asset. Machines age against a rising difficulty curve, so define in advance the efficiency threshold at which a cohort is sold, redeployed to cheaper power, or retired, and execute on it. Operations that scale successfully are usually the ones that decided how their hardware leaves before deciding how much of it to buy.'
    ]
  }
]
