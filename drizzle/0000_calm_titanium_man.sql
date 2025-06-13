-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`dateAdded` integer NOT NULL,
	`dateCompleted` integer DEFAULT (null),
	`category` text DEFAULT 'Other' NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`details` text,
	`list_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);

*/