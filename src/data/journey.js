/**
 * The company's route, 2017 to now — the data behind the dial in JourneyDial.vue.
 *
 * Collected 23 Aug 2026 against the company's own releases and blog, the
 * Blockchain Life organiser's published winner lists, and the engravings on the
 * trophies in awards/output (six as of 24 Aug 2026 — a second 2024 Mining
 * Company of the Year was found in the photo review that day). Every line
 * below is traceable to one of those.
 *
 * WHAT IS DELIBERATELY ABSENT, so nobody re-adds it by accident:
 *
 *   · No person is named. The company is the subject throughout. This is an
 *     editorial decision by the owner, taken 23 Aug 2026, and it is why the
 *     founder's name and the quote attributed to him were removed from
 *     HomeView's about section at the same time.
 *
 *   · No dated AI-compute milestone. The search turned up no public trace of an
 *     AI, HPC or GPU line of business — the company's published record is
 *     Bitcoin infrastructure end to end, and the only AI adjacency found was
 *     sponsoring a Web3/AI conference. The last stop therefore states the
 *     company's present position, in the present tense, rather than claiming a
 *     pivot on a date nothing supports. If internal dates exist, they belong
 *     here and this note should be revised.
 *
 *   · No "350 MW" and no "500 MW across Africa". Both appear in press releases
 *     as plans. The company's own site says more than 300 MW today, so that is
 *     the number used.
 *
 *   · No "Best Mining Company 2024" AS A PRIMARY FACT. Secondary coverage
 *     attributes that specific title to Uminers; the organiser's official
 *     spring-2024 list gives it to another company — that claim stays out.
 *     This is a different object: a photograph review on 24 Aug 2026 turned
 *     up a physical trophy, engraved "Blockchain Life 2024 · Mining Company
 *     of the Year · Uminers", distinct in glass silhouette from the 2025
 *     trophy of the same title. It is carried below at `confidence:
 *     'inferred'`, same tier as the MDOTY 2024 stop beside it — a photographed
 *     engraving is stronger than the secondary coverage rejected above, but
 *     its ceremony date is not independently published, so it is not
 *     'primary'. If the organiser's own list is ever checked against it,
 *     this note and that confidence level should be revisited.
 *
 * `confidence` is carried per stop and is not rendered. It exists so the next
 * person editing this file knows which lines survive a challenge:
 *   'primary'   — the organiser's own winner list, or the company's own release
 *   'company'   — the company says so and nobody independent has confirmed it
 *   'inferred'  — reasoned from two facts that are each solid, but not stated
 */

/* Copy pass, 24 Aug 2026 (spinoza): retitled/retexted every stop so the nine
 * read as one arc (sell a machine -> go direct -> get chosen -> scale -> own
 * the hall -> repeat -> institutional money -> a category renamed -> the hall
 * AI is short of) instead of nine independent cards, and added two backward
 * references (2022, 2024 April) so the throughline is felt, not just implied.
 * No fact, number, name or `confidence` level changed from the audit above —
 * only how each is said. One fact was REMOVED: 'Eight years on' in the last
 * stop, which put a year-count next to 2017 the header above forbids stating
 * (2017->2026 is nine, not eight, and no source fixes the founding month). */
export const JOURNEY = [
  {
    year: '2017',
    title: 'One order, no supply chain',
    text: 'A customer wants a machine that mines. Nothing on the market delivers one, so Uminers is built to be the way in.',
    confidence: 'company'
  },
  {
    year: '2018',
    title: 'The line goes direct',
    text: 'Direct supply opens with Bitmain and Whatsminer. The desk clears break-even in the first quarter and has run since.',
    confidence: 'primary'
  },
  {
    year: '2022',
    title: 'Eighteen thousand people vote',
    text: 'Blockchain Life puts the category to an open public vote. More than eighteen thousand people cast one, and the trophy goes back to the desk that began with a single order.',
    confidence: 'company',
    award: {
      img: '/assets/awards/bl-2022-mining-distributor-of-the-year.webp',
      forum: 'Blockchain Life 2022',
      title: 'Mining Distributor of the Year'
    }
  },
  {
    year: '2023',
    title: 'Two hundred thousand machines',
    text: 'October counts five years of shipping at 200,000 units delivered. The forum votes the same way a second time.',
    confidence: 'company',
    award: {
      img: '/assets/awards/bl-2023-best-mining-distributor.webp',
      forum: 'Blockchain Life 2023',
      title: 'The Best Mining Distributor'
    }
  },
  {
    year: '2024',
    period: 'April',
    title: 'The first hall of its own',
    text: 'Phase one lands in Ethiopia: 100 MW and roughly 24,000 machines, running on hydroelectric power. Uminers stops only shipping the hardware and starts running it.',
    confidence: 'primary',
    award: {
      img: '/assets/awards/bl-2024-best-mining-distributor.webp',
      forum: 'Blockchain Life 2024',
      title: 'Best Mining Distributor'
    }
  },
  {
    /* MDOTY 2024's ceremony date is not independently published — Blockchain
       Life ran two forums in 2024 (April and October), both in Dubai, and this
       award reads for the second one by elimination: BMD is already spent on
       April above. `confidence: 'inferred'` exists so this stays visible as a
       reasoned placement, not a documented one. */
    year: '2024',
    period: 'October',
    title: 'A second forum, a second category',
    text: 'Blockchain Life runs two forums in 2024, both in Dubai. The same company is called up at both, in a different category each time.',
    confidence: 'inferred',
    award: {
      img: '/assets/awards/bl-2024-mining-distributor-of-the-year.webp',
      forum: 'Blockchain Life 2024',
      title: 'Mining Distributor of the Year'
    }
  },
  {
    /* A third 2024 trophy — Blockchain Life 2024, Mining Company of the Year —
       surfaced in the award-photo review (24 Aug 2026): photographed, engraved,
       physically distinct from the 2025 trophy of the same title (different
       glass silhouette). Its ceremony date is not independently published
       either, so it carries the same 'inferred' confidence as the MDOTY 2024
       stop directly above: one company taking more than one category at a
       single ceremony is ordinary, not a sign of a duplicate asset. Placed
       last of the three 2024 stops because it is the category the company
       would go on to win outright, undiluted, in 2025 — see that stop below. */
    year: '2024',
    period: 'October',
    title: 'A third, the same year',
    text: 'A third category from Blockchain Life 2024 turns up in the same year: Mining Company of the Year, the title the desk wins outright, on its own, in 2025.',
    confidence: 'inferred',
    award: {
      img: '/assets/awards/bl-2024-mining-company-of-the-year.webp',
      forum: 'Blockchain Life 2024',
      title: 'Mining Company of the Year'
    }
  },
  {
    year: '2025',
    period: 'February',
    title: 'Custody goes institutional',
    text: 'An integration with Ledger Enterprise lands, and a hardware lending pilot opens beside it, backed by 1,000 BTC.',
    confidence: 'company'
  },
  {
    year: '2025',
    period: 'October',
    title: 'The engraving drops a word',
    text: 'Blockchain Life 2025 reads company, not distributor. Hosting runs at 175 MW on power contracted at $0.055 per kWh.',
    confidence: 'company',
    award: {
      img: '/assets/awards/bl-2025-mining-company-of-the-year.webp',
      forum: 'Blockchain Life 2025',
      title: 'Mining Company of the Year'
    }
  },
  {
    year: 'Now',
    title: 'The halls run either way',
    text: 'More than 300 MW under management. The halls were built to run mining, and they are the halls AI compute is short of.',
    confidence: 'primary'
  }
]

export default JOURNEY
