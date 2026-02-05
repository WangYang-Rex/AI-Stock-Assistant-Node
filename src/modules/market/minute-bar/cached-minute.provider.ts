import { Injectable, Inject } from '@nestjs/common';
import type { ConstituentsMinuteProvider, MinuteBar } from './interfaces';

@Injectable()
export class CachedMinuteProvider implements ConstituentsMinuteProvider {
  private memoryCache = new Map<
    string,
    { data: Record<string, MinuteBar[]>; expiry: number }
  >();

  constructor(
    @Inject('ConstituentsMinuteProvider')
    private readonly inner: ConstituentsMinuteProvider,
  ) {}

  async getMinuteBars(
    stockCodes: string[],
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<Record<string, MinuteBar[]>> {
    const key = `minute:${date}:${startTime}:${endTime}:${stockCodes
      .sort()
      .join(',')}`;

    const cached = this.memoryCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    const data = await this.inner.getMinuteBars(
      stockCodes,
      date,
      startTime,
      endTime,
    );

    // Cache for 5 minutes (300 seconds)
    this.memoryCache.set(key, {
      data,
      expiry: Date.now() + 300 * 1000,
    });

    return data;
  }
}
