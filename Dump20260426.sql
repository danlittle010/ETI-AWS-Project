-- MySQL dump 10.13  Distrib 8.0.38, for macos14 (arm64)
--
-- Host: 127.0.0.1    Database: travel_aggregator
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `saved_deals`
--

DROP TABLE IF EXISTS `saved_deals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_deals` (
  `user_id` int NOT NULL,
  `travel_deal_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`travel_deal_id`),
  KEY `travel_deal_id` (`travel_deal_id`),
  CONSTRAINT `saved_deals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `saved_deals_ibfk_2` FOREIGN KEY (`travel_deal_id`) REFERENCES `travel_deals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_deals`
--

LOCK TABLES `saved_deals` WRITE;
/*!40000 ALTER TABLE `saved_deals` DISABLE KEYS */;
/*!40000 ALTER TABLE `saved_deals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `travel_deals`
--

DROP TABLE IF EXISTS `travel_deals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `travel_deals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `destination` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `airline` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `region` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Unknown',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `travel_deals`
--

LOCK TABLES `travel_deals` WRITE;
/*!40000 ALTER TABLE `travel_deals` DISABLE KEYS */;
INSERT INTO `travel_deals` VALUES (1,'Paris, France',299.99,'Air France','Europe'),(2,'Tokyo, Japan',599.99,'Japan Airlines','Asia'),(3,'New York, USA',199.99,'Delta Airlines','North America'),(4,'London, UK',350.00,'British Airways','Europe'),(5,'Bangkok, Thailand',450.00,'Thai Airways','Asia'),(6,'Toronto, Canada',299.00,'Air Canada','North America'),(7,'Rome, Italy',400.00,'Alitalia','Europe'),(8,'Beijing, China',600.00,'China Eastern','Asia'),(9,'Miami, USA',150.00,'American Airlines','North America'),(10,'Berlin, Germany',350.00,'Lufthansa','Europe'),(11,'Paris, France',299.99,'Air France','Europe'),(12,'Tokyo, Japan',599.99,'Japan Airlines','Asia'),(13,'New York, USA',199.99,'Delta Airlines','North America'),(14,'London, UK',350.00,'British Airways','Europe'),(15,'Bangkok, Thailand',450.00,'Thai Airways','Asia'),(16,'Toronto, Canada',299.00,'Air Canada','North America'),(17,'Rome, Italy',400.00,'Alitalia','Europe'),(18,'Beijing, China',600.00,'China Eastern','Asia'),(19,'Miami, USA',150.00,'American Airlines','North America'),(20,'Berlin, Germany',350.00,'Lufthansa','Europe');
/*!40000 ALTER TABLE `travel_deals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-26 15:52:35
