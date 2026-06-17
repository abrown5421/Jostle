const LOBBY_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LOBBY_CODE_LENGTH = 6;

export function generateLobbyCode(): string {
  let code = '';
  for (let i = 0; i < LOBBY_CODE_LENGTH; i++) {
    code += LOBBY_CODE_ALPHABET[Math.floor(Math.random() * LOBBY_CODE_ALPHABET.length)];
  }
  return code;
}