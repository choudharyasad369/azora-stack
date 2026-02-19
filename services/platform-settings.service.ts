import { prisma } from '@/lib/db';

export class PlatformSettingsService {
  private static cache: Map<string, { value: any; timestamp: number }> = new Map();
  private static CACHE_TTL = 60 * 1000; // 1 minute

  static async getSetting(key: string): Promise<string | null> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }

    const setting = await prisma.platformSettings.findUnique({
      where: { key },
    });

    if (setting) {
      this.cache.set(key, { value: setting.value, timestamp: Date.now() });
      return setting.value;
    }

    return null;
  }

  static async getNumber(key: string, defaultValue: number = 0): Promise<number> {
    const value = await this.getSetting(key);
    return value ? parseFloat(value) : defaultValue;
  }

  static async getBoolean(key: string, defaultValue: boolean = false): Promise<boolean> {
    const value = await this.getSetting(key);
    return value ? value === 'true' : defaultValue;
  }

  static async getJson<T>(key: string, defaultValue: T): Promise<T> {
    const value = await this.getSetting(key);
    return value ? JSON.parse(value) : defaultValue;
  }

  static async setSetting(key: string, value: string, updatedBy: string): Promise<void> {
    await prisma.platformSettings.upsert({
      where: { key },
      update: { value, updatedBy },
      create: { key, value, updatedBy },
    });
    this.cache.delete(key);
  }

  static async getCommissionRate(): Promise<number> {
    return this.getNumber('commission_percentage', 50);
  }

  static async getListingFee(): Promise<number> {
    return this.getNumber('listing_fee', 49);
  }

  static async getMinimumWithdrawal(): Promise<number> {
    return this.getNumber('minimum_withdrawal', 300);
  }

  static async getCurrency(): Promise<string> {
    return (await this.getSetting('currency')) || 'INR';
  }

  static async getMaxFileSize(): Promise<number> {
    return this.getNumber('max_file_size_mb', 200);
  }

  static async getAllSettings(): Promise<Record<string, string>> {
    const settings = await prisma.platformSettings.findMany();
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  }

  static clearCache(): void {
    this.cache.clear();
  }
}
