import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  Body,
} from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.createSubscription(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateSubscriptionDto) {
    return this.subscriptionService.updateSubscription(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.subscriptionService.deleteSubscription(id);
  }

  @Get()
  findAll() {
    return this.subscriptionService.findAllSubscriptions();
  }
}
