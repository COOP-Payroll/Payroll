// export interface CampaignReportResponse {
//   totalParticipant: number;
//   totalPaidAmount: number;
//   totalUnpaidAmount: number;
//   Documents: Array<{
//     id: string;
//     fileName: string;
//     filePath: string;
//     mimeType: string | null;
//     size: number | null;
//     uploadedAt: Date;
//   }>;
//   startDate: Date;
//   endDate: Date;
//   campaignParticipants: Array<{
//     id: string;
//     fullName: string;
//     Gender: string;
//     paymentMethod: string;
//     phoneNumber: string | null;
//     accountNumber: string | null;
//     isVerified: boolean;
//     urbanDays: number;
//     ruralDays: number;
//     totalAmount: number;
//   }>;
// }

// export interface CampaignReportResponse {
//   totalParticipant: number;
//   totalPaidAmount: number;
//   totalUnpaidAmount: number;
//   campaignTitle: string;
//   Documents: Array<{
//     id: string;
//     fileName: string;
//     filePath: string;
//     mimeType: string | null;
//     size: number | null;
//     uploadedAt: Date;
//   }>;
//   startDate: Date;
//   endDate: Date;
//   campaignParticipants: Array<{
//     id: string;
//     fullName: string;
//     Gender: string;
//     paymentMethod: string;
//     phoneNumber: string | null;
//     accountNumber: string | null;
//     isVerified: boolean;
//     urbanDays: number;
//     ruralDays: number;
//     totalAmount: number;
//   }>;
//   pagination: {
//     currentPage: number;
//     totalPages: number;
//     totalItems: number;
//     limit: number;
//   };
// }

export interface CampaignReportData {
  totalParticipant: number;
  totalPaidAmount: number;
  totalUnpaidAmount: number;
  Documents: Array<{
    id: string;
    fileName: string;
    filePath: string;
    mimeType: string | null;
    size: number | null;
    uploadedAt: Date;
  }>;
  startDate: Date;
  endDate: Date;
  campaignParticipants: Array<{
    id: string;
    fullName: string;
    Gender: string;
    paymentMethod: string;
    phoneNumber: string | null;
    accountNumber: string | null;
    isVerified: boolean;
    urbanDays: number;
    ruralDays: number;
    totalAmount: number;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface DownloadCampaignReportResponse {
  totalParticipant: number;
  totalPaidAmount: number;
  totalUnpaidAmount: number;
  campaignName: string;
  Documents: Array<{
    id: string;
    fileName: string;
    filePath: string;
    mimeType: string | null;
    size: number | null;
    uploadedAt: Date;
  }>;
  startDate: Date;
  endDate: Date;
  campaignParticipants: Array<{
    id: string;
    fullName: string;
    Gender: string;
    paymentMethod: string;
    phoneNumber: string | null;
    accountNumber: string | null;
    isVerified: boolean;
    urbanDays: number;
    ruralDays: number;
    totalAmount: number;
  }>;
}
