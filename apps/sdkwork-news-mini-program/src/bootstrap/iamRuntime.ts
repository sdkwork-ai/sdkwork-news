export interface NewsMiniProgramIamRuntime {
  readonly authenticated: boolean;
  signOut(): Promise<void>;
}

/**
 * Anonymous-first news reading keeps identity optional. Once appbase IAM is
 * wired, this runtime becomes the single session clearing point for platform
 * storage, TokenManager, and cached account state.
 */
export function createNewsMiniProgramIamRuntime(): NewsMiniProgramIamRuntime {
  return {
    authenticated: false,
    signOut() {
      return Promise.resolve();
    },
  };
}
