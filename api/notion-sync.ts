/**
 * Server-side Notion sync helper.
 *
 * This version is more tolerant of Notion database property names:
 * - Finds the title property automatically instead of assuming it is named "Name"
 * - Supports Product Area as Select, Status, Multi-select, or text
 * - Only includes records with explicit Sequencing values of 1, 2, or 3
 */
import type { Release, Sequencing } from '../src/types';

type NotionRichText = { plain_text?: string };
type NotionSelect = { name?: string } | null;
type NotionMultiSelect = Array<{ name: string }>;
type NotionPage = { id: string; last_edited_time: string; properties: Record<string, any> };

function getEnv() {
  return {
    notionVersion: process.env.NOTION_VERSION ?? '2022-06-28',
    notionToken: process.env.NOTION_TOKEN,
    notionDataSourceId: normalizeNotionId(process.env.NOTION_DATA_SOURCE_ID),
    notionDatabaseId: normalizeNotionId(process.env.NOTION_DATABASE_ID)
  };
}

function normalizeNotionId(raw?: string): string | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!value) return undefined;

  const withoutQuery = value.split('?')[0];

  const compactMatch = withoutQuery.match(/[0-9a-fA-F]{32}/);
  if (compactMatch) return compactMatch[0];

  const dashedMatch = withoutQuery.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
  if (dashedMatch) return dashedMatch[0].replace(/-/g, '');

  return value;
}

function plainText(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map((part) => part?.plain_text ?? '').join('').trim();

  const text: NotionRichText[] = value?.rich_text ?? value?.title ?? [];
  return text.map((part) => part.plain_text ?? '').join('').trim();
}

function selectName(value: any): string {
  const select: NotionSelect = value?.select ?? value?.status ?? null;
  return select?.name ?? '';
}

function multiSelect(value: any): string[] {
  const items: NotionMultiSelect = value?.multi_select ?? [];
  return items.map((item) => item.name);
}

function propertyDisplayValue(value: any): string {
  return (
    plainText(value) ||
    selectName(value) ||
    multiSelect(value).join(', ') ||
    String(value?.number ?? '').trim()
  );
}

function getTitle(props: Record<string, any>): string {
  const preferredTitleNames = [
    'Name',
    'Project Name',
    'Doc Name',
    'Document Name',
    'Feature',
    'Feature Name',
    'Initiative',
    'Title',
    'Project',
    'Release'
  ];

  for (const propName of preferredTitleNames) {
    const text = plainText(props[propName]);
    if (text) return text;
  }

  // Most reliable fallback: find whichever Notion property is actually type=title.
  for (const property of Object.values(props)) {
    if (property?.type === 'title') {
      const text = plainText(property);
      if (text) return text;
    }
  }

  return 'Untitled release';
}

function getProductArea(props: Record<string, any>): string {
  const areaProperty =
    props['Product Area'] ??
    props.Area ??
    props['Product Areas'] ??
    props['Product area'] ??
    props.productArea;

  const selected = multiSelect(areaProperty);
  if (selected.length) {
    if (selected.includes('E-commerce')) return 'E-commerce';
    if (selected.includes('Retail')) return 'Retail';
    return selected[0];
  }

  return selectName(areaProperty) || plainText(areaProperty) || 'Uncategorized';
}

function url(value: any): string | undefined {
  if (!value) return undefined;

  // Notion URL property
  if (typeof value.url === 'string' && value.url.trim()) return value.url.trim();

  // Notion Files property, including externally hosted demo videos.
  const firstFile = Array.isArray(value.files) ? value.files[0] : undefined;
  const fileUrl = firstFile?.external?.url ?? firstFile?.file?.url;
  if (typeof fileUrl === 'string' && fileUrl.trim()) return fileUrl.trim();

  // Rich text fallback, useful if someone pastes a URL into a text property.
  const richText = value.rich_text ?? value.title ?? [];
  const richTextUrl = richText.find((part: any) => part?.href)?.href;
  if (typeof richTextUrl === 'string' && richTextUrl.trim()) return richTextUrl.trim();

  const text = plainText(value);
  return /^https?:\/\//i.test(text) ? text : undefined;
}

function number(value: any): number | undefined {
  if (typeof value?.number === 'number') return value.number;

  const selected = selectName(value);
  const selectedNumber = Number(selected);
  if (Number.isInteger(selectedNumber)) return selectedNumber;

  const textNumber = Number(plainText(value));
  if (Number.isInteger(textNumber)) return textNumber;

  return undefined;
}

function dateStart(value: any): string | undefined {
  return value?.date?.start ?? undefined;
}

function sequence(value: number | undefined): Sequencing | undefined {
  if (value === 1 || value === 2 || value === 3) return value;
  return undefined;
}

function firstDefined(...values: any[]) {
  return values.find((value) => value !== undefined && value !== null);
}

function targetWindowFromSequence(seq: Sequencing): string {
  if (seq === 1) return 'Soon to be released';
  if (seq === 2) return 'Near-term release';
  return 'Farther-term release';
}

function listFromTextOrMultiSelect(prop: any): string[] {
  const selected = multiSelect(prop);
  if (selected.length) return selected;
  return plainText(prop).split('\n').map((item) => item.trim()).filter(Boolean);
}

function getProduct(props: Record<string, any>): string {
  const productProperty = firstDefined(
    props.Product,
    props.product,
    props['Product Name'],
    props['Product Suite'],
    props['Product Line']
  );

  const selected = multiSelect(productProperty);
  if (selected.length) return selected.join(', ');

  return selectName(productProperty) || plainText(productProperty) || getProductArea(props);
}

export function notionPageToRelease(page: NotionPage): Release | null {
  const props = page.properties;
  const seq = sequence(number(firstDefined(props.Sequencing, props.sequencing, props.Sequence, props.sequence)));

  // Only explicitly-sequenced records belong on this release timeline.
  if (!seq) return null;

  return {
    id: page.id,
    name: getTitle(props),
    sequencing: seq,
    productArea: getProductArea(props),
    product: getProduct(props),
    type: (selectName(props.Type) || selectName(props['Project Type']) || 'Strategic Initiative') as Release['type'],
    priority: (selectName(props.Priority) || selectName(props['Urgency Rating']) || 'Medium') as Release['priority'],
    confidence: (selectName(props.Confidence) || 'Likely') as Release['confidence'],
    targetWindow: plainText(props['Target Window']) || selectName(props['Release Status']) || targetWindowFromSequence(seq),
    targetDate: dateStart(props['Target Ship Date']) || dateStart(props['Target Date']),
    customerImpact:
      plainText(props['Customer Impact']) ||
      plainText(props.Benefits) ||
      plainText(props.Description) ||
      'Customer impact needs to be added in Notion.',
    whyItMatters:
      plainText(props['Why It Matters']) ||
      plainText(props['Why it matters']) ||
      plainText(props['Business Impact']) ||
      'Why this matters needs to be added in Notion.',
    workflowChanging: listFromTextOrMultiSelect(props['Workflow Changing']),
    affectedScreens: listFromTextOrMultiSelect(props['Affected Screens']),
    whoImpacted: listFromTextOrMultiSelect(props['Who Is Impacted']),
    operationalBenefits: listFromTextOrMultiSelect(props['Operational Benefits']),
    talkingPoints: listFromTextOrMultiSelect(props['Talking Points']),
    demoUrl: url(firstDefined(props.Demo, props['Demo URL'])),
    releaseNotesUrl: url(props['Release Notes URL']),
    requestedByCustomers: listFromTextOrMultiSelect(props['Requested By Customers']),
    lastUpdated: page.last_edited_time
  };
}

async function queryNotion(endpoint: string, token: string, notionVersion: string) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': notionVersion
    },
    body: JSON.stringify({
      page_size: 100,
      sorts: [
        { timestamp: 'last_edited_time', direction: 'descending' }
      ]
    })
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Notion sync failed: ${response.status} ${body}`);
  }

  return JSON.parse(body);
}

export async function fetchPublishedReleasesFromNotion(): Promise<Release[]> {
  const { notionVersion, notionToken, notionDataSourceId, notionDatabaseId } = getEnv();

  if (!notionToken) {
    throw new Error('Missing NOTION_TOKEN. Add it to .env.local.');
  }

  if (!notionDataSourceId && !notionDatabaseId) {
    throw new Error('Missing NOTION_DATA_SOURCE_ID or NOTION_DATABASE_ID. Add one to .env.local.');
  }

  const endpoints: string[] = [];

  if (notionDataSourceId) {
    endpoints.push(`https://api.notion.com/v1/data_sources/${notionDataSourceId}/query`);
    endpoints.push(`https://api.notion.com/v1/databases/${notionDataSourceId}/query`);
  }

  if (notionDatabaseId && notionDatabaseId !== notionDataSourceId) {
    endpoints.push(`https://api.notion.com/v1/databases/${notionDatabaseId}/query`);
  }

  const errors: string[] = [];

  for (const endpoint of endpoints) {
    try {
      const data = await queryNotion(endpoint, notionToken, notionVersion);
      return data.results
        .map(notionPageToRelease)
        .filter((release: Release | null): release is Release => Boolean(release));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error(errors.join(' | '));
}

type ApiResponse = {
  status: (statusCode: number) => ApiResponse;
  json: (body: unknown) => void;
};

export default async function handler(_request: unknown, response: ApiResponse) {
  try {
    const releases = await fetchPublishedReleasesFromNotion();
    response.status(200).json({ source: 'notion', releases });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sync Notion releases.';
    response.status(500).json({ source: 'notion', releases: [], error: message });
  }
}
