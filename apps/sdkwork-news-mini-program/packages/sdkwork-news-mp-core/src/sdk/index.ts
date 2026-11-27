/**
 * Outward integration surface.
 *
 * This core has no generated SDK client: the mini program receives its data through
 * an injected service port, so that port is the surface feature packages program
 * against. Naming it `sdk` keeps the core layout uniform across platforms.
 */
export type { NewsMiniProgramService } from "../contracts.js";
