import { createNewsMiniProgramRuntime, type NewsMiniProgramRuntime } from "./bootstrap/runtime.js";

export interface NewsMiniProgramApp {
  globalData: {
    runtime: NewsMiniProgramRuntime;
  };
}

App<NewsMiniProgramApp>({
  globalData: {
    runtime: createNewsMiniProgramRuntime(),
  },
});
