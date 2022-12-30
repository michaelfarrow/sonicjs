import { IGNORED_ARTICLES } from '@/config';

export const ignoredArticlesRegex = new RegExp(
  `^((${IGNORED_ARTICLES.join('|')})\\s+)`,
  'gi'
);

export function sortName(name: string) {
  const matched = name.match(ignoredArticlesRegex);

  return `${name.replace(ignoredArticlesRegex, '')}${
    matched ? `, ${matched[0].trim()}` : ''
  }`
    .toLowerCase()
    .replace(/[^\w\s\']|_/g, '')
    .replace(/\s+/g, ' ');
}
