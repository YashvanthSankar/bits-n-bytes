import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';
const crons = cronJobs();
crons.interval('resume pending alert expansion', { minutes: 1 }, internal.alertExpansion.resume, {});
export default crons;
