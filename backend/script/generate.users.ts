import * as fs from 'fs/promises';

const NUM_USERS = 1000;
const OUTPUT_FILE = 'users.csv';
const PASSWORD_LENGTH = 12;

interface User {
  email: string;
  password: string;
}

const generateRandomString = (length: number, chars: string): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateRandomUser = (index: number): User => {
  const emailPrefixChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const passwordChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';

  const randomPart = generateRandomString(8, emailPrefixChars);
  const email = `${randomPart}${index}@example.com`;
  const password = generateRandomString(PASSWORD_LENGTH, passwordChars);

  return { email, password };
};

const main = async () => {
  console.log(`Generating ${NUM_USERS} users...`);

  const users: User[] = [];

  for (let i = 1; i <= NUM_USERS; i++) {
    users.push(generateRandomUser(i));
  }

  console.log('Formatting data into CSV format...');

  const header = 'email,password';

  const rows = users.map((user) => `${user.email},${user.password}`);

  const csvContent = [header, ...rows].join('\n');

  try {
    await fs.writeFile(OUTPUT_FILE, csvContent);
    console.log(
      `✅ Successfully generated and saved ${NUM_USERS} users to ${OUTPUT_FILE}`,
    );
  } catch (error) {
    console.error('❌ Failed to write file:', error);
  }
};

main();
