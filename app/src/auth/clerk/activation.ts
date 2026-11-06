// Code-review evidence, not an environment-variable authorization mechanism.
// No caller in the active app supplies this checklist yet.
export interface ClerkActivationReview {
  developmentProjectVerified: boolean;
  uuidMappingVerified: boolean;
  serverAuthorizationVerified: boolean;
  replacementFlowsVerified: boolean;
}
export function canActivateDevelopmentClerk(developmentBuild: boolean, review?: ClerkActivationReview) {
  return developmentBuild && review?.developmentProjectVerified === true && review.uuidMappingVerified === true
    && review.serverAuthorizationVerified === true && review.replacementFlowsVerified === true;
}
