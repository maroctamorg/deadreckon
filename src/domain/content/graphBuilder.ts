import type {
  ContentGraph,
  ContentId,
  ContentPage,
  ContentReference,
  GraphLink,
  GraphLinkKind,
  GraphNode,
  HomePage,
  Problem,
  Topic
} from "./models.ts";

export interface ContentGraphWarning {
  message: string;
}

export interface ContentGraphBuildResult {
  graph: ContentGraph | null;
  warnings: ContentGraphWarning[];
}

interface ContentIndex {
  homePages: HomePage[];
  topicsById: Map<ContentId, Topic>;
  problemsById: Map<ContentId, Problem>;
  warnings: ContentGraphWarning[];
}

export function BuildContentGraph(pages: ContentPage[]): ContentGraphBuildResult {
  const index = IndexContentPages(pages);

  if (index.homePages.length !== 1) {
    return {
      graph: null,
      warnings: [
        ...index.warnings,
        {
          message: `Expected exactly one home page, found ${index.homePages.length}.`
        }
      ]
    };
  }

  const links = [
    ...BuildHomeTopicLinks(index.homePages[0], index),
    ...BuildTopicDependencyLinks(index.topicsById.values(), index),
    ...BuildTopicProblemLinks(index.topicsById.values(), index),
    ...BuildProblemTopicLinks(index.problemsById.values(), index)
  ];

  return {
    graph: {
      home: CreateGraphNode(index.homePages[0]),
      topics: [...index.topicsById.values()].map(CreateGraphNode),
      problems: [...index.problemsById.values()].map(CreateGraphNode),
      links
    },
    warnings: index.warnings
  };
}

function IndexContentPages(pages: ContentPage[]): ContentIndex {
  const homePages: HomePage[] = [];
  const topicsById = new Map<ContentId, Topic>();
  const problemsById = new Map<ContentId, Problem>();
  const warnings: ContentGraphWarning[] = [];

  for (const page of pages) {
    if (page.kind === "home") {
      homePages.push(page);
      continue;
    }

    if (page.kind === "topic") {
      AddUniquePage(topicsById, page, "topic", warnings);
      continue;
    }

    AddUniquePage(problemsById, page, "problem", warnings);
  }

  return { homePages, topicsById, problemsById, warnings };
}

function AddUniquePage<TPage extends Topic | Problem>(
  pagesById: Map<ContentId, TPage>,
  page: TPage,
  pageKind: string,
  warnings: ContentGraphWarning[]
): void {
  if (pagesById.has(page.id)) {
    warnings.push({
      message: `Duplicate ${pageKind} page id "${page.id}" found for "${page.title}".`
    });
    return;
  }

  pagesById.set(page.id, page);
}

function BuildHomeTopicLinks(homePage: HomePage, index: ContentIndex): GraphLink[] {
  return BuildLinks({
    fromId: homePage.id,
    references: homePage.topicReferences,
    targetsById: index.topicsById,
    kind: "home-topic",
    sourceTitle: homePage.title,
    targetKind: "topic",
    warnings: index.warnings
  });
}

function BuildTopicDependencyLinks(
  topics: Iterable<Topic>,
  index: ContentIndex
): GraphLink[] {
  return [...topics].flatMap((topic) =>
    BuildLinks({
      fromId: topic.id,
      references: topic.dependencies,
      targetsById: index.topicsById,
      kind: "topic-dependency",
      sourceTitle: topic.title,
      targetKind: "topic",
      warnings: index.warnings
    })
  );
}

function BuildTopicProblemLinks(
  topics: Iterable<Topic>,
  index: ContentIndex
): GraphLink[] {
  return [...topics].flatMap((topic) =>
    BuildLinks({
      fromId: topic.id,
      references: topic.problemReferences,
      targetsById: index.problemsById,
      kind: "topic-problem",
      sourceTitle: topic.title,
      targetKind: "problem",
      warnings: index.warnings
    })
  );
}

function BuildProblemTopicLinks(
  problems: Iterable<Problem>,
  index: ContentIndex
): GraphLink[] {
  return [...problems].flatMap((problem) =>
    BuildLinks({
      fromId: problem.id,
      references: problem.topicReferences,
      targetsById: index.topicsById,
      kind: "problem-topic",
      sourceTitle: problem.title,
      targetKind: "topic",
      warnings: index.warnings
    })
  );
}

interface LinkBuildInput<TPage extends ContentPage> {
  fromId: ContentId;
  references: ContentReference[] | null;
  targetsById: Map<ContentId, TPage>;
  kind: GraphLinkKind;
  sourceTitle: string;
  targetKind: string;
  warnings: ContentGraphWarning[];
}

function BuildLinks<TPage extends ContentPage>({
  fromId,
  references,
  targetsById,
  kind,
  sourceTitle,
  targetKind,
  warnings
}: LinkBuildInput<TPage>): GraphLink[] {
  if (references === null) {
    return [];
  }

  const links: GraphLink[] = [];

  for (const reference of references) {
    const toId = NormalizeContentId(reference.title);

    if (!targetsById.has(toId)) {
      warnings.push({
        message: `${sourceTitle} references missing ${targetKind} "${reference.title}".`
      });
      continue;
    }

    links.push({ kind, fromId, toId });
  }

  return links;
}

function CreateGraphNode<TPage extends ContentPage>(page: TPage): GraphNode<TPage> {
  return { id: page.id, page };
}

function NormalizeContentId(title: string): ContentId {
  return title.trim().toLowerCase();
}
