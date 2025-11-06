export interface Paper {
  paperId: string;
  title: string;
  abstract: string | null;
  year: number | null;
  authors: Author[];
  url: string;
  citationCount: number;
  publicationDate: string | null;
}

export interface Author {
  authorId: string;
  name: string;
}

export interface SemanticScholarResponse {
  total: number;
  offset: number;
  data: Paper[];
}

export interface JWTPayload {
  sub: string;
  email: string;
  aud: string;
  role: string;
}
