/**
 * Benzersiz 6 haneli davet kodu üretir
 * @param checkExists - Kodun var olup olmadığını kontrol eden fonksiyon
 * @returns Benzersiz davet kodu
 */
export const generateUniqueInviteCode = async (
  checkExists: (code: string) => Promise<boolean>
): Promise<string> => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = 6;
  let inviteCode: string;
  let exists: boolean;

  do {
    inviteCode = '';
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      inviteCode += characters[randomIndex];
    }
    exists = await checkExists(inviteCode);
  } while (exists);

  return inviteCode;
};
