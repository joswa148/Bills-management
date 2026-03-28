/**
 * @typedef {Object} Subscription
 * @property {string} id - Unique identifier
 * @property {string} name - Service name (e.g., Netflix, AWS)
 * @property {string} category - Category (e.g., Entertainment, Cloud)
 * @property {'Monthly' | 'Yearly' | 'Quarterly'} period - Billing period
 * @property {number} priceINR - Price in Indian Rupees
 * @property {number} priceAED - Price in UAE Dirhams
 * @property {string} validityDate - ISO date string for next renewal
 * @property {string} paymentMethod - Last 4 digits or card name
 * @property {string} bank - Bank name
 * @property {'India' | 'UAE'} region - Billing region
 * @property {'Active' | 'Inactive'} status - Subscription status
 * @property {string} [logo] - URL to service logo
 */

/** @type {Subscription[]} */
export const mockSubscriptions = [
  {
    id: 'sub_1',
    name: 'Netflix',
    category: 'Entertainment',
    period: 'Monthly',
    priceINR: 649,
    priceAED: 29,
    validityDate: '2026-04-15',
    paymentMethod: 'Visa 4242',
    bank: 'HDFC',
    region: 'India',
    status: 'Active',
    logo: 'https://logo.clearbit.com/netflix.com'
  },
  {
    id: 'sub_2',
    name: 'Amazon Web Services',
    category: 'Infrastructure',
    period: 'Monthly',
    priceINR: 12500,
    priceAED: 550,
    validityDate: '2026-04-02',
    paymentMethod: 'Mastercard 8888',
    bank: 'ENBD',
    region: 'UAE',
    status: 'Active',
    logo: 'https://logo.clearbit.com/aws.amazon.com'
  },
  {
    id: 'sub_3',
    name: 'Adobe Creative Cloud',
    category: 'Software',
    period: 'Yearly',
    priceINR: 45000,
    priceAED: 1980,
    validityDate: '2026-11-20',
    paymentMethod: 'Amex 1001',
    bank: 'ICICI',
    region: 'India',
    status: 'Active',
    logo: 'https://logo.clearbit.com/adobe.com'
  },
  {
    id: 'sub_4',
    name: 'Spotify',
    category: 'Entertainment',
    period: 'Monthly',
    priceINR: 179,
    priceAED: 10,
    validityDate: '2026-03-30',
    paymentMethod: 'Visa 4242',
    bank: 'HDFC',
    region: 'India',
    status: 'Active',
    logo: 'https://logo.clearbit.com/spotify.com'
  },
  {
    id: 'sub_5',
    name: 'Google One',
    category: 'Cloud Storage',
    period: 'Yearly',
    priceINR: 1300,
    priceAED: 60,
    validityDate: '2027-01-05',
    paymentMethod: 'Google Pay',
    bank: 'SBI',
    region: 'India',
    status: 'Active',
    logo: 'https://logo.clearbit.com/google.com'
  }
];
