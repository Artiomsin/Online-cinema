import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { sql } from 'drizzle-orm';

@Injectable()
export class SubscriptionService {
  constructor(@Inject('DB') private readonly db: any) {}

  async createSubscription(dto: CreateSubscriptionDto) {
    const result = await this.db.execute(sql`
      INSERT INTO "Subscription"."subscriptions" (title, price, period)
      VALUES (${dto.title}, ${dto.price}, ${dto.period})
      RETURNING id, title, price, period;
    `);
    return result.rows[0];
  }

  async updateSubscription(id: number, dto: UpdateSubscriptionDto) {
    const result = await this.db.execute(sql`
      UPDATE "Subscription"."subscriptions"
      SET 
        title  = COALESCE(${dto.title}, title),
        price  = COALESCE(${dto.price}, price),
        period = COALESCE(${dto.period}, period)
      WHERE id = ${id}
      RETURNING id, title, price, period;
    `);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Subscription ${id} not found`);
    }
    return result.rows[0];
  }

  async deleteSubscription(id: number) {
    const result = await this.db.execute(sql`
      DELETE FROM "Subscription"."subscriptions"
      WHERE id = ${id}
      RETURNING id, title, price, period;
    `);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Subscription ${id} not found`);
    }
    return result.rows[0];
  }

  async findAllSubscriptions() {
    const result = await this.db.execute(sql`
      SELECT id, title, price, period
      FROM "Subscription"."subscriptions";
    `);
    return result.rows;
  }
}
