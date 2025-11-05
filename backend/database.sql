
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT 'user',
  `bio` text,
  `avatar` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `funds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `userid` int(11) NOT NULL,
  `catid` int(11) NOT NULL,
  `currentprice` decimal(10,2) DEFAULT NULL,
  `newprice` decimal(10,2) DEFAULT NULL,
  `status` int(11) DEFAULT '0',
  `sort_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userid` (`userid`),
  KEY `catid` (`catid`),
  CONSTRAINT `funds_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`),
  CONSTRAINT `funds_ibfk_2` FOREIGN KEY (`catid`) REFERENCES `category` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `bio`, `avatar`) VALUES
(1, 'admin', 'admin@example.com', 'password', 'admin', 'I am the admin', NULL),
(2, 'user1', 'user1@example.com', 'password', 'user', 'I am a user', NULL);

INSERT INTO `category` (`id`, `name`) VALUES
(1, 'Technology'),
(2, 'Healthcare');

INSERT INTO `funds` (`id`, `name`, `description`, `userid`, `catid`, `currentprice`, `newprice`, `status`, `sort_order`) VALUES
(1, 'Tech Growth Fund', 'A fund focusing on high-growth technology companies.', 1, 1, '100.00', '105.00', 1, 1),
(2, 'Health Innovators', 'A fund investing in innovative healthcare solutions.', 2, 2, '150.00', '152.00', 1, 2),
(3, 'Future Tech', 'A fund for emerging technologies.', 1, 1, '80.00', '85.00', 0, 3);

