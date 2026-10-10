import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';
const crons = cronJobs();
crons.interval('resume pending alert expansion', { minutes: 1 }, internal.alertExpansion.resume, {});
crons.interval('resume instruction translation', { minutes: 1 }, internal.translations.resume, {});
crons.interval('poll SACHET official feed', { minutes: 2 }, internal.sachet.poll, {});
export default crons;
