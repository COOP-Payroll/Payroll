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
const client_1 = __importDefault(require("../client"));
const subjects = [
    "dashboard",
    "system_setting",
    "campaign_setup",
    "participants",
    "campaign_process",
    "campaign_approval",
    "campaign_payment",
    "unprocessed_campaign",
    "campaign_published",
    "campaign_reports",
];
const actions = ["create", "view", "update", "delete"];
function seedPermissions() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const subject of subjects) {
            for (const action of actions) {
                const action_subject = `${action}_${subject}`;
                yield client_1.default.permission.upsert({
                    where: { action_subject },
                    update: {},
                    create: {
                        action,
                        subject,
                        action_subject,
                    },
                });
            }
        }
    });
}
seedPermissions()
    .then(() => {
    console.log("Permissions seeded!");
    process.exit(0);
})
    .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
