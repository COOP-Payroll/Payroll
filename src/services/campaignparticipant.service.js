"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBulkCampaignParticipants = void 0;
const client_1 = __importDefault(require("../client"));
const api_error_1 = __importDefault(require("../utils/api-error"));
const http_status_1 = __importDefault(require("http-status"));
const mime_types_1 = __importDefault(require("mime-types"));
const path_1 = __importDefault(require("path"));
const updateCampaignParticipant = (id, companyId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { numberOfDaysInUrban, numberOfDaysInRural, fullName, gender, address, phoneNumber, accountNumber, paymentMethod, detail, files, } = data;
    if (!["PHONENUMBER", "ACCOUNTNUMBER"].includes(paymentMethod)) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Payment method must be PHONENUMBER or ACCOUNTNUMBER");
    }
    return yield client_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const campaignParticipant = yield tx.campaignParticipant.findUnique({
            where: { id },
            include: { participant: true },
        });
        if (!campaignParticipant) {
            throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Campaign participant not found");
        }
        // ✅ Update Participant
        yield tx.participant.update({
            where: { id: campaignParticipant.participantId },
            data: {
                fullName,
                gender,
                address,
                // companyId, // make sure companyId is included here
                detail,
            },
        });
        // ✅ Get updated rate settings
        const rateSetting = yield tx.rateSetting.findUnique({
            where: { companyId },
        });
        if (!rateSetting) {
            throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Rate setting not found for the provided company");
        }
        const urbanRate = rateSetting.urbanRate;
        const ruralRate = rateSetting.ruralRate;
        const totalAmount = urbanRate * Number(numberOfDaysInUrban) +
            ruralRate * Number(numberOfDaysInRural);
        // ✅ Update CampaignParticipant
        yield tx.campaignParticipant.update({
            where: { id },
            data: {
                numberOfDaysInUrban: Number(numberOfDaysInUrban),
                numberOfDaysInRural: Number(numberOfDaysInRural),
                phoneNumber,
                accountNumber,
                paymentMethod,
                urbanRate,
                ruralRate,
                totalAmount,
            },
        });
        // ✅ Upload new documents
        if (files === null || files === void 0 ? void 0 : files.length) {
            yield Promise.all(files.map((file) => tx.document.create({
                data: {
                    fileName: file.originalname,
                    filePath: path_1.default.basename(file.path),
                    mimeType: file.mimetype || mime_types_1.default.lookup(file.originalname) || undefined,
                    size: file.size,
                    campaignParticipantId: id,
                },
            })));
        }
        return yield tx.campaignParticipant.findUnique({
            where: { id },
            include: {
                participant: true,
                documents: true,
                campaign: true,
            },
        });
    }));
});
const registerCampaignParticipant = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { campaignId, numberOfDaysInUrban, numberOfDaysInRural, fullName, gender, address, phoneNumber, accountNumber, paymentMethod, companyId, detail, isVerified, files, // ✅ Access files from data
     } = data;
    console.log(isVerified);
    if (!isVerified) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Please add verification ");
    }
    // const isActuallyVerified =
    //   isVerified === true ||
    //   (typeof isVerified === "string" && isVerified === "true");
    // if (!isActuallyVerified) {
    //   throw new ApiError(
    //     httpStatus.BAD_REQUEST,
    //     "Please verify selected payment method"
    //   );
    // }
    if (!["PHONENUMBER", "ACCOUNTNUMBER"].includes(paymentMethod)) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Payment method must be PHONENUMBER or ACCOUNTNUMBER");
    }
    return yield client_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const campaignExists = yield tx.campaign.findUnique({
            where: { id: campaignId },
        });
        if (!campaignExists) {
            throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Campaign not found");
        }
        // Check for existing participant with same full name under same campaign
        const existing = yield tx.participant.findFirst({
            where: {
                fullName,
                campaignParticipants: {
                    some: { campaignId },
                },
            },
        });
        if (existing) {
            throw new api_error_1.default(http_status_1.default.CONFLICT, "Participant already registered for this campaign");
        }
        // Get rate settings
        const rateSetting = yield tx.rateSetting.findUnique({
            where: { companyId },
        });
        if (!rateSetting) {
            throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Rate setting not found for the provided company");
        }
        const urbanRate = rateSetting.urbanRate;
        const ruralRate = rateSetting.ruralRate;
        const totalAmount = urbanRate * Number(numberOfDaysInUrban) +
            ruralRate * Number(numberOfDaysInRural);
        // Create participant
        const participant = yield tx.participant.create({
            data: {
                fullName,
                gender,
                address,
                // phoneNumber,
                // accountNumber,
                // paymentMethod,
                companyId,
                detail,
            },
        });
        // Create campaign participant record
        const campaignParticipant = yield tx.campaignParticipant.create({
            data: {
                campaignId,
                participantId: participant.id,
                numberOfDaysInUrban: Number(numberOfDaysInUrban),
                numberOfDaysInRural: Number(numberOfDaysInRural),
                phoneNumber,
                accountNumber,
                paymentMethod,
                urbanRate,
                ruralRate,
                totalAmount,
            },
        });
        console.log("filesddd");
        console.log(files);
        console.log(files === null || files === void 0 ? void 0 : files.length); // Upload documents
        if (files === null || files === void 0 ? void 0 : files.length) {
            yield Promise.all(files.map((file) => tx.document.create({
                data: {
                    fileName: file.originalname,
                    filePath: path_1.default.basename(file.path),
                    mimeType: file.mimetype || mime_types_1.default.lookup(file.originalname) || undefined,
                    size: file.size,
                    campaignParticipantId: campaignParticipant.id,
                    campaignId: campaignParticipant.campaignId,
                },
            })));
        }
        return yield tx.campaignParticipant.findUnique({
            where: { id: campaignParticipant.id },
            include: {
                participant: true,
                documents: true,
                campaign: true,
            },
        });
    }));
});
const getParticipantsByCampaignId = (campaignId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield client_1.default.campaignParticipant.findMany({
        where: { campaignId, isActive: true },
        include: {
            participant: true,
            documents: true,
        },
    });
});
const getAllPublishedCampaigns = (campaignId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield client_1.default.campaignParticipant.findMany({
        where: { campaignId: campaignId, isActive: true },
        include: { participant: true, documents: true },
    });
});
const getAllApprovedCampaigns = (campaignId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield client_1.default.campaignParticipant.findMany({
        where: { campaignId: campaignId, isActive: true },
        include: { participant: true, documents: true },
    });
});
const registerBulkCampaignParticipants = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { participants, companyId, campaignId } = data;
    console.log("dlfjlasdfjsdhfjhdn");
    return yield client_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const rateSetting = yield tx.rateSetting.findUnique({
            where: { companyId },
        });
        if (!rateSetting) {
            throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Rate setting not found for the provided company");
        }
        const results = [];
        for (const input of participants) {
            const { 
            // campaignId,
            numberOfDaysInUrban, numberOfDaysInRural, fullName, gender, address, phoneNumber, accountNumber, paymentMethod, detail, } = input;
            const campaignExists = yield tx.campaign.findUnique({
                where: { id: campaignId },
            });
            if (!campaignExists) {
                throw new api_error_1.default(http_status_1.default.NOT_FOUND, `Campaign not found: ${campaignId}`);
            }
            const existing = yield tx.participant.findFirst({
                where: {
                    fullName,
                    campaignParticipants: {
                        some: { campaignId },
                    },
                },
            });
            if (existing) {
                throw new api_error_1.default(http_status_1.default.CONFLICT, `Participant '${fullName}' already registered`);
            }
            const participant = yield tx.participant.create({
                data: {
                    fullName,
                    gender,
                    address,
                    companyId,
                    detail,
                },
            });
            const totalAmount = rateSetting.urbanRate * numberOfDaysInUrban +
                rateSetting.ruralRate * numberOfDaysInRural;
            const campaignParticipant = yield tx.campaignParticipant.create({
                data: {
                    campaignId,
                    participantId: participant.id,
                    numberOfDaysInUrban,
                    numberOfDaysInRural,
                    phoneNumber,
                    accountNumber,
                    paymentMethod,
                    urbanRate: rateSetting.urbanRate,
                    ruralRate: rateSetting.ruralRate,
                    totalAmount,
                },
            });
            results.push({
                participant,
                campaignParticipant,
            });
        }
        return results;
    }));
});
exports.registerBulkCampaignParticipants = registerBulkCampaignParticipants;
const updateAccountVerification = (id, companyId, isVerified) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield client_1.default.campaignParticipant.findFirst({
        where: { id },
    });
    if (!existing) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Account not found");
    }
    if (existing.isVerified) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Account already verified");
    }
    const account = yield client_1.default.campaignParticipant.update({
        where: { id },
        data: { isVerified },
        // include: { documents: true },
    });
    return account;
});
exports.default = {
    registerCampaignParticipant,
    getParticipantsByCampaignId,
    getAllPublishedCampaigns,
    getAllApprovedCampaigns,
    updateCampaignParticipant,
    registerBulkCampaignParticipants: exports.registerBulkCampaignParticipants,
    updateAccountVerification,
};
