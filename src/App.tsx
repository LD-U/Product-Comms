import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, ExternalLink, Filter, Home, ListChecks, Megaphone, Moon, Search, Sparkles, Sun, ZoomIn, X } from 'lucide-react';
import type { ReactNode, PointerEvent, WheelEvent } from 'react';
import type { Release, Sequencing } from './types';

type PageView = 'home' | 'sales';
type RoadmapTab = Sequencing;
type ExplorerView = 'table' | 'gallery';

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

const buyerOutcomes = [
  { buyer: 'Executive leaders', outcome: 'Business visibility into top KPIs and strategic performance across retail and e-commerce.' },
  { buyer: 'Retail leaders', outcome: 'Progress against store goals, productivity, donation flow, sales, and inventory health.' },
  { buyer: 'E-commerce leaders', outcome: 'Listing throughput, fulfillment performance, sales productivity, and growth opportunities.' },
  { buyer: 'Store leaders', outcome: 'Tools for team productivity, supply planning, donor intake, production, and POS operations.' },
  { buyer: 'Frontline staff', outcome: 'Task-specific tools for intake, sorting, production, checkout, listing, packing, and shipping.' }
];

const sequenceTabs: Array<{ sequence: RoadmapTab; label: string }> = [
  { sequence: 1, label: 'Soon' },
  { sequence: 2, label: 'Next' },
  { sequence: 3, label: 'Later' }
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
    <article id={`release-${release.id}`} className={`release-card release-card-horizontal ${primary ? 'release-card-primary' : ''} ${expanded ? 'is-expanded' : ''}`}>
      <button
        type="button"
        className="release-card-summary"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={detailId}
      >
        <div className="release-card-main">
          <p className="release-area">{release.product || release.productArea}</p>
          <h3>{release.name}</h3>
          <p className="impact">{release.customerImpact}</p>
        </div>

        <div className="release-card-meta">
                    <span className="expand-hint">
            {expanded ? 'Hide details' : 'More details'}
            <ChevronDown size={16} />
          </span>
        </div>
      </button>

      {expanded && (
        <div id={detailId} className="release-expanded-content">
          <div className="release-detail-layout"><div className="release-detail-left"><div className="answer-grid">
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

          <div className="benefits-row" aria-label="Key benefits">
            {release.operationalBenefits.map((benefit) => <Badge key={benefit} tone="soft">{benefit}</Badge>)}
          </div>

          </div><div className="release-detail-right">{release.talkingPoints.length > 0 && (
            <section className="talking-points talking-points-open" aria-label="CS and sales talking points">
              <span className="section-label"><Megaphone size={16} /> CS/Sales talking points</span>
              <ul>
                {release.talkingPoints.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </section>
          )}</div></div>

          <footer className="release-footer">
            <span>{release.type}</span>
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
                </button>
              )) : <div className="soon-empty">No soon items</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReleaseExplorer({ releases, activeTab, onTabChange, expandedReleaseId, onToggleRelease, view, setView }: { releases: Release[]; activeTab: RoadmapTab; onTabChange: (tab: RoadmapTab) => void; expandedReleaseId: string | null; onToggleRelease: (releaseId: string) => void; view: ExplorerView; setView: (view: ExplorerView) => void }) {
  const tabReleases = sortReleases(releases.filter((release) => release.sequencing === activeTab));
  const tab = sequenceTabs.find((item) => item.sequence === activeTab) ?? sequenceTabs[0];

  function openReleaseFromTable(releaseId: string) {
    setView('gallery');
    onToggleRelease(releaseId);
    window.requestAnimationFrame(() => {
      document.getElementById(`release-${releaseId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  return (
    <section className="release-explorer release-summary-table roadmap-tabs" aria-label="Release explorer">
      <div className="summary-table-heading">
        <div>
          <p>Release explorer</p>
          <h2>{tab.label}</h2>
        </div>
        <span>{tabReleases.length} releases shown</span>
      </div>

      <div className="roadmap-tab-list" role="tablist" aria-label="Roadmap sequence tabs">
        {sequenceTabs.map((item) => (
          <button
            key={item.sequence}
            type="button"
            role="tab"
            aria-selected={activeTab === item.sequence}
            className={activeTab === item.sequence ? 'active' : ''}
            onClick={() => onTabChange(item.sequence)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="view-toggle" role="tablist" aria-label="Release display view">
        <button type="button" className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Table view</button>
        <button type="button" className={view === 'gallery' ? 'active' : ''} onClick={() => setView('gallery')}>Gallery view</button>
      </div>

      {view === 'table' ? (
        <div className="release-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Release</th>
                <th>Product</th>
                <th>Window</th>
              </tr>
            </thead>
            <tbody>
              {tabReleases.map((release) => (
                <tr key={release.id} onClick={() => openReleaseFromTable(release.id)}>
                  <td>{release.name}</td>
                  <td>{release.product || release.productArea}</td>
                  <td>{release.targetWindow}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="release-scroll-grid one-column-cards">
          {tabReleases.length ? tabReleases.map((release) => (
            <ReleaseCard
              key={release.id}
              release={release}
              primary={activeTab === 1}
              expanded={expandedReleaseId === release.id}
              onToggle={() => onToggleRelease(release.id)}
            />
          )) : <div className="empty-state">No published releases in this sequence.</div>}
        </div>
      )}
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
          Commerce connects donation intake, sorting, production, inventory, retail sales,
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
          <strong>Competitors sell tools. Commerce powers the end-to-end workflow.</strong>
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

function SalesGraphPanel() {
  const [graphOpen, setGraphOpen] = useState(false);
  const DEFAULT_GRAPH_ZOOM = 0.8;
  const [zoom, setZoom] = useState(DEFAULT_GRAPH_ZOOM);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ pointerX: 0, pointerY: 0, x: 0, y: 0 });

  function resetGraphView() {
    setZoom(DEFAULT_GRAPH_ZOOM);
    setPosition({ x: 0, y: 0 });
  }

  function openGraph() {
    resetGraphView();
    setGraphOpen(true);
  }

  function updateZoom(nextZoom: number) {
    setZoom(Math.min(3, Math.max(0.5, nextZoom)));
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    updateZoom(zoom + direction * 0.12);
  }

  function startDragging(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: position.x,
      y: position.y,
    };
  }

  function dragGraph(event: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setPosition({
      x: dragStart.current.x + event.clientX - dragStart.current.pointerX,
      y: dragStart.current.y + event.clientY - dragStart.current.pointerY,
    });
  }

  function stopDragging() {
    setDragging(false);
  }

  return (
    <>
      <section className="suite-section graph-section" aria-label="Commerce product suite graph">
        <div className="suite-section-heading graph-heading">
          <div>
            <p>Lifecycle graph</p>
            <h2>Commerce product suite map</h2>
          </div>
          <button type="button" className="graph-zoom-button" onClick={openGraph}>
            <ZoomIn size={16} /> Open graph
          </button>
        </div>
        <button type="button" className="graph-preview" onClick={openGraph} aria-label="Open commerce product suite graph">
          <img src="/sales-enablement-graph.png" alt="Commerce product suite workflow graph" />
        </button>
      </section>

      {graphOpen && (
        <div className="graph-modal" role="dialog" aria-modal="true" aria-label="Expanded commerce product suite graph">
          <button type="button" className="graph-modal-backdrop" onClick={() => setGraphOpen(false)} aria-label="Close graph" />
          <div className="graph-modal-panel">
            <div className="graph-modal-toolbar" aria-label="Graph controls">
              <button type="button" onClick={() => updateZoom(zoom - 0.2)} aria-label="Zoom out">−</button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => updateZoom(zoom + 0.2)} aria-label="Zoom in">+</button>
              <button type="button" onClick={resetGraphView}>Reset</button>
            </div>
            <button type="button" className="graph-modal-close" onClick={() => setGraphOpen(false)} aria-label="Close graph"><X size={18} /></button>
            <div
              className={`graph-modal-canvas ${dragging ? 'is-dragging' : ''}`}
              onWheel={handleWheel}
              onPointerDown={startDragging}
              onPointerMove={dragGraph}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
              onPointerLeave={stopDragging}
            >
              <img
                src="/sales-enablement-graph.png"
                alt="Expanded commerce product suite workflow graph"
                draggable={false}
                style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})` }}
              />
            </div>
          </div>
        </div>
      )}
    </>
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

function HomePage({ releases, dataSource, syncWarning, query, setQuery, areaFilter, setAreaFilter, productAreas, activeRoadmapTab, setActiveRoadmapTab, expandedReleaseId, toggleRelease, openRelease, explorerView, setExplorerView, onOpenSales }: {
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
  explorerView: ExplorerView;
  setExplorerView: (view: ExplorerView) => void;
  onOpenSales: () => void;
}) {
  return (
    <main className="home-page dashboard-home">
      <section className="home-hero hero-copy">
        <NotionSyncStatus dataSource={dataSource} syncWarning={syncWarning} />
        <div className="eyebrow"><Sparkles size={16} /> Commerce release communications</div>
        <h1>Product release roadmap for customer-facing teams.</h1>
        <p>Scan upcoming releases, understand sequencing, and open project details</p>
        <div className="home-hero-actions">
          <button type="button" className="primary-action" onClick={onOpenSales}>
            View Product Vision <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <section className="filters" aria-label="Release filters">
        <div className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by customer impact, workflow, screen, or release" /></div>
        <label><Filter size={16} /> Product<select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)}>{productAreas.map((option) => <option key={option}>{option}</option>)}</select></label>
      </section>

      <SoonReleaseRail releases={releases} onSelect={openRelease} />
      <ReleaseExplorer releases={releases} activeTab={activeRoadmapTab} onTabChange={setActiveRoadmapTab} expandedReleaseId={expandedReleaseId} onToggleRelease={toggleRelease} view={explorerView} setView={setExplorerView} />
    </main>
  );
}

function SalesEnablementPage() {
  return (
    <main className="sales-page">
      <ProductVisionCard />
      <SalesGraphPanel />
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
  const [explorerView, setExplorerView] = useState<ExplorerView>('table');
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
    setActiveRoadmapTab(1);
    setExplorerView('gallery');
    setExpandedReleaseId(releaseId);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById(`release-${releaseId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
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
          explorerView={explorerView}
          setExplorerView={setExplorerView}
          onOpenSales={() => setPageView('sales')}
        />
      ) : (
        <SalesEnablementPage />
      )}
    </>
  );
}
