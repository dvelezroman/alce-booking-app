export interface AssessmentResourceI {
  id: number;
  title: string;
  note: string;
  link: string;
}

export interface CreateAssessmentResourceI {
  title: string;
  link: string;
}

export interface UpdateAssessmentResourceI {
  title?: string;
  link?: string;
}
