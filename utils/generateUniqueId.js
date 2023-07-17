exports.generateOrderId = () => {
  const length = 5;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let orderId = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    orderId += characters.charAt(randomIndex);
  }
  // console.log(orderId);
  return orderId;
};

exports.generateRandomPassword = () => {
  const length = 10; // Length of the generated password
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const specialChars = "#$%^&*()";

  let password = "";

  // Generate at least one uppercase letter
  password += getRandomCharacter(uppercaseChars);

  // Generate at least one lowercase letter
  password += getRandomCharacter(lowercaseChars);

  // Generate at least one special character
  password += getRandomCharacter(specialChars);

  // Generate the remaining characters randomly
  for (let i = 0; i < length - 3; i++) {
    const allChars = uppercaseChars + lowercaseChars + specialChars;
    password += getRandomCharacter(allChars);
  }

  // Shuffle the generated password to ensure randomness
  password = shuffleString(password);
  console.log(password);
  return password;
};
