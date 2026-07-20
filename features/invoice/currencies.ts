export const currencyOptions = [
  ["USD", "USD - US Dollar", "en-US"], ["EUR", "EUR - Euro", "de-DE"],
  ["GBP", "GBP - British Pound", "en-GB"], ["CNY", "CNY - Chinese Yuan", "zh-CN"],
  ["NGN", "NGN - Nigerian Naira", "en-NG"], ["KES", "KES - Kenyan Shilling", "en-KE"],
  ["ZAR", "ZAR - South African Rand", "en-ZA"], ["EGP", "EGP - Egyptian Pound", "ar-EG"],
  ["MAD", "MAD - Moroccan Dirham", "fr-MA"], ["GHS", "GHS - Ghanaian Cedi", "en-GH"],
  ["TZS", "TZS - Tanzanian Shilling", "sw-TZ"], ["UGX", "UGX - Ugandan Shilling", "en-UG"],
  ["DZD", "DZD - Algerian Dinar", "ar-DZ"], ["TND", "TND - Tunisian Dinar", "fr-TN"],
  ["SDG", "SDG - Sudanese Pound", "ar-SD"], ["AOA", "AOA - Angolan Kwanza", "pt-AO"],
  ["ETB", "ETB - Ethiopian Birr", "am-ET"], ["XAF", "XAF - Central African CFA Franc", "fr-CM"],
  ["XOF", "XOF - West African CFA Franc", "fr-SN"], ["BWP", "BWP - Botswanan Pula", "en-BW"],
  ["MUR", "MUR - Mauritian Rupee", "en-MU"], ["MWK", "MWK - Malawian Kwacha", "en-MW"],
  ["LRD", "LRD - Liberian Dollar", "en-LR"], ["RWF", "RWF - Rwandan Franc", "rw-RW"]
].map(([value, label, locale]) => ({ value, label, locale })) as ReadonlyArray<{
  value: string; label: string; locale: string;
}>;

export type CurrencyCode = string;
export const DEFAULT_CURRENCY = "USD";

export function isSupportedCurrency(value: string): boolean {
  return currencyOptions.some((option) => option.value === value);
}

export function getCurrencyFormatter(currency: string) {
  const option = currencyOptions.find((entry) => entry.value === currency) ?? currencyOptions[0]!;
  return new Intl.NumberFormat(option.locale, { style: "currency", currency: option.value });
}

export function getCurrencyScale(currency: string): number {
  return 10 ** (getCurrencyFormatter(currency).resolvedOptions().maximumFractionDigits ?? 2);
}
