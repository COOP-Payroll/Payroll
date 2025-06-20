import prisma from "../client";

const generateUsername = async (name: string): Promise<string> => {
  const base = name
    .split(" ")
    .map((part, i) => (i === 0 ? part : part[0]))
    .join("")
    .toLowerCase();

  let username = base;
  let count = 1;

  while (await prisma.user.findUnique({ where: { username } })) {
    count++;
    username = `${base}${count}`;
  }

  return username;
};

// const generateRandomPassword = (length = 8): string => {
//   const chars =
//     "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@!&#";
//   return Array.from(
//     { length },
//     () => chars[Math.floor(Math.random() * chars.length)]
//   ).join("");
// };

type PasswordStrength = "standard" | "super" | "unique";

const CHAR_SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/|",
  unambiguous: "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789",
};

const getRandomChar = (charset: string): string =>
  charset[Math.floor(Math.random() * charset.length)];

const shuffle = (str: string): string =>
  str
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

const generatePassword = (
  length: number = 8,
  strength: PasswordStrength = "standard"
): string => {
  if (length < 4) {
    throw new Error("Password length must be at least 4 characters.");
  }

  let charset = "";
  let passwordChars: string[] = [];

  switch (strength) {
    case "standard":
      charset = CHAR_SETS.lower + CHAR_SETS.upper + CHAR_SETS.numbers + "@!&#";
      passwordChars.push(
        getRandomChar(CHAR_SETS.lower),
        getRandomChar(CHAR_SETS.upper),
        getRandomChar(CHAR_SETS.numbers),
        getRandomChar("@!&#")
      );
      break;

    case "super":
      charset =
        CHAR_SETS.lower +
        CHAR_SETS.upper +
        CHAR_SETS.numbers +
        CHAR_SETS.symbols;
      passwordChars.push(
        getRandomChar(CHAR_SETS.lower),
        getRandomChar(CHAR_SETS.upper),
        getRandomChar(CHAR_SETS.numbers),
        getRandomChar(CHAR_SETS.symbols)
      );
      break;

    case "unique":
      charset = CHAR_SETS.unambiguous + "!@#";
      passwordChars.push(
        getRandomChar("abcdefghjkmnpqrstuvwxyz"),
        getRandomChar("ABCDEFGHJKMNPQRSTUVWXYZ"),
        getRandomChar("23456789"),
        getRandomChar("!@#")
      );
      break;
  }

  while (passwordChars.length < length) {
    passwordChars.push(getRandomChar(charset));
  }

  return shuffle(passwordChars.join("")).substring(0, length);
};

export { generateUsername, generatePassword };
