-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 03, 2026 at 03:23 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fyp_generator`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_calculate_cgpa` (IN `p_student_id` INT)   BEGIN
    DECLARE v_cgpa DECIMAL(3,2);
    
    SELECT 
        ROUND(
            SUM(
                CASE grade
                    WHEN 'A' THEN 4.0
                    WHEN 'A-' THEN 3.7
                    WHEN 'B+' THEN 3.3
                    WHEN 'B' THEN 3.0
                    WHEN 'B-' THEN 2.7
                    WHEN 'C+' THEN 2.3
                    WHEN 'C' THEN 2.0
                    WHEN 'C-' THEN 1.7
                    WHEN 'D' THEN 1.0
                    ELSE 0.0
                END * credits
            ) / NULLIF(SUM(credits), 0)
        , 2)
    INTO v_cgpa
    FROM semester_records
    WHERE student_id = p_student_id;
    
    UPDATE students
    SET cgpa = COALESCE(v_cgpa, 0.00)
    WHERE id = p_student_id;
    
    SELECT v_cgpa as calculated_cgpa;
END$$

--
-- Functions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_get_student_rank` (`p_student_id` INT) RETURNS INT(11) DETERMINISTIC BEGIN
    DECLARE v_rank INT;
    
    SELECT COUNT(*) + 1 INTO v_rank
    FROM students
    WHERE cgpa > (SELECT cgpa FROM students WHERE id = p_student_id);
    
    RETURN v_rank;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `details`, `ip_address`, `created_at`) VALUES
(6, 5, 'SAVE_IDEA', 'Saved idea ID: 6', NULL, '2026-02-16 00:18:58'),
(7, 5, 'SAVE_IDEA', 'Saved idea ID: 37', NULL, '2026-02-16 01:10:59'),
(8, 9, 'SAVE_IDEA', 'Saved idea ID: 41', NULL, '2026-02-16 01:26:49'),
(9, 9, 'SAVE_IDEA', 'Saved idea ID: 42', NULL, '2026-02-16 01:26:54');

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `faculty_reg` varchar(50) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`id`, `user_id`, `faculty_reg`, `department`, `designation`, `created_at`, `updated_at`) VALUES
(2, 6, 'FAC-2230', 'Software Engineering', 'Lecturer', '2026-02-16 00:25:36', '2026-02-16 00:27:51');

-- --------------------------------------------------------

--
-- Table structure for table `ideas`
--

CREATE TABLE `ideas` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `technologies` text DEFAULT NULL,
  `difficulty` enum('Beginner','Intermediate','Advanced') DEFAULT 'Intermediate',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ideas`
--

INSERT INTO `ideas` (`id`, `title`, `description`, `category`, `technologies`, `difficulty`, `created_at`) VALUES
(1, 'AI-Powered Medical Diagnosis System', 'Develop a machine learning system that can analyze medical images and patient data to assist doctors in making accurate diagnoses. The system will use deep learning algorithms to identify patterns and anomalies.', 'Artificial Intelligence', 'Python, TensorFlow, OpenCV, Flask', 'Advanced', '2026-02-15 23:49:14'),
(2, 'Smart Campus Management System', 'Create a comprehensive web application for managing university operations including student registration, course management, attendance tracking, and real-time notifications for students and faculty.', 'Web Development', 'React, Node.js, MongoDB, Socket.io', 'Intermediate', '2026-02-15 23:49:14'),
(3, 'Blockchain-based Certificate Verification', 'Design a decentralized system for issuing and verifying academic certificates using blockchain technology to prevent fraud and ensure authenticity of credentials.', 'Blockchain', 'Ethereum, Solidity, Web3.js, React', 'Advanced', '2026-02-15 23:49:14'),
(4, 'Mobile E-Commerce Platform', 'Build a full-featured mobile application for online shopping with features like product catalog, shopping cart, payment integration, order tracking, and customer reviews.', 'Mobile Development', 'React Native, Firebase, Stripe API', 'Intermediate', '2026-02-15 23:49:14'),
(5, 'IoT-based Smart Agriculture System', 'Develop an IoT solution for monitoring and automating agricultural processes including soil moisture detection, automated irrigation, weather monitoring, and crop health analysis.', 'Internet of Things', 'Arduino, Raspberry Pi, Python, MQTT', 'Intermediate', '2026-02-15 23:49:14'),
(6, 'AI-Powered Code Review System', 'Develop an intelligent system that automatically reviews code for bugs, security vulnerabilities, and best practices using machine learning algorithms.', 'Software Engineering', 'Python, TensorFlow, Git API', 'Advanced', '2026-02-16 00:18:46'),
(7, 'Real-time Collaborative Development Platform', 'Create a web-based platform that allows multiple developers to code together in real-time with integrated version control and communication features.', 'Web Development', 'Node.js, WebSockets, React, MongoDB', 'Intermediate', '2026-02-16 00:18:46'),
(8, 'Smart Project Management System', 'Build an intelligent project management tool that uses AI to predict project timelines, allocate resources, and identify potential risks.', 'Software Engineering', 'Django, React, PostgreSQL, ML algorithms', 'Advanced', '2026-02-16 00:18:46'),
(9, 'Automated Testing Framework', 'Design a comprehensive testing framework that automatically generates test cases, executes them, and provides detailed reports on code coverage and bugs.', 'Software Testing', 'Java, Selenium, JUnit, Jenkins', 'Intermediate', '2026-02-16 00:18:46'),
(10, 'Mobile App for Local Services Marketplace', 'Develop a mobile application that connects local service providers with customers, featuring booking, payment, and rating systems.', 'Mobile Development', 'React Native, Firebase, Stripe API', 'Intermediate', '2026-02-16 00:18:46'),
(11, 'AI-Powered Code Review System', 'Develop an intelligent system that automatically reviews code for bugs, security vulnerabilities, and best practices using machine learning algorithms.', 'Software Engineering', 'Python, TensorFlow, Git API', 'Advanced', '2026-02-16 00:21:57'),
(12, 'Real-time Collaborative Development Platform', 'Create a web-based platform that allows multiple developers to code together in real-time with integrated version control and communication features.', 'Web Development', 'Node.js, WebSockets, React, MongoDB', 'Intermediate', '2026-02-16 00:21:57'),
(13, 'Smart Project Management System', 'Build an intelligent project management tool that uses AI to predict project timelines, allocate resources, and identify potential risks.', 'Software Engineering', 'Django, React, PostgreSQL, ML algorithms', 'Advanced', '2026-02-16 00:21:57'),
(14, 'Automated Testing Framework', 'Design a comprehensive testing framework that automatically generates test cases, executes them, and provides detailed reports on code coverage and bugs.', 'Software Testing', 'Java, Selenium, JUnit, Jenkins', 'Intermediate', '2026-02-16 00:21:57'),
(15, 'Mobile App for Local Services Marketplace', 'Develop a mobile application that connects local service providers with customers, featuring booking, payment, and rating systems.', 'Mobile Development', 'React Native, Firebase, Stripe API', 'Intermediate', '2026-02-16 00:21:57'),
(16, 'AI-Powered Code Review System', 'Develop an intelligent system that automatically reviews code for bugs, security vulnerabilities, and best practices using machine learning algorithms.', 'Software Engineering', 'Python, TensorFlow, Git API', 'Advanced', '2026-02-16 00:22:30'),
(17, 'Real-time Collaborative Development Platform', 'Create a web-based platform that allows multiple developers to code together in real-time with integrated version control and communication features.', 'Web Development', 'Node.js, WebSockets, React, MongoDB', 'Intermediate', '2026-02-16 00:22:30'),
(18, 'Smart Project Management System', 'Build an intelligent project management tool that uses AI to predict project timelines, allocate resources, and identify potential risks.', 'Software Engineering', 'Django, React, PostgreSQL, ML algorithms', 'Advanced', '2026-02-16 00:22:30'),
(19, 'Automated Testing Framework', 'Design a comprehensive testing framework that automatically generates test cases, executes them, and provides detailed reports on code coverage and bugs.', 'Software Testing', 'Java, Selenium, JUnit, Jenkins', 'Intermediate', '2026-02-16 00:22:30'),
(20, 'Mobile App for Local Services Marketplace', 'Develop a mobile application that connects local service providers with customers, featuring booking, payment, and rating systems.', 'Mobile Development', 'React Native, Firebase, Stripe API', 'Intermediate', '2026-02-16 00:22:30'),
(21, 'AI-Powered Code Review System', 'Develop an intelligent system that automatically reviews code for bugs, security vulnerabilities, and best practices using machine learning algorithms.', 'Software Engineering', 'Python, TensorFlow, Git API', 'Advanced', '2026-02-16 00:22:32'),
(22, 'Real-time Collaborative Development Platform', 'Create a web-based platform that allows multiple developers to code together in real-time with integrated version control and communication features.', 'Web Development', 'Node.js, WebSockets, React, MongoDB', 'Intermediate', '2026-02-16 00:22:33'),
(23, 'Smart Project Management System', 'Build an intelligent project management tool that uses AI to predict project timelines, allocate resources, and identify potential risks.', 'Software Engineering', 'Django, React, PostgreSQL, ML algorithms', 'Advanced', '2026-02-16 00:22:33'),
(24, 'Automated Testing Framework', 'Design a comprehensive testing framework that automatically generates test cases, executes them, and provides detailed reports on code coverage and bugs.', 'Software Testing', 'Java, Selenium, JUnit, Jenkins', 'Intermediate', '2026-02-16 00:22:33'),
(25, 'Mobile App for Local Services Marketplace', 'Develop a mobile application that connects local service providers with customers, featuring booking, payment, and rating systems.', 'Mobile Development', 'React Native, Firebase, Stripe API', 'Intermediate', '2026-02-16 00:22:33'),
(26, 'Deep Learning Image Recognition System', 'Create an advanced image recognition system using deep learning that can identify and classify objects in real-time video streams.', 'Artificial Intelligence', 'Python, TensorFlow, OpenCV, CUDA', 'Advanced', '2026-02-16 00:49:02'),
(27, 'Blockchain-based Voting System', 'Design a secure and transparent voting system using blockchain technology to ensure vote integrity and prevent fraud.', 'Blockchain', 'Ethereum, Solidity, Web3.js, React', 'Advanced', '2026-02-16 00:49:02'),
(28, 'Natural Language Processing Chatbot', 'Build an intelligent chatbot that uses NLP to understand context, maintain conversations, and provide accurate responses across multiple domains.', 'Natural Language Processing', 'Python, NLTK, spaCy, TensorFlow', 'Intermediate', '2026-02-16 00:49:02'),
(29, 'Distributed File Storage System', 'Implement a distributed file storage system similar to HDFS that provides fault tolerance, scalability, and efficient data retrieval.', 'Distributed Systems', 'Java, Apache Hadoop, Docker', 'Advanced', '2026-02-16 00:49:02'),
(30, 'Smart Home Automation System', 'Develop an IoT-based home automation system that controls lights, temperature, security, and appliances through a mobile app and voice commands.', 'Internet of Things', 'Raspberry Pi, Arduino, Python, MQTT', 'Intermediate', '2026-02-16 00:49:02'),
(31, 'Deep Learning Image Recognition System', 'Create an advanced image recognition system using deep learning that can identify and classify objects in real-time video streams.', 'Artificial Intelligence', 'Python, TensorFlow, OpenCV, CUDA', 'Advanced', '2026-02-16 00:49:37'),
(32, 'Blockchain-based Voting System', 'Design a secure and transparent voting system using blockchain technology to ensure vote integrity and prevent fraud.', 'Blockchain', 'Ethereum, Solidity, Web3.js, React', 'Advanced', '2026-02-16 00:49:37'),
(33, 'Natural Language Processing Chatbot', 'Build an intelligent chatbot that uses NLP to understand context, maintain conversations, and provide accurate responses across multiple domains.', 'Natural Language Processing', 'Python, NLTK, spaCy, TensorFlow', 'Intermediate', '2026-02-16 00:49:37'),
(34, 'Distributed File Storage System', 'Implement a distributed file storage system similar to HDFS that provides fault tolerance, scalability, and efficient data retrieval.', 'Distributed Systems', 'Java, Apache Hadoop, Docker', 'Advanced', '2026-02-16 00:49:37'),
(35, 'Smart Home Automation System', 'Develop an IoT-based home automation system that controls lights, temperature, security, and appliances through a mobile app and voice commands.', 'Internet of Things', 'Raspberry Pi, Arduino, Python, MQTT', 'Intermediate', '2026-02-16 00:49:37'),
(36, 'AI-Powered Code Review System', 'Develop an intelligent system that automatically reviews code for bugs, security vulnerabilities, and best practices using machine learning algorithms.', 'Software Engineering', 'Python, TensorFlow, Git API', 'Advanced', '2026-02-16 01:10:54'),
(37, 'Real-time Collaborative Development Platform', 'Create a web-based platform that allows multiple developers to code together in real-time with integrated version control and communication features.', 'Web Development', 'Node.js, WebSockets, React, MongoDB', 'Intermediate', '2026-02-16 01:10:54'),
(38, 'Smart Project Management System', 'Build an intelligent project management tool that uses AI to predict project timelines, allocate resources, and identify potential risks.', 'Software Engineering', 'Django, React, PostgreSQL, ML algorithms', 'Advanced', '2026-02-16 01:10:54'),
(39, 'Automated Testing Framework', 'Design a comprehensive testing framework that automatically generates test cases, executes them, and provides detailed reports on code coverage and bugs.', 'Software Testing', 'Java, Selenium, JUnit, Jenkins', 'Intermediate', '2026-02-16 01:10:54'),
(40, 'Mobile App for Local Services Marketplace', 'Develop a mobile application that connects local service providers with customers, featuring booking, payment, and rating systems.', 'Mobile Development', 'React Native, Firebase, Stripe API', 'Intermediate', '2026-02-16 01:10:54'),
(41, 'Deep Learning Image Recognition System', 'Create an advanced image recognition system using deep learning that can identify and classify objects in real-time video streams.', 'Artificial Intelligence', 'Python, TensorFlow, OpenCV, CUDA', 'Advanced', '2026-02-16 01:26:46'),
(42, 'Blockchain-based Voting System', 'Design a secure and transparent voting system using blockchain technology to ensure vote integrity and prevent fraud.', 'Blockchain', 'Ethereum, Solidity, Web3.js, React', 'Advanced', '2026-02-16 01:26:46'),
(43, 'Natural Language Processing Chatbot', 'Build an intelligent chatbot that uses NLP to understand context, maintain conversations, and provide accurate responses across multiple domains.', 'Natural Language Processing', 'Python, NLTK, spaCy, TensorFlow', 'Intermediate', '2026-02-16 01:26:46'),
(44, 'Distributed File Storage System', 'Implement a distributed file storage system similar to HDFS that provides fault tolerance, scalability, and efficient data retrieval.', 'Distributed Systems', 'Java, Apache Hadoop, Docker', 'Advanced', '2026-02-16 01:26:46'),
(45, 'Smart Home Automation System', 'Develop an IoT-based home automation system that controls lights, temperature, security, and appliances through a mobile app and voice commands.', 'Internet of Things', 'Raspberry Pi, Arduino, Python, MQTT', 'Intermediate', '2026-02-16 01:26:46');

-- --------------------------------------------------------

--
-- Table structure for table `saved_ideas`
--

CREATE TABLE `saved_ideas` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `idea_id` int(11) NOT NULL,
  `saved_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `saved_ideas`
--

INSERT INTO `saved_ideas` (`id`, `student_id`, `idea_id`, `saved_at`) VALUES
(5, 4, 6, '2026-02-16 00:18:58'),
(6, 4, 37, '2026-02-16 01:10:59'),
(7, 6, 41, '2026-02-16 01:26:49'),
(8, 6, 42, '2026-02-16 01:26:54');

--
-- Triggers `saved_ideas`
--
DELIMITER $$
CREATE TRIGGER `tr_log_idea_save` AFTER INSERT ON `saved_ideas` FOR EACH ROW BEGIN
    INSERT INTO activity_logs (user_id, action, details)
    SELECT user_id, 'SAVE_IDEA', CONCAT('Saved idea ID: ', NEW.idea_id)
    FROM students
    WHERE id = NEW.student_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `semester_records`
--

CREATE TABLE `semester_records` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `semester_number` int(11) NOT NULL,
  `course_code` varchar(20) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `credits` int(11) NOT NULL,
  `grade` varchar(5) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `semester_records`
--

INSERT INTO `semester_records` (`id`, `student_id`, `semester_number`, `course_code`, `course_name`, `credits`, `grade`, `created_at`) VALUES
(7, 4, 7, 'SE2234', 'Software Re engineering', 3, 'B+', '2026-02-16 00:17:31'),
(8, 4, 7, 'SE2256', 'Penetration Testing', 3, 'B+', '2026-02-16 00:18:07'),
(11, 4, 7, 'SE4348', 'Softawre Project Managment', 3, 'A-', '2026-02-16 01:11:47'),
(12, 6, 6, 'SE3243', 'Software Engineering', 3, 'B+', '2026-02-16 01:23:49'),
(13, 6, 6, 'CS3442', 'Software Construction and Development', 3, 'A-', '2026-02-16 01:24:39'),
(14, 6, 6, 'CS1023', 'Software Requirement Engineering', 3, 'B+', '2026-02-16 01:25:48');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `reg_number` varchar(50) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `current_semester` int(11) DEFAULT NULL,
  `cgpa` decimal(3,2) DEFAULT 0.00,
  `major` varchar(100) DEFAULT NULL,
  `area_of_interest` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `user_id`, `reg_number`, `department`, `current_semester`, `cgpa`, `major`, `area_of_interest`, `created_at`, `updated_at`) VALUES
(4, 5, 'BSE223099', 'Software Engineering', 8, 3.50, NULL, 'Natural Language Processing', '2026-02-16 00:14:16', '2026-02-16 01:11:47'),
(6, 9, 'BSE223114', 'Computer Science', 7, 3.43, NULL, 'Machine Learning', '2026-02-16 00:47:15', '2026-02-16 01:25:48'),
(7, 10, 'STU-10', '', 1, 0.00, NULL, NULL, '2026-03-03 02:02:39', '2026-03-03 02:02:39'),
(8, 11, 'STU-11', '', 1, 0.00, NULL, NULL, '2026-03-03 02:06:11', '2026-03-03 02:06:11'),
(9, 12, 'STU-12', '', 1, 0.00, NULL, NULL, '2026-03-03 02:07:19', '2026-03-03 02:07:19');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','faculty') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(5, 'Sameer Sherbaz', 'bse223079@cust.edu.pk', '$2a$10$tGmUx2tMMNKeF0wBeDi3pey9HjuX4GaHr.ZV8srpsSo.v.eJYqnni', 'student', '2026-02-16 00:14:16', '2026-02-16 01:00:57'),
(6, 'Ibrar Arshad', 'IbrarArshad@cust.edu.pk', '$2a$10$fZX7dGY9zHA6Rhgw0XZZDeMqKL0N2zPUgMHODfFfDi.cC6SrazgG.', 'faculty', '2026-02-16 00:25:36', '2026-02-16 00:25:36'),
(9, 'Muhammad Umar', 'bse223114@cust.edu.pk', '$2a$10$T6zx42RCbdrSg9fZFDSMc.4I04lURekiN4oF4SVq1rqC4reJmUB4.', 'student', '2026-02-16 00:47:15', '2026-02-16 00:47:15'),
(10, 'Immad', 'immadkhan303@gmail.com', '$2a$10$6bjEnQ0c3pm1OcczQjfHXeDdcQxkt.3VFp4U8H3IYmyD/RgDhdNq2', 'student', '2026-03-03 02:02:39', '2026-03-03 02:02:39'),
(11, 'ali', 'ali@gmail.com', '$2a$10$OFzpQG4yiB2/GjPkfqjkz.aNSsxMm56bc.I397Tik1kNAW27x2PaS', 'student', '2026-03-03 02:06:11', '2026-03-03 02:06:11'),
(12, 'alii', 'alii@gmail.com', '$2a$10$IlqgLXe4YXaQR4Ds3IsMCuqVntD9gmyDbZhFcbDcdrfd0T0imqOGu', 'student', '2026-03-03 02:07:19', '2026-03-03 02:07:19');

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_saved_ideas_details`
-- (See below for the actual view)
--
CREATE TABLE `vw_saved_ideas_details` (
`saved_id` int(11)
,`reg_number` varchar(50)
,`student_name` varchar(255)
,`title` varchar(255)
,`description` text
,`category` varchar(100)
,`technologies` text
,`difficulty` enum('Beginner','Intermediate','Advanced')
,`saved_at` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_student_profiles`
-- (See below for the actual view)
--
CREATE TABLE `vw_student_profiles` (
`id` int(11)
,`user_id` int(11)
,`full_name` varchar(255)
,`email` varchar(255)
,`reg_number` varchar(50)
,`department` varchar(100)
,`current_semester` int(11)
,`cgpa` decimal(3,2)
,`major` varchar(100)
,`area_of_interest` text
,`created_at` timestamp
);

-- --------------------------------------------------------

--
-- Structure for view `vw_saved_ideas_details`
--
DROP TABLE IF EXISTS `vw_saved_ideas_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_saved_ideas_details`  AS SELECT `si`.`id` AS `saved_id`, `s`.`reg_number` AS `reg_number`, `u`.`full_name` AS `student_name`, `i`.`title` AS `title`, `i`.`description` AS `description`, `i`.`category` AS `category`, `i`.`technologies` AS `technologies`, `i`.`difficulty` AS `difficulty`, `si`.`saved_at` AS `saved_at` FROM (((`saved_ideas` `si` join `students` `s` on(`si`.`student_id` = `s`.`id`)) join `users` `u` on(`s`.`user_id` = `u`.`id`)) join `ideas` `i` on(`si`.`idea_id` = `i`.`id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `vw_student_profiles`
--
DROP TABLE IF EXISTS `vw_student_profiles`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_student_profiles`  AS SELECT `s`.`id` AS `id`, `s`.`user_id` AS `user_id`, `u`.`full_name` AS `full_name`, `u`.`email` AS `email`, `s`.`reg_number` AS `reg_number`, `s`.`department` AS `department`, `s`.`current_semester` AS `current_semester`, `s`.`cgpa` AS `cgpa`, `s`.`major` AS `major`, `s`.`area_of_interest` AS `area_of_interest`, `s`.`created_at` AS `created_at` FROM (`students` `s` join `users` `u` on(`s`.`user_id` = `u`.`id`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `faculty_reg` (`faculty_reg`),
  ADD KEY `idx_department` (`department`);

--
-- Indexes for table `ideas`
--
ALTER TABLE `ideas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `saved_ideas`
--
ALTER TABLE `saved_ideas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_save` (`student_id`,`idea_id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_idea` (`idea_id`);

--
-- Indexes for table `semester_records`
--
ALTER TABLE `semester_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_semester` (`semester_number`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `reg_number` (`reg_number`),
  ADD KEY `idx_department` (`department`),
  ADD KEY `idx_semester` (`current_semester`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `ideas`
--
ALTER TABLE `ideas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `saved_ideas`
--
ALTER TABLE `saved_ideas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `semester_records`
--
ALTER TABLE `semester_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty`
--
ALTER TABLE `faculty`
  ADD CONSTRAINT `faculty_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `saved_ideas`
--
ALTER TABLE `saved_ideas`
  ADD CONSTRAINT `saved_ideas_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `saved_ideas_ibfk_2` FOREIGN KEY (`idea_id`) REFERENCES `ideas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `semester_records`
--
ALTER TABLE `semester_records`
  ADD CONSTRAINT `semester_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
