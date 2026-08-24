<script setup>
import { onMounted } from 'vue'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import ThemeSection from '@/components/ThemeSection.vue'
import ViewFinder from '@/components/ViewFinder.vue'
import MicroLabel from '@/components/MicroLabel.vue'
import SplitText from '@/components/SplitText.vue'
import DotMatrixIcon from '@/components/DotMatrixIcon.vue'
import GridMarks from '@/components/GridMarks.vue'
import VideoPlate from '@/components/VideoPlate.vue'
import JourneyDial from '@/components/JourneyDial.vue'
import { venomMark, venomLayout, MARKS } from '@/lib/venomBus'

// coming back from the catalogue, the substance returns to the mark, centred
onMounted(() => {
  venomLayout()
  venomMark(MARKS.bull)
})

const navLinks = [
  { label: 'Catalogue', route: '/catalogue' },
  { label: 'The film', href: '#film', half: true },
  { label: 'Company', href: '#about', half: true },
  { label: 'Journey', href: '#awards', half: true },
  { label: 'Get started', href: '#start', half: true },
  { label: 'Contact', href: '#contact' }
]

const footerLinks = [
  { label: 'Catalogue', href: '/catalogue' },
  { label: 'The film', href: '#film' },
  { label: 'Company', href: '#about' },
  { label: 'Journey', href: '#awards' },
  { label: 'Contact', href: '#contact' }
]

const capabilities = [
  { icon: 'surge', name: 'Power first',
    text: 'Generation contracted at the source, tariffs argued down before a foundation is poured.' },
  { icon: 'stats', name: 'Modular capacity',
    text: 'HydroCore and DeepCore containers, standardised so the tenth ships as fast as the first.' },
  { icon: 'blowOut', name: 'Air, water, immersion',
    text: 'Cooling chosen for the climate and the load, engineered in-house.' },
  { icon: 'pong', name: 'Hardware, sourced direct',
    text: 'Miners by the container since 2017. The same desk now quotes AI compute.' },
  { icon: 'scope', name: 'Logistics that hold',
    text: 'Freight, customs and lead times, handled by people who have moved this for years.' },
  { icon: 'orbit', name: 'Watched around the clock',
    text: 'Telemetry all night, crews on site, spares on the shelf. Uptime is the product.' }
]

/* The awards grid and the prose timeline that used to live here are both gone,
   replaced by JourneyDial — one dial that carries the stops and the trophies
   together, which is what they were always describing separately.

   Two corrections went with the move, and neither was cosmetic:
     · "Mining Company of the Year" was listed under 2024. The trophy is
       engraved Blockchain Life 2025. The organiser's official spring-2024 list
       awards that category to another company, so the old line was repeating a
       mistake that secondary coverage had already made.
     · The 2010 stop opened the story in Beijing, on a person. Both are out; the
       dial starts at 2017, with the company as the subject throughout.
   The data and the reasoning now live in src/data/journey.js. */

const catalogue = [
  { n: '01', name: 'AI compute', text: 'Accelerator platforms, quoted with somewhere to run them.', hash: '#ai' },
  { n: '02', name: 'ASIC miners', text: 'Antminer and Whatsminer, direct with warranty.', hash: '#asic' },
  { n: '03', name: 'GPUs', text: 'Cards by the tray or by the pallet.', hash: '#gpu' },
  { n: '04', name: 'Networking', text: 'Switches, adapters and DPUs for the fabric.', hash: '#servers' },
  { n: '05', name: 'Containers', text: 'DeepCore and HydroCore, built by Uminers.', hash: '#containers' },
  { n: '06', name: 'Power gear', text: 'Transformers and switchgear, specified per site.', hash: '#power' }
]
</script>

<template>
  <SiteHeader :links="navLinks" glass />

  <main>
    <!-- ═══ hero ═══════════════════════════════════════════════════════ -->
    <ThemeSection theme="light" venom flush>
      <div class="wrapper hero">
        <ViewFinder position="top" />
        <div class="hero__body">
          <MicroLabel text="The mining desk, now supplying AI" block />
          <SplitText tag="h1">
            <span class="line">Uminers.</span>
            <span class="line">This is where intelligence runs.</span>
          </SplitText>
          <div class="actions">
            <RouterLink class="btn btn--primary" to="/catalogue"><span>Browse the catalogue</span></RouterLink>
            <a class="btn btn--transparent" href="#contact"><span>Talk to Uminers</span></a>
          </div>
        </div>
        <ViewFinder position="bottom" />
      </div>
    </ThemeSection>

    <!-- ═══ statement ══════════════════════════════════════════════════ -->
    <ThemeSection theme="white">
      <div class="wrapper" style="position: relative">
        <GridMarks corners="tl tr" />
        <MicroLabel text="You already know the name" block />
        <SplitText tag="p" class="statement">
          Uminers is the desk the mining industry keeps naming its
          distributor of the year. The same desk now supplies AI compute.
        </SplitText>
      </div>
    </ThemeSection>

    <!-- ═══ the film ═══════════════════════════════════════════════════ -->
    <ThemeSection theme="white" id="film">
      <div class="wrapper" style="position: relative">
        <GridMarks corners="bl br" />
        <MicroLabel text="The film" block />
        <SplitText tag="h2" class="type-xl">Watch it run.</SplitText>
        <VideoPlate
          video-id="ALsfgRH2wAI"
          :start="21"
          poster="/assets/img/film-poster.jpg"
          title="Uminers — the film"
          caption="Uminers · The film"
        />
      </div>
    </ThemeSection>

    <!-- ═══ capabilities — animated icons on white ═════════════════════ -->
    <ThemeSection theme="white" id="capabilities">
      <div class="wrapper">
        <div class="ticks" aria-hidden="true" />
        <MicroLabel text="What it takes" block />
        <SplitText tag="h2" class="type-xl">Six things have to be true at once.</SplitText>

        <div class="caps">
          <div v-for="(c, i) in capabilities" :key="c.name" class="cap">
            <DotMatrixIcon :variant="c.icon" :index="i" />
            <p class="cap__name">{{ c.name }}</p>
            <p class="cap__text">{{ c.text }}</p>
          </div>
        </div>
      </div>
    </ThemeSection>

    <!-- ═══ about ══════════════════════════════════════════════════════ -->
    <ThemeSection theme="black" id="about">
      <div class="wrapper">
        <MicroLabel text="About Uminers" block />
        <SplitText tag="h2" class="type-xxl">It started with one order for a machine.</SplitText>

        <SplitText tag="p" class="body">
          <strong>It began at a trading desk, with one unusual request: a machine that mines.</strong>
          There was no straightforward way to get one, so Uminers was built to be that way in.
          It broke even in the first quarter of 2018. It has been running since.
        </SplitText>

        <SplitText tag="p" class="body">
          Mining stopped being a software story years ago. It is hardware, capital and
          logistics standing in one place at one time — which is why AI is not a pivot here.
          Uminers spent years putting megawatts, buildings, cooling and crews together.
          The chips changed. The problem did not.
        </SplitText>

        <div class="band">
          <figure>
            <img src="/assets/img/company-frame-27-lg.webp" alt="Uminers booth at a mining industry expo in the United States" loading="lazy">
            <figcaption class="label">Trade floor · United States</figcaption>
          </figure>
          <figure>
            <img src="/assets/img/company-dsc01998.webp" alt="Uminers engineer on site at night" loading="lazy">
            <figcaption class="label">Night shift · On site</figcaption>
          </figure>
        </div>
      </div>
    </ThemeSection>

    <!-- ═══ awards ═════════════════════════════════════════════════════ -->
    <ThemeSection theme="black" id="awards">
      <div class="wrapper">
        <MicroLabel text="2017 — now" block />
        <SplitText tag="h2" class="type-xl">Eight years, told in stops.</SplitText>
        <SplitText tag="p" class="body">
          Blockchain Life is the sector's largest forum — 16,730 people from 130 countries at
          the 2025 edition — and its categories are decided by open public vote rather than by
          a jury. Uminers has sponsored the forum, and was its general sponsor in 2025. The
          engravings are photographed as they read.
        </SplitText>

        <JourneyDial />

        <div class="cards">
          <article class="card">
            <!-- The lede used to read "confirmed from both sides" and the line
                 put Ledger's chief executive on the record. Neither survived a
                 source check: the only account of this is the company's own
                 release of 19 Feb 2025, whose headline is still in the future
                 tense, and Ledger has published nothing of its own. Stated here
                 as what it is — an integration the company announced. -->
            <h3>Ledger</h3>
            <p class="body card__lede">Institutional self-custody.</p>
            <p class="body">An integration with Ledger Enterprise, announced by Uminers in February 2025 alongside a hardware lending pilot backed by 1,000 BTC.</p>
          </article>
          <article class="card">
            <h3>Binance Custody</h3>
            <p class="body card__lede">Announced by Binance, not by us.</p>
            <p class="body">Uminers moved its asset custody to Binance. The announcement came from Binance Custody's own channel.</p>
          </article>
        </div>
      </div>
    </ThemeSection>

    <!-- ═══ clusters ═══════════════════════════════════════════════════ -->
    <ThemeSection theme="light" id="power">
      <div class="wrapper cluster">
        <div class="cluster__text">
          <p class="usage">Find, Contract, Connect</p>
          <SplitText tag="h2" class="type-xl">Compute is limited by power, not by chips.</SplitText>
          <SplitText tag="p" class="body">
            <strong>Uminers starts where the electricity is.</strong>
            It contracts generation at the source and turns raw megawatts into capacity
            someone can book. Ordering accelerators is the easy part. Having somewhere
            to run them is the work.
          </SplitText>
        </div>
        <figure class="plate cluster__media">
          <p class="viewfinder-title">Site 01 · 24/7</p>
          <ViewFinder />
          <img src="/assets/img/site-aerial-dusk.jpg" alt="Uminers site at dusk"
               loading="lazy" style="margin-top: var(--spacingM)">
        </figure>
      </div>
    </ThemeSection>

    <ThemeSection theme="light">
      <div class="wrapper cluster cluster--flip">
        <div class="cluster__text">
          <p class="usage">Design, Build, Ship</p>
          <SplitText tag="h2" class="type-xl">Months, not years.</SplitText>
          <SplitText tag="p" class="body">
            <strong>Uminers ships capacity, not drawings.</strong>
            Halls and containers are built to a standard and set down where the power
            already is, so the first rack energises while a conventional build is
            still waiting on permits.
          </SplitText>
        </div>
        <figure class="plate cluster__media">
          <p class="viewfinder-title">HydroCore 240 · Modular</p>
          <ViewFinder />
          <img src="/assets/catalog/container/hydrocore-240-3u.png" alt="Uminers HydroCore container"
               loading="lazy" style="margin-top: var(--spacingM)">
        </figure>
      </div>
    </ThemeSection>

    <!-- ═══ catalogue teaser ═══════════════════════════════════════════ -->
    <ThemeSection theme="white" id="catalogue">
      <div class="wrapper" style="position: relative">
        <GridMarks corners="tl br" />
        <MicroLabel text="Catalogue" block />
        <SplitText tag="h2" class="type-xl">The catalogue is open.</SplitText>
        <SplitText tag="p" class="body">
          Sourced direct, shipped worldwide. Line items, or a working site.
        </SplitText>

        <div class="tiles">
          <RouterLink
            v-for="c in catalogue"
            :key="c.n"
            class="tile plain"
            :to="{ path: '/catalogue', hash: c.hash }"
          >
            <p class="label label--faded">{{ c.n }}</p>
            <p class="tile__name">{{ c.name }}</p>
            <p class="body">{{ c.text }}</p>
            <p class="label tile__meta">Explore <i class="tile__arrow">↗</i></p>
          </RouterLink>
        </div>

        <div class="actions" style="margin-top: var(--spacingXL)">
          <RouterLink class="btn btn--primary" to="/catalogue"><span>Browse the catalogue</span></RouterLink>
        </div>
      </div>
    </ThemeSection>

    <!-- ═══ get started ════════════════════════════════════════════════ -->
    <ThemeSection theme="dark" id="start">
      <div class="wrapper">
        <SplitText tag="h2" class="type-xl">Uminers, for your power and your workload.</SplitText>
        <p class="lede">Bring either one.<br>Uminers brings the rest.</p>

        <div class="steps">
          <div class="step">
            <p class="step__title">Tell us</p>
            <p class="step__body">Where the megawatts are, or what the workload needs. One paragraph is enough to start.</p>
            <a class="btn btn--primary" href="#contact"><span>Send a brief</span></a>
          </div>
          <div class="step">
            <p class="step__title">Choose</p>
            <p class="step__body">Containers, a build-to-suit hall, or rack space at a site that is already running.</p>
            <RouterLink class="btn btn--transparent" to="/catalogue"><span>See the catalogue</span></RouterLink>
          </div>
          <div class="step">
            <p class="step__title">Run</p>
            <p class="step__body">Uminers builds it, energises it, and keeps it running. You get capacity and a number to call.</p>
          </div>
        </div>
      </div>
    </ThemeSection>

    <!-- ═══ contact ════════════════════════════════════════════════════ -->
    <ThemeSection theme="white" id="contact">
      <div class="wrapper" style="position: relative">
        <GridMarks corners="tr bl" />
        <MicroLabel text="Start here" block />
        <SplitText tag="h2" class="type-xxl">Tell Uminers where the power is.</SplitText>
        <SplitText tag="p" class="body">
          A first answer on siting, capacity and schedule comes back inside a week.
        </SplitText>
        <div class="actions" style="margin-top: var(--spacingXL)">
          <a class="btn btn--primary" href="mailto:info@uminers.com"><span>info@uminers.com</span></a>
          <RouterLink class="btn btn--transparent" to="/catalogue"><span>Browse the catalogue</span></RouterLink>
        </div>
      </div>
    </ThemeSection>
  </main>

  <SiteFooter :links="footerLinks" />
</template>
