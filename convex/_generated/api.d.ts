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
import type * as auth from "../auth.js";
import type * as authority from "../authority.js";
import type * as authorityAccess from "../authorityAccess.js";
import type * as crons from "../crons.js";
import type * as declarations from "../declarations.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as incidents from "../incidents.js";
import type * as lib_areas from "../lib/areas.js";
import type * as lib_authorityAllowlist from "../lib/authorityAllowlist.js";
import type * as lib_authorization from "../lib/authorization.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_idempotency from "../lib/idempotency.js";
import type * as lib_publicModels from "../lib/publicModels.js";
import type * as lib_validators from "../lib/validators.js";
import type * as locations from "../locations.js";
import type * as observations from "../observations.js";
import type * as operator from "../operator.js";
import type * as profiles from "../profiles.js";
import type * as providers_googleTranslation from "../providers/googleTranslation.js";
import type * as shelters from "../shelters.js";
import type * as translations from "../translations.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  alertExpansion: typeof alertExpansion;
  alerts: typeof alerts;
  auth: typeof auth;
  authority: typeof authority;
  authorityAccess: typeof authorityAccess;
  crons: typeof crons;
  declarations: typeof declarations;
  health: typeof health;
  http: typeof http;
  incidents: typeof incidents;
  "lib/areas": typeof lib_areas;
  "lib/authorityAllowlist": typeof lib_authorityAllowlist;
  "lib/authorization": typeof lib_authorization;
  "lib/errors": typeof lib_errors;
  "lib/idempotency": typeof lib_idempotency;
  "lib/publicModels": typeof lib_publicModels;
  "lib/validators": typeof lib_validators;
  locations: typeof locations;
  observations: typeof observations;
  operator: typeof operator;
  profiles: typeof profiles;
  "providers/googleTranslation": typeof providers_googleTranslation;
  shelters: typeof shelters;
  translations: typeof translations;
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
