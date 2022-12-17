export enum Error {
  Generic = 1,
  RequiredParamMissing = 10,
  IncompatibleRestVersionClient = 20,
  IncompatibleRestVersionServer = 20,
  Authentication = 40,
  TokenAuthenticationNotSupported = 41,
  UserNotRecognised = 50,
  TrialExpired = 60,
  NotFound = 70,
}
