export interface CampaignParticipantInput {
  campaignId: string;
  numberOfDaysInUrban: number;
  numberOfDaysInRural: number;
  fullName: string;
  gender: "MALE" | "FEMALE";
  address?: string;
  phoneNumber: string;
  accountNumber?: string;
  paymentMethod: "PHONENUMBER" | "ACCOUNTNUMBER";
  companyId: string;

  detail?: string;
  files?: Express.Multer.File[]; 
}


export interface CampaignParticipantUpdateInput {
  id: string;
  fullName: string;
  gender: "MALE" | "FEMALE";
  address?: string;
  phoneNumber: string;
  accountNumber: string;
  paymentMethod: "PHONENUMBER" | "ACCOUNTNUMBER";
  companyId: string;
  numberOfDaysInUrban: number;
  numberOfDaysInRural: number;
  detail?: string;
  campaignId: string;
  files?: Express.Multer.File[];
}
