/**
 * The company's route, 2017 to now — the data behind the dial in JourneyDial.vue.
 *
 * Collected 23 Aug 2026 against the company's own releases and blog, the
 * Blockchain Life organiser's published winner lists, and the engravings on the
 * five trophies in awards/output. Every line below is traceable to one of those.
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
 *   · No "Best Mining Company 2024". Secondary coverage attributes it to
 *     Uminers; the organiser's official spring-2024 list gives it to another
 *     company. The trophy that does read "Mining Company of the Year" is
 *     engraved Blockchain Life 2025, not 2024 — HomeView carried it as 2024
 *     and that was corrected.
 *
 * `confidence` is carried per stop and is not rendered. It exists so the next
 * person editing this file knows which lines survive a challenge:
 *   'primary'   — the organiser's own winner list, or the company's own release
 *   'company'   — the company says so and nobody independent has confirmed it
 *   'inferred'  — reasoned from two facts that are each solid, but not stated
 */

export const JOURNEY = [
  {
    year: '2017',
    title: 'One order for a machine',
    text: 'A customer asks for a machine that mines. There is no straightforward way in, so Uminers is built to be one.',
    confidence: 'company'
  },
  {
    year: '2018',
    title: 'Break-even in one quarter',
    text: 'Direct supply opens with Bitmain and Whatsminer. The desk clears break-even in the first quarter and has run since.',
    confidence: 'primary'
  },
  {
    year: '2022',
    title: 'Mining Distributor of the Year',
    text: 'Blockchain Life puts the category to an open public vote. More than eighteen thousand people cast one.',
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
    title: 'A hydro campus in Ethiopia',
    text: 'The first phase lands: 100 MW and roughly 24,000 machines, running on hydroelectric power.',
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
    title: 'Voted again, same year',
    text: 'A second Blockchain Life, a second category, the same company on the stage both times.',
    confidence: 'inferred',
    award: {
      img: '/assets/awards/bl-2024-mining-distributor-of-the-year.webp',
      forum: 'Blockchain Life 2024',
      title: 'Mining Distributor of the Year'
    }
  },
  {
    year: '2025',
    period: 'February',
    title: 'Custody goes institutional',
    text: 'An integration with Ledger Enterprise, alongside a hardware lending pilot backed by 1,000 BTC.',
    confidence: 'company'
  },
  {
    year: '2025',
    period: 'October',
    title: 'Mining Company of the Year',
    text: 'The engraving stops saying distributor. Hosting runs at 175 MW, with power contracted at $0.055 per kWh.',
    confidence: 'company',
    award: {
      img: '/assets/awards/bl-2025-mining-company-of-the-year.webp',
      forum: 'Blockchain Life 2025',
      title: 'Mining Company of the Year'
    }
  },
  {
    year: 'Now',
    title: 'Past three hundred megawatts',
    text: 'Eight years on, more than 300 MW under management — and the halls built for mining are the halls AI is short of.',
    confidence: 'primary'
  }
]

export default JOURNEY
