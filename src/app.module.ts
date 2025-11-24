import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users.module';
import { DatabaseModule } from './modules/database.module';
import { RolesModule } from './modules/roles.module';
import { FavoritesModule } from './modules/favorites.module';
import { MoviesModule } from './modules/movies.module';
import { GenresModule } from './modules/genres.module';
import { ActorsModule } from './modules/actors.module';
import { ViewsModule } from './modules/views.module';
import { CommentsModule } from './modules/comments.module';
import { SubscriptionModule } from './modules/subscription.module';
import { RecommendationModule } from './modules/recommendation.module';
import { AuthModule } from './modules/auth.module';

@Module({

  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    DatabaseModule,                          
    UsersModule, 
    RolesModule,     
    FavoritesModule,
    MoviesModule,
    GenresModule,
    ActorsModule,
    ViewsModule,
    CommentsModule,
    SubscriptionModule,
    RecommendationModule,
    AuthModule      
  ],
  
})
export class AppModule {}