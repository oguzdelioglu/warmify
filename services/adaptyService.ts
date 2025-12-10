import { OnboardingAnswers } from "../types";

// This is a MOCK service to simulate Adapty behavior.
// In a real app, you would import 'react-native-adapty' here.

export const AdaptyService = {
  
  async saveUserAttributes(answers: OnboardingAnswers): Promise<void> {
    console.log("ADAPTY MOCK: Saving user attributes...", answers);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    localStorage.setItem('adapty_user_profile', JSON.stringify(answers));
    return;
  },

  async getPaywallProducts(): Promise<any[]> {
    console.log("ADAPTY MOCK: Fetching paywall products...");
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: 'premium_monthly',
        title: 'Monthly Agent',
        price: 9.99,
        currencySymbol: '$',
        period: 'month',
        introductoryOffer: null
      },
      {
        id: 'premium_yearly',
        title: 'Yearly Legend',
        price: 79.99,
        currencySymbol: '$',
        period: 'year',
        introductoryOffer: 'Save 33%' // Psychological framing ($9.99 * 12 = 120. vs 80)
      }
    ];
  },

  async makePurchase(productId: string): Promise<boolean> {
    console.log(`ADAPTY MOCK: Purchasing ${productId}...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Simulate success
    return true;
  },

  async restorePurchases(): Promise<boolean> {
    console.log("ADAPTY MOCK: Restoring purchases...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }
};