const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface AdsProvider {
  showBanner(placement: string): Promise<void>;
  showInterstitial(placement: string): Promise<void>;
}

export interface PurchaseProduct {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
}

export interface PurchaseResult {
  success: boolean;
  productId: string;
  message: string;
}

export interface PurchasesProvider {
  listProducts(): Promise<PurchaseProduct[]>;
  purchase(productId: string): Promise<PurchaseResult>;
  restorePurchases(): Promise<void>;
}

export interface MonetizationServices {
  ads: AdsProvider;
  purchases: PurchasesProvider;
}

export const createMockAdsProvider = (namespace: string): AdsProvider => ({
  async showBanner(placement) {
    console.info(`[ads:${namespace}] banner`, { placement });
  },
  async showInterstitial(placement) {
    await delay(300);
    console.info(`[ads:${namespace}] interstitial`, { placement });
  },
});

export const createMockPurchasesProvider = (
  namespace: string,
  products: PurchaseProduct[],
): PurchasesProvider => ({
  async listProducts() {
    await delay(150);
    console.info(`[iap:${namespace}] list-products`, {
      count: products.length,
    });

    return products;
  },
  async purchase(productId) {
    await delay(400);

    const result: PurchaseResult = {
      success: true,
      productId,
      message: "Compra simulada com sucesso.",
    };

    console.info(`[iap:${namespace}] purchase`, result);

    return result;
  },
  async restorePurchases() {
    await delay(200);
    console.info(`[iap:${namespace}] restore-purchases`);
  },
});

export const createMockMonetization = ({
  namespace,
  products = [],
}: {
  namespace: string;
  products?: PurchaseProduct[];
}): MonetizationServices => ({
  ads: createMockAdsProvider(namespace),
  purchases: createMockPurchasesProvider(namespace, products),
});
