// Using string types instead of enums for SQLite compatibility

export class HackathonResponseDto {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  organizerId: string;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  registrationStart: Date;
  registrationEnd: Date;
  startDate: Date;
  endDate: Date;
  submissionDeadline: Date;
  prizeAmount?: number;
  prizeCurrency?: string;
  requirements: any;
  rules: string;
  guidelines: string;
  bannerImageUrl?: string;
  logoImageUrl?: string;
  minTeamSize: number;
  maxTeamSize: number;
  allowIndividual: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

