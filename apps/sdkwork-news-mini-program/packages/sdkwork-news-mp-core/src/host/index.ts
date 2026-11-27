/**
 * Platform host contract.
 *
 * The mini-program host package implements this port; feature packages consume it
 * through injection and never touch `wx` APIs directly.
 */
export { NewsHostError } from "../contracts.js";
export type { HostErrorCode, NewsMiniProgramHost } from "../contracts.js";
