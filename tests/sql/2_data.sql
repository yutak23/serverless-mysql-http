-- MySQL dump 10.13  Distrib 8.0.32, for Linux (x86_64)
--
-- Host: localhost    Database: for_vitest
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `for_vitest`
--

USE `for_vitest`;

--
-- Dumping data for table `hotels`
--

LOCK TABLES `hotels` WRITE;
/*!40000 ALTER TABLE `hotels` DISABLE KEYS */;
INSERT INTO `hotels` VALUES (1,'日本ホテル','東京都千代田区1-1','{\"area\": {\"area\": {\"area\": \"内幸町1-1-1\", \"city\": \"千代田区\", \"prefecture\": \"東京都\"}, \"city\": \"千代田区\", \"prefecture\": \"東京都\"}, \"city\": \"千代田区\", \"prefecture\": \"東京都\"}',4.2,'2023-11-20 02:53:56','2023-11-20 02:53:56'),(2,'Japan HOTEL','1-1, Chiyoda-ku, Tokyo',NULL,4.3,'2023-11-20 04:06:46','2023-11-20 04:06:46'),(4,'INSERT HOTEL',NULL,NULL,3.5,'2023-11-20 07:53:15','2023-11-20 07:53:15'),(11,'INSERT HOTEL',NULL,NULL,3.5,'2023-11-20 08:11:51','2023-11-20 08:11:51'),(12,'INSERT HOTEL','1-1, Chiyoda-ku, Tokyo','{\"area\": {\"area\": {\"area\": \"内幸町1-1-1\", \"city\": \"千代田区\", \"prefecture\": \"東京都\"}, \"city\": \"千代田区\", \"prefecture\": \"東京都\"}, \"city\": \"千代田区\", \"prefecture\": \"東京都\"}',NULL,'2023-11-20 08:11:51','2023-11-20 08:11:51'),(13,'INSERT HOTEL',NULL,NULL,3.5,'2023-11-20 08:12:54','2023-11-20 08:12:54'),(14,'INSERT HOTEL','1-1, Chiyoda-ku, Tokyo','{\"area\": {\"area\": {\"area\": \"内幸町1-1-1\", \"city\": \"千代田区\", \"prefecture\": \"東京都\"}, \"city\": \"千代田区\", \"prefecture\": \"東京都\"}, \"city\": \"千代田区\", \"prefecture\": \"東京都\"}',NULL,'2023-11-20 08:12:54','2023-11-20 08:12:54');
/*!40000 ALTER TABLE `hotels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `pet`
--

LOCK TABLES `pet` WRITE;
/*!40000 ALTER TABLE `pet` DISABLE KEYS */;
INSERT INTO `pet` VALUES ('Fluffy','Harold','cat','f','1993-02-04',NULL),('Claws','Gwen','cat','m','1994-03-17',NULL),('Buffy','Harold','dog','f','1989-05-13',NULL),('Fang','Benny','dog','m','1990-08-27',NULL),('Bowser','Diane','dog','m','1979-08-31','1995-07-29'),('Chirpy','Gwen','bird','f','1998-09-11',NULL),('Whistler','Gwen','bird',NULL,'1997-12-09',NULL),('Slim','Benny','snake','m','1996-04-29',NULL),('Puffball','Diane','hamster','f','1999-03-30',NULL);
/*!40000 ALTER TABLE `pet` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-11-20  8:19:44
