export const pct        = (a, b)  => b === 0 ? 50 : Math.round((a / b) * 100);
export const accuracy   = (u)     => u.total === 0 ? 0 : Math.round((u.correct / u.total) * 100);
export const getRank    = (users, uid) => [...users].sort((a, b) => b.tokens - a.tokens).findIndex(u => u.id === uid) + 1;
export const totalVotes = (event) => event.options.reduce((s, o) => s + o.votes, 0);
