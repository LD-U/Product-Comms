import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ExternalLink, Filter, Megaphone, Moon, Search, Sparkles, Sun } from 'lucide-react';
import type { Release } from './types';
import { groupBySequencing, priorityExplanation } from './lib/timeline';


type PageView = 'roadmap' | 'suite';

const suiteProducts = [
  {
    name: 'Solutions DGR',
    category: 'Retail operating system',
    summary: 'Manages the operational lifecycle of donated and purchased goods across donation tracking, production, inventory, POS, loyalty, and reporting.',
    handles: ['Donation Tracking', 'Production', 'Inventory', 'POS', 'Loyalty', 'Reporting'],
    buyers: ['COO', 'VP Retail', 'Store Operations', 'IT Leadership'],
    colorClass: 'suite-dgr'
  },
  {
    name: 'Upright Lister',
    category: 'E-commerce listing engine',
    summary: 'Helps teams create listings, generate SKUs, build manifests, process marketplace work, and manage e-commerce throughput.',
    handles: ['Listing', 'SKU Generation', 'Manifest Creation', 'Order Processing', 'Shipping Workflows'],
    buyers: ['E-commerce Director', 'Marketplace Manager', 'Operations Lead'],
    colorClass: 'suite-lister'
  },
  {
    name: 'Upright Link',
    category: 'Operations workflow layer',
    summary: 'Connects item movement, photography, storage, transportation tracking, fulfillment, packing, and shipping workflows.',
    handles: ['Photography', 'Storage', 'Transportation Tracking', 'Fulfillment', 'Packing and Shipping'],
    buyers: ['Warehouse Manager', 'E-commerce Operations', 'Fulfillment Lead'],
    colorClass: 'suite-link'
  },
  {
    name: 'pearldive',
    category: 'AI productivity platform',
    summary: 'Applies AI to product identification, value estimation, sorting, auto-listing, and predictive selling decisions.',
    handles: ['AI Sorting', 'Product Identification', 'Value Estimation', 'Auto-listing', 'Predictive Data'],
    buyers: ['E-commerce Leader', 'Innovation Team', 'Executive Leadership'],
    colorClass: 'suite-pearldive'
  }
];

const workflowStages = [
  { label: 'Donation', products: ['Solutions DGR'], note: 'Donor intake, documentation, and receipts' },
  { label: 'Sorting', products: ['Solutions DGR', 'pearldive'], note: 'AI-supported triage, routing, and value estimation' },
  { label: 'Production', products: ['Solutions DGR'], note: 'Category assignment, pricing, tags, and retail readiness' },
  { label: 'Inventory', products: ['Solutions DGR', 'Upright Link'], note: 'Stock visibility, movement, storage, and cycling' },
  { label: 'Retail', products: ['Solutions DGR'], note: 'POS, payments, promotions, loyalty, and sales' },
  { label: 'E-commerce', products: ['Upright Lister', 'Upright Link', 'pearldive'], note: 'Listing, photography, fulfillment, and shipping' },
  { label: 'Insights', products: ['Solutions DGR', 'Upright Lister', 'pearldive'], note: 'Sales, productivity, inventory, and predictive data' }
];

const buyerOutcomes = [
  { buyer: 'Executive leaders', outcome: 'Business visibility into top KPIs and strategic performance across retail and e-commerce.' },
  { buyer: 'Retail leaders', outcome: 'Progress against store goals, productivity, donation flow, sales, and inventory health.' },
  { buyer: 'E-commerce leaders', outcome: 'Listing throughput, fulfillment performance, sales productivity, and growth opportunities.' },
  { buyer: 'Store leaders', outcome: 'Tools for team productivity, supply planning, donor intake, production, and POS operations.' },
  { buyer: 'Frontline staff', outcome: 'Task-specific tools for intake, sorting, production, checkout, listing, packing, and shipping.' }
];



function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'strong' | 'soft' | 'warning' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function ReleaseCard({ release, primary = false }: { release: Release; primary?: boolean }) {
  return (
    <article id={`release-${release.id}`} className={`release-card ${primary ? 'release-card-primary' : ''}`}>
      <div className="release-card-topline">
        <div>
          <p className="release-area">{release.product || release.productArea}</p>
          <h3>{release.name}</h3>
        </div>
        <Badge tone={release.confidence === 'Delayed' ? 'warning' : primary ? 'strong' : 'default'}>{release.targetWindow}</Badge>
      </div>

      <p className="impact">{release.customerImpact}</p>

      <div className="answer-grid">
        <div>
          <span>Why it matters</span>
          <p>{release.whyItMatters}</p>
        </div>
        <div>
          <span>Who it impacts</span>
          <p>{release.whoImpacted.join(', ')}</p>
        </div>
        <div>
          <span>Workflows changing</span>
          <p>{release.workflowChanging.join(', ')}</p>
        </div>
        <div>
          <span>Affected screens</span>
          <p>{release.affectedScreens.join(', ')}</p>
        </div>
      </div>

      <div className="benefits-row">
        {release.operationalBenefits.map((benefit) => <Badge key={benefit} tone="soft">{benefit}</Badge>)}
      </div>

      <div className="talking-points">
        <div className="section-label"><Megaphone size={16} /> CS/Sales talking points</div>
        <ul>
          {release.talkingPoints.map((point) => <li key={point}>{point}</li>)}
        </ul>
      </div>

      <footer className="release-footer">
        <span>{release.type}</span>
        <span>{release.priority}: {priorityExplanation(release.priority)}</span>
        {release.demoUrl ? <a href={release.demoUrl} target="_blank" rel="noopener noreferrer">Demo <ExternalLink size={14} /></a> : <span>Demo pending</span>}
      </footer>
    </article>
  );
}


function CommerceProductSuiteOverview({ onOpenSuite }: { onOpenSuite: () => void }) {
  return (
    <section className="suite-overview-card">
      <div className="suite-overview-copy">
        <p className="suite-kicker">Commerce product suite</p>
        <h2>One connected lifecycle for donated goods commerce</h2>
        <span>
          Upright connects donation intake, sorting, production, inventory, retail sales,
          e-commerce listing, fulfillment, and insights into a single product story.
        </span>
      </div>

      <div className="suite-overview-flow" aria-label="Commerce product suite workflow">
        {workflowStages.slice(0, 6).map((stage, index) => (
          <div className="suite-flow-step" key={stage.label}>
            <strong>{stage.label}</strong>
            <span>{stage.products.join(' + ')}</span>
            {index < 5 && <i aria-hidden="true">→</i>}
          </div>
        ))}
      </div>

      <div className="suite-overview-products">
        {suiteProducts.map((product) => (
          <article key={product.name} className={`suite-mini-product ${product.colorClass}`}>
            <p>{product.category}</p>
            <strong>{product.name}</strong>
            <span>{product.summary}</span>
          </article>
        ))}
      </div>

      <button type="button" className="suite-open-button" onClick={onOpenSuite}>
        Open expanded product suite
        <ArrowRight size={16} />
      </button>
    </section>
  );
}

function CommerceProductSuitePage({ onBack }: { onBack: () => void }) {
  return (
    <main className="suite-page">
      <button type="button" className="suite-back-button" onClick={onBack}>
        ← Back to release roadmap
      </button>

      <section className="suite-hero">
        <p className="suite-kicker">Sales enablement</p>
        <h1>Commerce Product Suite</h1>
        <span>
          Use this page to explain what Upright sells from a total product-suite perspective:
          not disconnected tools, but the full lifecycle from donation to final sale.
        </span>
      </section>

      <section className="suite-section">
        <div className="suite-section-heading">
          <p>Platform story</p>
          <h2>The lifecycle we help customers run</h2>
        </div>

        <div className="suite-workflow-map">
          {workflowStages.map((stage, index) => (
            <article key={stage.label} className="suite-workflow-stage">
              <div className="suite-stage-number">{index + 1}</div>
              <div>
                <h3>{stage.label}</h3>
                <p>{stage.note}</p>
                <div className="suite-chip-row">
                  {stage.products.map((product) => (
                    <span key={product}>{product}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="suite-section">
        <div className="suite-section-heading">
          <p>What we sell</p>
          <h2>Product positioning guide</h2>
        </div>

        <div className="suite-product-grid">
          {suiteProducts.map((product) => (
            <article key={product.name} className={`suite-product-card ${product.colorClass}`}>
              <p>{product.category}</p>
              <h3>{product.name}</h3>
              <span>{product.summary}</span>

              <div className="suite-card-block">
                <strong>Handles</strong>
                <div className="suite-chip-row">
                  {product.handles.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>

              <div className="suite-card-block">
                <strong>Primary buyers</strong>
                <div className="suite-chip-row">
                  {product.buyers.map((buyer) => (
                    <span key={buyer}>{buyer}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="suite-section suite-two-column">
        <div>
          <div className="suite-section-heading">
            <p>How to sell it</p>
            <h2>Workflow-first positioning</h2>
          </div>
          <div className="suite-positioning-card">
            <strong>Competitors sell tools. Upright sells the workflow.</strong>
            <p>
              A prospect may ask about POS, listing, inventory, or AI. The larger story is that
              each capability connects to the same lifecycle: donation intake, item data capture,
              routing, selling destination, fulfillment, and performance insight.
            </p>
          </div>
        </div>

        <div>
          <div className="suite-section-heading">
            <p>Buyer outcomes</p>
            <h2>Translate products into business value</h2>
          </div>
          <div className="suite-buyer-list">
            {buyerOutcomes.map((item) => (
              <article key={item.buyer}>
                <strong>{item.buyer}</strong>
                <span>{item.outcome}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="suite-section">
        <div className="suite-section-heading">
          <p>Cross-sell motion</p>
          <h2>Natural expansion path</h2>
        </div>

        <div className="suite-expansion-path">
          {['Solutions DGR', 'Inventory', 'Upright Lister', 'Upright Link', 'pearldive'].map((step, index) => (
            <div key={step} className="suite-expansion-step">
              <strong>{step}</strong>
              {index < 4 && <ArrowRight size={18} />}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}


function ThemeToggle({ theme, onToggle }: { theme: 'light' | 'dark'; onToggle: () => void }) {
  return (
    <button type="button" className="theme-toggle" onClick={onToggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      {theme === 'dark' ? 'Light' : 'Dark'} mode
    </button>
  );
}

function TimelineLane({ sequence, eyebrow, title, description, releases }: ReturnType<typeof groupBySequencing>[number]) {
  const primary = sequence === 1;
  return (
    <section className={`timeline-lane sequence-${sequence}`}>
      <div className="lane-header">
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
          <span>{description}</span>
        </div>
      </div>
      <div className="lane-cards">
        {releases.length ? releases.map((release) => <ReleaseCard key={release.id} release={release} primary={primary} />) : <div className="empty-state">No published releases in this sequence.</div>}
      </div>
    </section>
  );
}

export function App() {
  const [query, setQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('All');
  const [releases, setReleases] = useState<Release[]>([]);
  const [dataSource, setDataSource] = useState<'loading' | 'notion' | 'error'>('loading');
  const [syncWarning, setSyncWarning] = useState<string | null>(null);
  const [pageView, setPageView] = useState<PageView>('roadmap');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.localStorage.getItem('product-dashboard-theme') === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    let cancelled = false;

    async function loadReleases() {
      try {
        const response = await fetch('/api/releases');
        if (!response.ok) throw new Error(`API request failed with ${response.status}`);
        const payload = await response.json();
        if (cancelled) return;

        setReleases(payload.releases ?? []);
        setDataSource('notion');
        setSyncWarning(payload.releases?.length ? null : 'No sequenced Notion releases found. Add Sequencing = 1, 2, or 3 to records that should appear.');
      } catch (error) {
        if (cancelled) return;
        setReleases([]);
        setDataSource('error');
        setSyncWarning(error instanceof Error ? error.message : 'Unable to load Notion releases.');
      }
    }

    loadReleases();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('product-dashboard-theme', theme);
  }, [theme]);

  const productAreas = useMemo(() => ['All', ...Array.from(new Set(releases.map((release) => release.product || release.productArea)))], [releases]);

  const filteredReleases = useMemo(() => {
    return releases.filter((release) => {
      const haystack = [release.name, release.product, release.productArea, release.customerImpact, release.whyItMatters, ...release.workflowChanging, ...release.affectedScreens, ...release.whoImpacted].join(' ').toLowerCase();
      return (!query || haystack.includes(query.toLowerCase()))
        && (areaFilter === 'All' || release.product === areaFilter || release.productArea === areaFilter);
    });
  }, [releases, query, areaFilter]);

  const lanes = groupBySequencing(filteredReleases);
  const sequenceOneReleases = filteredReleases.filter((release) => release.sequencing === 1);

  if (pageView === 'suite') {
    return (
      <>
        <ThemeToggle theme={theme} onToggle={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />
        <CommerceProductSuitePage onBack={() => setPageView('roadmap')} />
      </>
    );
  }

  return (
    <main>
      <ThemeToggle theme={theme} onToggle={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={16} /> Commerce release communications</div>
          <h1>Product Details</h1>
          <p>
            A customer-outcome-first dashboard for communicating what is changing, why it matters, who it impacts,
            when it is coming, and how it improves customer workflows.
          </p>
          <div className="source-banner">
            <strong>{dataSource === 'notion' ? 'Live Notion data' : dataSource === 'loading' ? 'Loading Notion data' : 'Notion sync error'}</strong>
            <span>{dataSource === 'notion' ? 'This dashboard is synced from Notion records.' : syncWarning ?? 'Checking the local API route for Notion releases.'}</span>
          </div>
          <div className="vision-card">
            <strong>Product vision</strong>
            <span>Unlock the value of unique secondhand goods through intelligent, purpose-built software.</span>
            <em>More Revenue Per Donation. More Mission Per Dollar.</em>
          </div>
        </div>
        <aside className="priority-panel">
          <p>Priority content</p>
          <h2>Soon-to-release projects</h2>
          <span>Projects sequenced first are listed here for quick access to their full cards below.</span>
          <div className="priority-project-list">
            {sequenceOneReleases.length ? sequenceOneReleases.map((release) => (
              <a key={release.id} href={`#release-${release.id}`}>
                <strong>{release.name}</strong>
                <small>{release.product || release.productArea}</small>
              </a>
            )) : <div className="priority-empty">No sequence 1 projects match the current filters.</div>}
          </div>
        </aside>
      </section>

      <CommerceProductSuiteOverview onOpenSuite={() => setPageView('suite')} />

      <section className="filters" aria-label="Release filters">
        <div className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by customer impact, workflow, screen, or release" /></div>
        <label><Filter size={16} /> Product<select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)}>{productAreas.map((option) => <option key={option}>{option}</option>)}</select></label>
      </section>


      <div className="timeline">
        {lanes.map((lane) => <TimelineLane key={lane.sequence} {...lane} />)}
      </div>
    </main>
  );
}
