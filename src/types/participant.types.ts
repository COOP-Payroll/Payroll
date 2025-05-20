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
  files?: File 
}
