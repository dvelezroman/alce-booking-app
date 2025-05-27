export interface AssessmentTypeI {
  name: string;
  description: string;
}

export interface CreateAssessmentTypeI {
  name: string;
  description?: string;
}

export class UpdateAssessmentTypeI {
  name?: string;
  description?: string;
}
