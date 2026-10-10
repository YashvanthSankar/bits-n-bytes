/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as alertExpansion from "../alertExpansion.js";
import type * as alerts from "../alerts.js";
import type * as assessments from "../assessments.js";
import type * as auth from "../auth.js";
import type * as authority from "../authority.js";
import type * as authorityAccess from "../authorityAccess.js";
import type * as authorityReports from "../authorityReports.js";
import type * as crons from "../crons.js";
import type * as declarations from "../declarations.js";
import type * as evidence from "../evidence.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as incidents from "../incidents.js";
import type * as lib_areas from "../lib/areas.js";
import type * as lib_authorityAllowlist from "../lib/authorityAllowlist.js";
import type * as lib_authorization from "../lib/authorization.js";
import type * as lib_communityPublication from "../lib/communityPublication.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_idempotency from "../lib/idempotency.js";
import type * as lib_publicModels from "../lib/publicModels.js";
import type * as lib_sachetValidators from "../lib/sachetValidators.js";
import type * as lib_targetRecipient from "../lib/targetRecipient.js";
import type * as lib_validators from "../lib/validators.js";
import type * as lib_weatherValidators from "../lib/weatherValidators.js";
import type * as locationAlerts from "../locationAlerts.js";
import type * as locations from "../locations.js";
import type * as observations from "../observations.js";
import type * as operator from "../operator.js";
import type * as profiles from "../profiles.js";
import type * as providers_accuWeather from "../providers/accuWeather.js";
import type * as providers_googleTranslation from "../providers/googleTranslation.js";
import type * as providers_jev from "../providers/jev.js";
import type * as providers_sachet from "../providers/sachet.js";
import type * as sachet from "../sachet.js";
import type * as sachetPublic from "../sachetPublic.js";
import type * as shelters from "../shelters.js";
import type * as translations from "../translations.js";
import type * as weather from "../weather.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  alertExpansion: typeof alertExpansion;
  alerts: typeof alerts;
  assessments: typeof assessments;
  auth: typeof auth;
  authority: typeof authority;
  authorityAccess: typeof authorityAccess;
  authorityReports: typeof authorityReports;
  crons: typeof crons;
  declarations: typeof declarations;
  evidence: typeof evidence;
  health: typeof health;
  http: typeof http;
  incidents: typeof incidents;
  "lib/areas": typeof lib_areas;
  "lib/authorityAllowlist": typeof lib_authorityAllowlist;
  "lib/authorization": typeof lib_authorization;
  "lib/communityPublication": typeof lib_communityPublication;
  "lib/errors": typeof lib_errors;
  "lib/idempotency": typeof lib_idempotency;
  "lib/publicModels": typeof lib_publicModels;
  "lib/sachetValidators": typeof lib_sachetValidators;
  "lib/targetRecipient": typeof lib_targetRecipient;
  "lib/validators": typeof lib_validators;
  "lib/weatherValidators": typeof lib_weatherValidators;
  locationAlerts: typeof locationAlerts;
  locations: typeof locations;
  observations: typeof observations;
  operator: typeof operator;
  profiles: typeof profiles;
  "providers/accuWeather": typeof providers_accuWeather;
  "providers/googleTranslation": typeof providers_googleTranslation;
  "providers/jev": typeof providers_jev;
  "providers/sachet": typeof providers_sachet;
  sachet: typeof sachet;
  sachetPublic: typeof sachetPublic;
  shelters: typeof shelters;
  translations: typeof translations;
  weather: typeof weather;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
