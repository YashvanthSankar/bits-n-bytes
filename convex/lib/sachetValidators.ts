import { v } from 'convex/values';
import { geometry } from './validators';
const time = v.union(v.number(), v.null());
export const capInfo = v.object({
  language: v.string(), event: v.string(), headline: v.string(), description: v.string(), instruction: v.string(), urgency: v.string(), severity: v.string(), certainty: v.string(), responseTypes: v.array(v.string()),
  effectiveAt: time, onsetAt: time, expiresAt: time, areaDescriptions: v.array(v.string()), geometries: v.array(geometry), polygonUrls: v.array(v.string()),
});
