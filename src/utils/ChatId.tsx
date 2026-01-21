
export default function getChatId(userId1: string, userId2: string): string {
  
  return userId1 < userId2
    ? `${userId1}_${userId2}`
    : `${userId2}_${userId1}`;
}
