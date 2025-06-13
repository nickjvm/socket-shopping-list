CREATE TABLE IF NOT EXISTS `items` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'Other' NOT NULL,
	`quantity` integer DEFAULT 1,
	`details` text DEFAULT 'sql`(NULL)`',
	`completedAt` numeric DEFAULT (NULL),
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `lists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP)
);
