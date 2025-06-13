-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
CREATE TABLE IF NOT EXISTS `items` (
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
CREATE TABLE IF NOT EXISTS `lists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
	`dateCreated` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL
);
