export interface ChatEntry { id: string; alias: string; own: boolean; createdAt: number; expiresAt: number }
const GROUP_WINDOW = 5 * 60_000;
/** Group only adjacent messages from the same public sender on the same local day. */
export function chatGroups<T extends ChatEntry>(messages: T[]) {
  const sameGroup = (a: T | undefined, b: T | undefined) => !!a && !!b && a.alias === b.alias && a.own === b.own
    && b.createdAt - a.createdAt >= 0 && b.createdAt - a.createdAt <= GROUP_WINDOW
    && new Date(a.createdAt).toDateString() === new Date(b.createdAt).toDateString();
  return messages.map((message, index) => ({ ...message, groupStart: !sameGroup(messages[index - 1], message), groupEnd: !sameGroup(message, messages[index + 1]) }));
}
