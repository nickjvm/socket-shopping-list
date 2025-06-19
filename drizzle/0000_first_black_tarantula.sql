CREATE TABLE IF NOT EXISTS `items` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'Other' NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`details` text DEFAULT (NULL),
	`completedAt` integer DEFAULT (NULL),
	`createdAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`index` integer DEFAULT 999999999 NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `lists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s','now')) NOT NULL
);