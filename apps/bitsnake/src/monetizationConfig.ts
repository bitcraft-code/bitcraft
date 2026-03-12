import type { MonetizationServices } from "@bitcraft/monetization";
import { createMockMonetization } from "@bitcraft/monetization";

export const monetizationPlacements = {
  banner_home: "banner_home",
  banner_gameover: "banner_gameover",
  interstitial_gameover: "interstitial_gameover",
  reward_extra_life: "reward_extra_life",
  reward_double_coins: "reward_double_coins",
} as const;

export function getMonetization(): MonetizationServices {
  return createMockMonetization({
    namespace: "bitsnake",
    products: [],
  });
}
