export type Service = {
  _id: string;
  name: string;
  slug: string;
  type: string;
  url: string;
  description?: string;
  privacyScore?: number;
  trustScore?: number;
  kycLevel?: number;
  verificationStatus?: string;
  currencies?: string[];
  networks?: string[];
  attributes?: string[];
  createdAt?: string;
  updatedAt?: string;
};
