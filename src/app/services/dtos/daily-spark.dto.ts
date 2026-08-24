export type SparkKind = 'quote' | 'trivia';

export type SparkAudience = 'all' | 'adult' | 'kids';

export interface DailySpark {
  id: string;
  kind: SparkKind;
  audience: SparkAudience;
  /** English quote text or trivia teaser */
  text: string;
  /** Quote attribution only */
  author?: string;
  /** Trivia punchline in English */
  reveal?: string;
  /** Short Spanish gloss for one key word/phrase */
  hintEs?: string;
}
