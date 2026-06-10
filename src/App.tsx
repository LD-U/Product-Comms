import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, ExternalLink, Filter, Home, ListChecks, Megaphone, Moon, Search, Sparkles, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Release, Sequencing } from './types';
import { priorityExplanation } from './lib/timeline';

type PageView = 'home' | 'sales';
type RoadmapTab = Sequencing;

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
  { label: 'E-commerce', products: ['Upright Lister', 'Upright Link', 'pearldive'], note: 'Listing, photography, fulfillment, and shipping' }
];

const buyerOutcomes = [
  { buyer: 'Executive leaders', outcome: 'Business visibility into top KPIs and strategic performance across retail and e-commerce.' },
  { buyer: 'Retail leaders', outcome: 'Progress against store goals, productivity, donation flow, sales, and inventory health.' },
  { buyer: 'E-commerce leaders', outcome: 'Listing throughput, fulfillment performance, sales productivity, and growth opportunities.' },
  { buyer: 'Store leaders', outcome: 'Tools for team productivity, supply planning, donor intake, production, and POS operations.' },
  { buyer: 'Frontline staff', outcome: 'Task-specific tools for intake, sorting, production, checkout, listing, packing, and shipping.' }
];

const sequenceTabs: Array<{ sequence: RoadmapTab; label: string; eyebrow: string }> = [
  { sequence: 1, label: 'Soon', eyebrow: 'Sequence 1' },
  { sequence: 2, label: 'Next', eyebrow: 'Sequence 2' },
  { sequence: 3, label: 'Later', eyebrow: 'Sequence 3' }
];

function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'strong' | 'soft' | 'warning' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function sortReleases(releases: Release[]) {
  return [...releases].sort((a, b) => {
    if (a.sequencing !== b.sequencing) return a.sequencing - b.sequencing;
    const dateA = a.targetDate || a.targetWindow || '';
    const dateB = b.targetDate || b.targetWindow || '';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return a.name.localeCompare(b.name);
  });
}

function isEcommerceRelease(release: Release) {
  const text = [release.product, release.productArea, ...release.workflowChanging, ...release.affectedScreens].join(' ').toLowerCase();
  return text.includes('e-commerce') || text.includes('ecommerce') || text.includes('lister') || text.includes('link') || text.includes('marketplace') || text.includes('shipping') || text.includes('fulfillment');
}

function isRetailRelease(release: Release) {
  const text = [release.product, release.productArea, ...release.workflowChanging, ...release.affectedScreens].join(' ').toLowerCase();
  return text.includes('retail') || text.includes('pos') || text.includes('donation') || text.includes('production') || text.includes('dgr') || text.includes('store');
}

function ReleaseCard({ release, primary = false, expanded, onToggle }: { release: Release; primary?: boolean; expanded: boolean; onToggle: () => void }) {
  const detailId = `release-details-${release.id}`;

  return (
    <article id={`release-${release.id}`} className={`release-card ${primary ? 'release-card-primary' : ''} ${expanded ? 'is-expanded' : ''}`}>
      <button
        type="button"
        className="release-card-summary"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={detailId}
      >
        <div className="release-card-topline">
          <div>
            <p className="release-area">{release.product || release.productArea}</p>
            <h3>{release.name}</h3>
          </div>
          <Badge tone={release.confidence === 'Delayed' ? 'warning' : primary ? 'strong' : 'default'}>{release.targetWindow}</Badge>
        </div>

        <p className="impact">{release.customerImpact}</p>

        <div className="benefits-row compact-benefits" aria-label="Key benefits">
          {release.operationalBenefits.slice(0, 3).map((benefit) => <Badge key={benefit} tone="soft">{benefit}</Badge>)}
        </div>

        <span className="expand-hint">
          {expanded ? 'Hide details' : 'View details'}
          <ChevronDown size={16} />
        </span>
      </button>

      {expanded && (
        <div id={detailId} className="release-expanded-content">
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

          {release.operationalBenefits.length > 3 && (
            <div className="benefits-row">
              {release.operationalBenefits.slice(3).map((benefit) => <Badge key={benefit} tone="soft">{benefit}</Badge>)}
            </div>
          )}

          <details className="talking-points">
            <summary><span className="section-label"><Megaphone size={16} /> CS/Sales talking points</span></summary>
            <ul>
              {release.talkingPoints.map((point) => <li key={point}>{point}</li>)}
            </ul>
          </details>

          <footer className="release-footer">
            <span>{release.type}</span>
            <span>{release.priority}: {priorityExplanation(release.priority)}</span>
            {release.demoUrl ? <a href={release.demoUrl} target="_blank" rel="noopener noreferrer">Demo <ExternalLink size={14} /></a> : <span>Demo pending</span>}
          </footer>
        </div>
      )}
    </article>
  );
}

function ProductVisionCard() {
  return (
    <section className="vision-card vision-card-expanded" aria-label="Product vision">
      <p className="section-kicker">Product vision</p>
      <h2>Unlock the value of unique secondhand goods through intelligent, purpose-built software.</h2>
      <em>More Revenue Per Donation. More Mission Per Dollar.</em>
    </section>
  );
}

function NotionSyncStatus({ dataSource, syncWarning }: { dataSource: 'loading' | 'notion' | 'error'; syncWarning: string | null }) {
  return (
    <div className="source-banner compact-source" aria-live="polite">
      <strong>{dataSource === 'notion' ? 'Live Notion data' : dataSource === 'loading' ? 'Loading' : 'Sync issue'}</strong>
      <span>{dataSource === 'notion' ? 'Synced' : syncWarning ?? 'Checking API'}</span>
    </div>
  );
}

function SoonReleaseRail({ releases, onSelect }: { releases: Release[]; onSelect: (releaseId: string) => void }) {
  const soon = sortReleases(releases.filter((release) => release.sequencing === 1));
  const ecommerce = soon.filter(isEcommerceRelease);
  const retail = soon.filter((release) => isRetailRelease(release) && !isEcommerceRelease(release));
  const other = soon.filter((release) => !isEcommerceRelease(release) && !isRetailRelease(release));
  const rows = [
    { label: 'E-commerce', releases: ecommerce },
    { label: 'Retail', releases: retail },
    ...(other.length ? [{ label: 'Shared / Other', releases: other }] : [])
  ];

  return (
    <section className="soon-rail-section" aria-label="Soon to be released">
      <div className="section-heading-row">
        <div>
          <p className="section-kicker">Sequence 1</p>
          <h2>Soon to be released</h2>
        </div>
        <span>{soon.length} upcoming items</span>
      </div>
      <div className="soon-release-rows">
        {rows.map((row) => (
          <div className="soon-release-row" key={row.label}>
            <div className="soon-row-label">{row.label}</div>
            <div className="soon-row-scroll">
              {row.releases.length ? row.releases.map((release) => (
                <button key={release.id} type="button" className="soon-pill" onClick={() => onSelect(release.id)}>
                  <strong>{release.name}</strong>
                  <span>{release.product || release.productArea} · {release.targetWindow}</span>
                </button>
              )) : <div className="soon-empty">No sequence 1 items</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReleaseSummaryTable({ releases, activeTab, onTabChange, onSelect }: { releases: Release[]; activeTab: RoadmapTab; onTabChange: (tab: RoadmapTab) => void; onSelect: (releaseId: string) => void }) {
  const tabReleases = sortReleases(releases.filter((release) => release.sequencing === activeTab));

  return (
    <section className="release-summary-table roadmap-tabs" aria-label="Roadmap table">
      <div className="summary-table-heading">
        <div>
          <p>Release index</p>
          <h2>Scan the roadmap first, then open details</h2>
        </div>
        <span>{tabReleases.length} releases shown</span>
      </div>
      <div className="roadmap-tab-list" role="tablist" aria-label="Roadmap sequence tabs">
        {sequenceTabs.map((tab) => (
          <button
            key={tab.sequence}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.sequence}
            className={activeTab === tab.sequence ? 'active' : ''}
            onClick={() => onTabChange(tab.sequence)}
          >
            <span>{tab.eyebrow}</span>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="release-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Release</th>
              <th>Product</th>
              <th>Window</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {tabReleases.map((release) => (
              <tr key={release.id} onClick={() => onSelect(release.id)}>
                <td>{release.name}</td>
                <td>{release.product || release.productArea}</td>
                <td>{release.targetWindow}</td>
                <td>{release.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReleaseScroll({ releases, activeTab, expandedReleaseId, onToggleRelease }: { releases: Release[]; activeTab: RoadmapTab; expandedReleaseId: string | null; onToggleRelease: (releaseId: string) => void }) {
  const current = sortReleases(releases.filter((release) => release.sequencing === activeTab));
  const tab = sequenceTabs.find((item) => item.sequence === activeTab) ?? sequenceTabs[0];

  return (
    <section className={`release-scroll-section sequence-${activeTab}`}>
      <div className="section-heading-row">
        <div>
          <p className="section-kicker">{tab.eyebrow}</p>
          <h2>{tab.label}</h2>
        </div>
      </div>
      <div className="release-scroll-grid">
        {current.length ? current.map((release) => (
          <ReleaseCard
            key={release.id}
            release={release}
            primary={activeTab === 1}
            expanded={expandedReleaseId === release.id}
            onToggle={() => onToggleRelease(release.id)}
          />
        )) : <div className="empty-state">No published releases in this sequence.</div>}
      </div>
    </section>
  );
}

function CommerceProductSuiteOverview() {
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


      <div className="suite-overview-products">
        {suiteProducts.map((product) => (
          <article key={product.name} className={`suite-mini-product ${product.colorClass}`}>
            <p>{product.category}</p>
            <strong>{product.name}</strong>
            <span>{product.summary}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function CommerceProductSuiteDetails() {
  return (
    <section className="suite-section suite-two-column">
      <div>
        <div className="suite-section-heading">
          <p>How to sell it</p>
          <h2>Workflow-first positioning</h2>
        </div>
        <div className="suite-positioning-card">
          <strong>Competitors sell tools. Upright sells the workflow.</strong>
          <p>
            A prospect may ask about POS, listing, inventory, or AI. The larger story is that each
            capability connects to the same lifecycle: donation intake, item data capture, routing,
            selling destination, fulfillment, and performance insight.
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

function AppNav({ pageView, onPageChange }: { pageView: PageView; onPageChange: (page: PageView) => void }) {
  return (
    <nav className="app-nav" aria-label="Primary navigation">
      <button type="button" className={pageView === 'home' ? 'active' : ''} onClick={() => onPageChange('home')}><Home size={16} /> Home</button>
      <button type="button" className={pageView === 'sales' ? 'active' : ''} onClick={() => onPageChange('sales')}><ListChecks size={16} /> Sales Enablement</button>
    </nav>
  );
}

function HomePage({ releases, dataSource, syncWarning, query, setQuery, areaFilter, setAreaFilter, productAreas, activeRoadmapTab, setActiveRoadmapTab, expandedReleaseId, toggleRelease, openRelease, onOpenSales }: {
  releases: Release[];
  dataSource: 'loading' | 'notion' | 'error';
  syncWarning: string | null;
  query: string;
  setQuery: (value: string) => void;
  areaFilter: string;
  setAreaFilter: (value: string) => void;
  productAreas: string[];
  activeRoadmapTab: RoadmapTab;
  setActiveRoadmapTab: (tab: RoadmapTab) => void;
  expandedReleaseId: string | null;
  toggleRelease: (releaseId: string) => void;
  openRelease: (releaseId: string) => void;
  onOpenSales: () => void;
}) {
  return (
    <main className="home-page dashboard-home">
      <section className="home-hero hero-copy">
        <div className="eyebrow"><Sparkles size={16} /> Commerce release communications</div>
        <h1>Product release roadmap for sales and customer-facing teams.</h1>
        <p>Scan upcoming releases, understand sequencing, and open project details from one focused dashboard.</p>
        <div className="home-hero-actions">
          <button type="button" className="primary-action" onClick={onOpenSales}>
            View Product Vision <ArrowRight size={16} />
          </button>
          <NotionSyncStatus dataSource={dataSource} syncWarning={syncWarning} />
        </div>
      </section>

      <section className="filters" aria-label="Release filters">
        <div className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by customer impact, workflow, screen, or release" /></div>
        <label><Filter size={16} /> Product<select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)}>{productAreas.map((option) => <option key={option}>{option}</option>)}</select></label>
      </section>

      <SoonReleaseRail releases={releases} onSelect={openRelease} />
      <ReleaseSummaryTable releases={releases} activeTab={activeRoadmapTab} onTabChange={setActiveRoadmapTab} onSelect={openRelease} />
      <ReleaseScroll releases={releases} activeTab={activeRoadmapTab} expandedReleaseId={expandedReleaseId} onToggleRelease={toggleRelease} />
    </main>
  );
}

function SalesEnablementPage() {
  return (
    <main className="sales-page">
      <ProductVisionCard />
      <CommerceProductSuiteOverview />
      <CommerceProductSuiteDetails />
    </main>
  );
}

export function App() {
  const [query, setQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('All');
  const [releases, setReleases] = useState<Release[]>([]);
  const [dataSource, setDataSource] = useState<'loading' | 'notion' | 'error'>('loading');
  const [syncWarning, setSyncWarning] = useState<string | null>(null);
  const [pageView, setPageView] = useState<PageView>('home');
  const [activeRoadmapTab, setActiveRoadmapTab] = useState<RoadmapTab>(1);
  const [expandedReleaseId, setExpandedReleaseId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.localStorage.getItem('product-dashboard-theme') === 'light' ? 'light' : 'dark';
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
    return sortReleases(releases.filter((release) => {
      const haystack = [release.name, release.product, release.productArea, release.customerImpact, release.whyItMatters, ...release.workflowChanging, ...release.affectedScreens, ...release.whoImpacted].join(' ').toLowerCase();
      return (!query || haystack.includes(query.toLowerCase()))
        && (areaFilter === 'All' || release.product === areaFilter || release.productArea === areaFilter);
    }));
  }, [releases, query, areaFilter]);

  function toggleRelease(releaseId: string) {
    setExpandedReleaseId((current) => current === releaseId ? null : releaseId);
  }

  function openRelease(releaseId: string) {
    setExpandedReleaseId(releaseId);
    window.requestAnimationFrame(() => document.getElementById(`release-${releaseId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }

  return (
    <>
      <ThemeToggle theme={theme} onToggle={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />
      <AppNav pageView={pageView} onPageChange={setPageView} />
      {pageView === 'home' ? (
        <HomePage
          releases={filteredReleases}
          dataSource={dataSource}
          syncWarning={syncWarning}
          query={query}
          setQuery={setQuery}
          areaFilter={areaFilter}
          setAreaFilter={setAreaFilter}
          productAreas={productAreas}
          activeRoadmapTab={activeRoadmapTab}
          setActiveRoadmapTab={setActiveRoadmapTab}
          expandedReleaseId={expandedReleaseId}
          toggleRelease={toggleRelease}
          openRelease={openRelease}
          onOpenSales={() => setPageView('sales')}
        />
      ) : (
        <SalesEnablementPage />
      )}
    </>
  );
}
