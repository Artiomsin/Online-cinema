import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { subscriptions } from '../database/models/Subscription';
import { eq } from 'drizzle-orm';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(@Inject('DB') private readonly db: any) {}

  async createSubscription(dto: CreateSubscriptionDto) {
    const [subscription] = await this.db.insert(subscriptions).values(dto).returning();
    return subscription;
  }

  async updateSubscription(id: number, dto: UpdateSubscriptionDto) {
    const [subscription] = await this.db
      .update(subscriptions)
      .set(dto)
      .where(eq(subscriptions.id, id))
      .returning();
    if (!subscription) throw new NotFoundException(`Subscription ${id} not found`);
    return subscription;
  }

  async deleteSubscription(id: number) {
    const [subscription] = await this.db
      .delete(subscriptions)
      .where(eq(subscriptions.id, id))
      .returning();
    if (!subscription) throw new NotFoundException(`Subscription ${id} not found`);
    return subscription;
  }

  async findAllSubscriptions() {
    return this.db.select().from(subscriptions);
  }
}