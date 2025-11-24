CREATE TABLE "ActionLog"."action_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"action" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Actor"."actors" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"birth_date" date NOT NULL,
	"biography" text
);
--> statement-breakpoint
CREATE TABLE "Comment"."comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment_text" text,
	"comment_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Favorites"."favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"movie_id" integer NOT NULL,
	"added_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Genre"."genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	CONSTRAINT "genres_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "Movie"."movies" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"release_year" integer NOT NULL,
	"description" text,
	"original_language" varchar(100) NOT NULL,
	"production_country" varchar(100) NOT NULL,
	"age_rating" integer NOT NULL,
	"duration" integer NOT NULL,
	"subscription_level" varchar(20) NOT NULL,
	"video_url_480" varchar(500),
	"video_url_720" varchar(500),
	"video_url_1080" varchar(500),
	"poster_url" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "Movie_Actor"."movie_actors" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"actor_id" integer NOT NULL,
	"character_name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Movie_Genre"."movie_genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"genre_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Role"."roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "Subscription"."subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(50) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"period" integer NOT NULL,
	CONSTRAINT "subscriptions_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "User"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"login" varchar(50) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"registration_date" date NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	CONSTRAINT "users_login_unique" UNIQUE("login"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "User_Role"."user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User_Subscription"."user_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"subscription_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "View"."views" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"movie_id" integer NOT NULL,
	"view_date" date NOT NULL,
	"stop_position" integer
);
--> statement-breakpoint
ALTER TABLE "ActionLog"."action_logs" ADD CONSTRAINT "action_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "User"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Comment"."comments" ADD CONSTRAINT "comments_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "Movie"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Comment"."comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "User"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Favorites"."favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "User"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Favorites"."favorites" ADD CONSTRAINT "favorites_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "Movie"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Movie_Actor"."movie_actors" ADD CONSTRAINT "movie_actors_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "Movie"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Movie_Actor"."movie_actors" ADD CONSTRAINT "movie_actors_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "Actor"."actors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Movie_Genre"."movie_genres" ADD CONSTRAINT "movie_genres_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "Movie"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Movie_Genre"."movie_genres" ADD CONSTRAINT "movie_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "Genre"."genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User_Role"."user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "User"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User_Role"."user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "Role"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User_Subscription"."user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "User"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User_Subscription"."user_subscriptions" ADD CONSTRAINT "user_subscriptions_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "Subscription"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "View"."views" ADD CONSTRAINT "views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "User"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "View"."views" ADD CONSTRAINT "views_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "Movie"."movies"("id") ON DELETE cascade ON UPDATE no action;