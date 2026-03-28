-- Add status column to saved_ideas table
-- Run this in your database manager (phpMyAdmin, MySQL Workbench, etc.)

ALTER TABLE `saved_ideas` 
ADD COLUMN `status` ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending' 
AFTER `saved_at`;

-- Verify the column was added
DESCRIBE `saved_ideas`;
