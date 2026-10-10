/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as authority from "../authority.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as incidents from "../incidents.js";
import type * as lib_authorization from "../lib/authorization.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_idempotency from "../lib/idempotency.js";
import type * as lib_publicModels from "../lib/publicModels.js";
import type * as lib_validators from "../lib/validators.js";
import type * as locations from "../locations.js";
import type * as observations from "../observations.js";
import type * as operator from "../operator.js";
import type * as profiles from "../profiles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authority: typeof authority;
  health: typeof health;
  http: typeof http;
  incidents: typeof incidents;
  "lib/authorization": typeof lib_authorization;
  "lib/errors": typeof lib_errors;
  "lib/idempotency": typeof lib_idempotency;
  "lib/publicModels": typeof lib_publicModels;
  "lib/validators": typeof lib_validators;
  locations: typeof locations;
  observations: typeof observations;
  operator: typeof operator;
  profiles: typeof profiles;
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
