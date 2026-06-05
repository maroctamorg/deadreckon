export type ContentPageKind = "home" | "topic" | "problem";

export type ContentPageTypeTag = "[[home]]" | "[[topic]]" | "[[problem]]";

export type ContentId = string;
export type TopicId = ContentId;
export type ProblemId = ContentId;

export type MarkdownContent = string;

export type OptionalContentSection = ContentSection | null;

export interface ContentImage {
  base: string;
  src: string;
  alt: string | null;
}

export interface ContentReference {
  title: string;
}

export interface ContentSection {
  title: string;
  content: MarkdownContent;
}

export interface HomeHero {
  title: string;
  summary: MarkdownContent;
}

export interface HomePage {
  kind: "home";
  id: ContentId;
  title: string;
  hero: HomeHero;
  topicReferences: ContentReference[] | null;
}

export interface Topic {
  kind: "topic";
  id: TopicId;
  title: string;
  image: ContentImage | null;
  dependencies: ContentReference[] | null;
  summary: OptionalContentSection;
  overview: OptionalContentSection;
  problemReferences: ContentReference[] | null;
  references: OptionalContentSection;
}

export interface Problem {
  kind: "problem";
  id: ProblemId;
  title: string;
  topicReferences: ContentReference[] | null;
  statement: ContentSection;
  hints: OptionalContentSection;
  sketch: OptionalContentSection;
  modelSolution: OptionalContentSection;
}

export type ContentPage = HomePage | Topic | Problem;

export interface GraphNode<TPage extends ContentPage = ContentPage> {
  id: ContentId;
  page: TPage;
}

export type GraphLinkKind =
  | "home-topic"
  | "topic-dependency"
  | "topic-problem"
  | "problem-topic";

export interface GraphLink {
  kind: GraphLinkKind;
  fromId: ContentId;
  toId: ContentId;
}

export interface ContentGraph {
  home: GraphNode<HomePage>;
  topics: GraphNode<Topic>[];
  problems: GraphNode<Problem>[];
  links: GraphLink[];
}
