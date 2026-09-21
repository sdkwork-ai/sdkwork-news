export interface IamRuntime {
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  refreshToken(): Promise<void>;
}

export interface User {
  id: string;
  username: string;
  email: string;
  tenantId: string;
}

export function createIamRuntime(): IamRuntime {
  let currentUser: User | null = null;
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  return {
    async login(username: string, password: string) {
      // SECURITY_SPEC.md: login success MUST NOT be mocked or synthesized from
      // user input. This runtime has no IAM transport wired yet, so it must fail
      // closed instead of manufacturing an authenticated state — a fabricated
      // `accessToken` here would make an unauthenticated browser report itself as
      // logged in.
      void username;
      void password;
      throw new Error(
        'sdkwork-news IAM runtime is not wired to an authentication transport. '
        + 'Implement the appbase IAM login exchange before enabling sign-in; '
        + 'authentication state cannot be synthesized (SECURITY_SPEC.md).',
      );
    },
    async logout() {
      currentUser = null;
      accessToken = null;
      refreshToken = null;
    },
    async getCurrentUser() {
      return currentUser;
    },
    async refreshToken() {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      // Refreshing also requires the real IAM transport; fail closed rather than
      // inventing a replacement credential.
      throw new Error(
        'sdkwork-news IAM token refresh is not wired to an authentication '
        + 'transport (SECURITY_SPEC.md).',
      );
    },
  };
}
