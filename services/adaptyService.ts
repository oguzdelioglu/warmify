/// <reference types="vite/client" />
import { OnboardingAnswers } from "../types";
import { adapty } from '@adapty/capacitor';
import { Capacitor } from '@capacitor/core';

export interface AdaptyProduct {
  vendorProductId: string;
  localizedTitle: string;
  price: number;
  currencySymbol: string;
  localizedPrice: string;
  subscriptionPeriod: 'month' | 'year';
  introductoryOfferEligibility: boolean;
  introductoryOffer?: string;
}

export interface AdaptyPaywall {
  id: string; // Placement ID
  name: string;
  products: AdaptyProduct[];
}

const isDebugMode = (): boolean => {
  if (Capacitor.getPlatform() === 'web') {
    return true;
  }
  try {
    const settings = localStorage.getItem('warmify_settings');
    return settings ? JSON.parse(settings).isDebugMode : false;
  } catch {
    return false;
  }
};

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

export const AdaptyService = {

  async initialize(): Promise<void> {
    if (isInitialized) return;

    const key = import.meta.env.VITE_ADAPTY_PUBLIC_KEY;
    if (!key) {
      console.error("ADAPTY: No API Key found in env!");
      return;
    }
    console.log(`ADAPTY: Initializing with Key: ${key.substring(0, 4)}... (Length: ${key.length})`);

    if (!isDebugMode()) {
      if (!initializationPromise) {
        initializationPromise = (async () => {
          try {
            // Try to enable verbose logging for better debugging of native errors
            try {
              // @ts-ignore
              if (adapty.setLogLevel) { await adapty.setLogLevel('verbose'); }
            } catch { /* ignore */ }

            console.log("ADAPTY: Activating Native SDK...");
            await adapty.activate(key);
            isInitialized = true;
            console.log("ADAPTY: Native SDK Activation Successful.");
          } catch (e) {
            console.error("ADAPTY: Activation failed completely. Real SDK features will not work.", e);
            // We allow it to fail. specific calls will fail subsequently.
          } finally {
            initializationPromise = null;
          }
        })();
      }
      try {
        await initializationPromise;
      } catch (e) {
        // Swallow usage error
      }
    }
  },

  async saveUserAttributes(answers: OnboardingAnswers): Promise<void> {
    if (!isDebugMode()) {
      try {
        // Map answers to Adapty Profile parameters if supported
        // await adapty.updateProfile({ ... });
        console.log("ADAPTY: Real profile update not fully implemented in this wrapper yet.");
      } catch (e) {
        console.warn("ADAPTY: Failed to save attributes", e);
      }
    }

    // Always save locally/mock for now as fallback
    console.log(`ADAPTY LOG: Saving user attributes locally`, answers);
    localStorage.setItem('adapty_user_profile', JSON.stringify(answers));
  },

  async getPaywall(placementId: string): Promise<AdaptyPaywall | null> {
    if (isDebugMode()) {
      return this._getMockPaywall(placementId);
    }

    try {
      await this.initialize();
      if (!isInitialized) {
        console.error("ADAPTY: Aborting getPaywall, SDK not initialized.");
        return null;
      }

      console.log(`ADAPTY: Fetching real paywall '${placementId}'`);
      const paywall = await adapty.getPaywall({ placementId });
      const products = paywall.products;

      return {
        id: (paywall as any).placementId || placementId,
        name: paywall.name,
        products: products.map((p: any) => ({
          vendorProductId: p.vendorProductId,
          localizedTitle: p.localizedTitle,
          price: p.price,
          currencySymbol: p.currencySymbol,
          localizedPrice: p.localizedPrice,
          subscriptionPeriod: p.subscriptionPeriod?.unit === 'year' ? 'year' : 'month',
          introductoryOfferEligibility: p.introductoryOfferEligibility,
          introductoryOffer: p.introductoryDiscount?.localizedPrice
        }))
      };
    } catch (e) {
      console.error("ADAPTY: Failed to fetch real paywall", e);
      return null;
    }
  },

  async makePurchase(productId: string): Promise<boolean> {
    if (isDebugMode()) {
      return this._mockPurchase(productId);
    }

    try {
      await this.initialize();
      if (!isInitialized) throw new Error("Adapty not initialized.");

      console.log(`ADAPTY: Attempting purchase for ${productId}`);
      const placementId = import.meta.env.VITE_ADAPTY_PLACEMENT_ID || 'default_placement';

      // Step 1: Fetch Paywall
      let paywall;
      try {
        paywall = await adapty.getPaywall({ placementId });
      } catch (pwError) {
        throw new Error(`Paywall fetch failed: ${JSON.stringify(pwError)}`);
      }

      const products = paywall?.products || [];
      const product = products.find((p: any) => p.vendorProductId === productId);

      if (!product) {
        throw new Error(`Product '${productId}' not found in placement '${placementId}'`);
      }

      // Step 2: Make Purchase
      console.log("ADAPTY: invoking makePurchase(product)...");
      await adapty.makePurchase(product);
      return true;

    } catch (e: any) {
      console.error("ADAPTY: Real purchase failed", JSON.stringify(e, null, 2));

      // User Cancellation Check
      const errStr = JSON.stringify(e).toLowerCase();
      if (errStr.includes("cancel") || e?.code === 2 || e?.adaptyCode === 2) {
        console.log("ADAPTY: User cancelled purchase.");
        return false;
      }

      return false;
    }
  },

  async restorePurchases(): Promise<boolean> {
    if (isDebugMode()) {
      console.log("ADAPTY LOG (DEBUG): Restoring purchases...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }

    try {
      const profile = await adapty.restorePurchases();
      return profile.accessLevels['premium']?.isActive ?? false;
    } catch (e) {
      console.error("ADAPTY: Restore failed", e);
      return false;
    }
  },

  // --- Internal Mock Helpers ---

  async _getMockPaywall(placementId: string): Promise<AdaptyPaywall | null> {
    console.log(`ADAPTY LOG (DEBUG): Requesting placement '${placementId}'...`);
    await new Promise(resolve => setTimeout(resolve, 800));

    if (placementId === 'default_placement' || placementId === import.meta.env.VITE_ADAPTY_PLACEMENT_ID) {
      console.log("ADAPTY LOG (DEBUG): Placement found.");
      return {
        id: placementId,
        name: 'Main Paywall',
        products: [
          {
            vendorProductId: 'warmify_annually',
            localizedTitle: 'Yearly Legend',
            price: 59.99,
            currencySymbol: '$',
            localizedPrice: '$59.99',
            subscriptionPeriod: 'year',
            introductoryOfferEligibility: true,
            introductoryOffer: 'Save 33%'
          }
        ]
      };
    }
    return null;
  },

  async _mockPurchase(productId: string): Promise<boolean> {
    console.log(`ADAPTY LOG (DEBUG): Initiating purchase for ${productId}...`);
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (productId === 'warmify_annually') {
      console.log("ADAPTY LOG (DEBUG): Purchase Successful.");
      return true;
    }
    return false;
  }
};