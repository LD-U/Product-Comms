import type { Release, Sequencing } from '../types';

export const sequenceLabels: Record<Sequencing, { title: string; eyebrow: string; description: string }> = {
  1: {
    eyebrow: 'First priority',
    title: 'Soon to be released',
    description: 'High-confidence releases that GTM and CS should be prepared to discuss now.'
  },
  2: {
    eyebrow: 'Near-term',
    title: 'Near-term releases',
    description: 'Expected next wave of product changes. Timing may move, but sequencing is meaningful.'
  },
  3: {
    eyebrow: 'Farther-term',
    title: 'Farther-term releases',
    description: 'Planned or exploratory work that clarifies direction without overpromising dates.'
  }
};

export function groupBySequencing(releases: Release[]) {
  return ([1, 2, 3] as Sequencing[]).map((sequence) => ({
    sequence,
    ...sequenceLabels[sequence],
    releases: releases.filter((release) => release.sequencing === sequence)
  }));
}

export function priorityExplanation(priority: Release['priority']) {
  switch (priority) {
    case 'Critical': return 'Highest sequencing pressure; customer or operational impact is urgent.';
    case 'High': return 'Important for near-term customer value or GTM readiness.';
    case 'Medium': return 'Meaningful improvement, sequenced behind higher-confidence/high-impact work.';
    case 'Low': return 'Useful improvement, but not expected to drive near-term commitments.';
  }
}
