import * as admin from "firebase-admin";

admin.initializeApp();

export { generateWeeklyHoroscopes } from "./generateHoroscopes";
export { generateDailyContent } from "./generateDailyContent";
export { generateTarotInterpretations } from "./generateTarot";
