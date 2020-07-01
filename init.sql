-- MySQL dump 10.13  Distrib 8.0.20, for macos10.15 (x86_64)
--
-- Host: 127.0.0.1    Database: pix_battle
-- ------------------------------------------------------
-- Server version	8.0.19

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
-- Table structure for table `avatar`
--

DROP TABLE IF EXISTS `avatar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avatar` (
  `avatar_id` int NOT NULL AUTO_INCREMENT,
  `avatar_url` varchar(255) NOT NULL,
  PRIMARY KEY (`avatar_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avatar`
--

LOCK TABLES `avatar` WRITE;
/*!40000 ALTER TABLE `avatar` DISABLE KEYS */;
/*!40000 ALTER TABLE `avatar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `battle`
--

DROP TABLE IF EXISTS `battle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `battle` (
  `battle_id` int NOT NULL AUTO_INCREMENT,
  `deadline` datetime DEFAULT NULL,
  `create_date` datetime NOT NULL,
  `group_id` int NOT NULL,
  `theme_id` int NOT NULL,
  `admin_user_id` int NOT NULL,
  `winner_user_id` int DEFAULT NULL,
  `status_id` int DEFAULT NULL,
  PRIMARY KEY (`battle_id`),
  KEY `fk_battle_theme1_idx` (`theme_id`),
  KEY `fk_battle_group1_idx` (`group_id`),
  KEY `fk_battle_user1_idx` (`admin_user_id`),
  KEY `fk_battle_user2_idx` (`winner_user_id`),
  KEY `fk_battle_battle_status1_idx` (`status_id`),
  CONSTRAINT `fk_battle_battle_status1` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`),
  CONSTRAINT `fk_battle_group1` FOREIGN KEY (`group_id`) REFERENCES `group` (`group_id`),
  CONSTRAINT `fk_battle_theme1` FOREIGN KEY (`theme_id`) REFERENCES `theme` (`theme_id`),
  CONSTRAINT `fk_battle_user1` FOREIGN KEY (`admin_user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `fk_battle_user2` FOREIGN KEY (`winner_user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `battle`
--

LOCK TABLES `battle` WRITE;
/*!40000 ALTER TABLE `battle` DISABLE KEYS */;
/*!40000 ALTER TABLE `battle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `battle_rule`
--

DROP TABLE IF EXISTS `battle_rule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `battle_rule` (
  `battle_id` int NOT NULL,
  `rule_id` int NOT NULL,
  PRIMARY KEY (`battle_id`,`rule_id`),
  KEY `fk_battle_has_rule_rule1_idx` (`rule_id`),
  KEY `fk_battle_has_rule_battle1_idx` (`battle_id`),
  CONSTRAINT `fk_battle_has_rule_battle1` FOREIGN KEY (`battle_id`) REFERENCES `battle` (`battle_id`),
  CONSTRAINT `fk_battle_has_rule_rule1` FOREIGN KEY (`rule_id`) REFERENCES `rule` (`rule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `battle_rule`
--

LOCK TABLES `battle_rule` WRITE;
/*!40000 ALTER TABLE `battle_rule` DISABLE KEYS */;
/*!40000 ALTER TABLE `battle_rule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group`
--

DROP TABLE IF EXISTS `group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group` (
  `group_id` int NOT NULL AUTO_INCREMENT,
  `group_name` varchar(45) NULL,
  `create_date` datetime NOT NULL,
  `admin_user_id` int NOT NULL,
  PRIMARY KEY (`group_id`),
  KEY `fk_group_user1_idx` (`admin_user_id`),
  CONSTRAINT `fk_group_user1` FOREIGN KEY (`admin_user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group`
--

LOCK TABLES `group` WRITE;
/*!40000 ALTER TABLE `group` DISABLE KEYS */;
/*!40000 ALTER TABLE `group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `photo`
--

DROP TABLE IF EXISTS `photo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `photo` (
  `photo_id` int NOT NULL AUTO_INCREMENT,
  `photo_url` varchar(255) NOT NULL,
  `create_date` datetime NOT NULL,
  `score` int DEFAULT NULL,
  `user_id` int NOT NULL,
  `battle_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`photo_id`),
  KEY `fk_photo_user1_idx` (`user_id`),
  KEY `fk_photo_battle1_idx` (`battle_id`),
  KEY `fk_photo_group1_idx` (`group_id`),
  CONSTRAINT `fk_photo_battle1` FOREIGN KEY (`battle_id`) REFERENCES `battle` (`battle_id`),
  CONSTRAINT `fk_photo_group1` FOREIGN KEY (`group_id`) REFERENCES `group` (`group_id`),
  CONSTRAINT `fk_photo_user1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photo`
--

LOCK TABLES `photo` WRITE;
/*!40000 ALTER TABLE `photo` DISABLE KEYS */;
/*!40000 ALTER TABLE `photo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rule`
--

DROP TABLE IF EXISTS `rule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rule` (
  `rule_id` int NOT NULL AUTO_INCREMENT,
  `rule_name` varchar(45) NOT NULL,
  PRIMARY KEY (`rule_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rule`
--

LOCK TABLES `rule` WRITE;
/*!40000 ALTER TABLE `rule` DISABLE KEYS */;
INSERT INTO `rule` VALUES (1,'Capture d\'écran'),(2,'Retouches'),(3,'Appareil photo'),(4,'Faire poser une personne'),(5,'Smartphone'),(6,'Ajout de texte'),(7,'Ajout d\'illustration');
/*!40000 ALTER TABLE `rule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `status`
--

DROP TABLE IF EXISTS `status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status` (
  `status_id` int NOT NULL AUTO_INCREMENT,
  `status_name` varchar(45) NOT NULL,
  PRIMARY KEY (`status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status`
--

LOCK TABLES `status` WRITE;
/*!40000 ALTER TABLE `status` DISABLE KEYS */;
INSERT INTO `status` VALUES (1,'post'),(2,'vote'),(3,'completed');
/*!40000 ALTER TABLE `status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `theme`
--

DROP TABLE IF EXISTS `theme`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `theme` (
  `theme_id` int NOT NULL AUTO_INCREMENT,
  `theme_name` varchar(45) NOT NULL,
  PRIMARY KEY (`theme_id`)
) ENGINE=InnoDB AUTO_INCREMENT=159 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `theme`
--

LOCK TABLES `theme` WRITE;
/*!40000 ALTER TABLE `theme` DISABLE KEYS */;
INSERT INTO `theme` VALUES (1,'Encore un matin'),(2,'Vue d’en haut'),(3,'En-dessous'),(4,'Technologie'),(5,'Ras du sol'),(6,'Reflets'),(7,'Ombre'),(8,'Un objet'),(9,'Drapeaux'),(10,'Sublimer un déchets'),(11,'Amour'),(12,'Pays'),(13,'Vert'),(14,'Photo culinaire'),(15,'Bleu'),(16,'Rouge'),(17,'Jaune'),(18,'Noir'),(19,'Blanc'),(20,'Miroir'),(21,'Courbes'),(22,'Avant – après'),(23,'Symétrie'),(24,'Lignes'),(25,'Flower Power'),(26,'Petit bonheur'),(27,'Joie'),(28,'Peur'),(29,'Noir & Blanc'),(30,'Souvenir d’enfance'),(31,'Animal'),(32,'Dans mon sac'),(33,'Lecture'),(34,'Ecriture'),(35,'Coloré'),(36,'Escaliers'),(37,'Contre-jour'),(38,'Tic-Tac'),(39,'Horizon'),(40,'Caché'),(41,'Pont'),(42,'Ras du sol Reflets'),(43,'Vue du dessus'),(44,'Sur la tête'),(45,'C’est dans l’air'),(46,'Microcosmos'),(47,'Regard'),(48,'Yeux'),(49,'Mains'),(50,'Couteau'),(51,'Machine'),(52,'Pièce'),(53,'Clé'),(54,'Bijou'),(55,'Impossible'),(56,'Balle & ballon'),(57,'Rythme'),(58,'Sport'),(59,'Décalé'),(60,'Fourchette'),(61,'Fentes'),(62,'Œuf'),(63,'Pierre et rocher'),(64,'Nuit'),(65,'Métal'),(66,'Rue'),(67,'Répétition'),(68,'Feu'),(69,'Route'),(70,'Empilement'),(71,'Parallèle'),(72,'Perpendiculaire'),(73,'Opposés'),(74,'Champignon'),(75,'Argent'),(76,'Chaussure'),(77,'Silhouette'),(78,'Musique'),(79,'Multitude'),(80,'Mouvement'),(81,'Coucher de soleil'),(82,'Au bord de l’eau'),(83,'Petit trésor'),(84,'Splash !'),(85,'Surprise !'),(86,'Magie'),(87,'L’eau'),(88,'Porte'),(89,'A moitié'),(90,'Goutte'),(91,'Ne pas déranger'),(92,'Vieux'),(93,'Sale'),(94,'Illusion'),(95,'Propre'),(96,'Perspective'),(97,'De l’autre côté'),(98,'Fenêtre'),(99,'Liberté'),(100,'Lumière'),(101,'Temps'),(102,'Détail'),(103,'Solitude'),(104,'Absurde'),(105,'Vitesse'),(106,'Vagues'),(107,'Autoportrait'),(108,'Jeune'),(109,'Abandonné'),(110,'Froid'),(111,'Chaud'),(112,'Architecture'),(113,'Nature'),(114,'Texture'),(115,'Sombre'),(116,'Ailleurs'),(117,'Coupé'),(118,'Cinéma'),(119,'Guerre'),(120,'Horreur'),(121,'Paysage'),(122,'Gros plan'),(123,'Trio'),(124,'Nostalgie'),(125,'A la queue leu-leu'),(126,'Perché'),(127,'Rond(s)'),(128,'Carré(s)'),(129,'Ça flotte'),(130,'Ça vole'),(131,'En l’air'),(132,'Chimique'),(133,'Chiffres et nombres'),(134,'Un ustensile'),(135,'Un outil'),(136,'Un aliment'),(137,'Voiture'),(138,'2 roues'),(139,'Vibration'),(140,'Troué'),(141,'Sur mon bureau'),(142,'Rayures'),(143,'Arbre'),(144,'Sur un fil'),(145,'Petite cuillère'),(146,'Sourire'),(147,'Tricolore'),(148,'Bicolore'),(149,'Duo'),(150,'Bris et débris'),(151,'Contraste'),(152,'Géométrie'),(153,'Lettres'),(154,'Zombie'),(155,'Superstition'),(156,'Construction'),(157,'Statue'),(158,'Fumée');
/*!40000 ALTER TABLE `theme` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `create_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `avatar_id` int DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `fk_user_avatar_idx` (`avatar_id`),
  CONSTRAINT `fk_user_avatar` FOREIGN KEY (`avatar_id`) REFERENCES `avatar` (`avatar_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_battle`
--

DROP TABLE IF EXISTS `user_battle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_battle` (
  `user_id` int NOT NULL,
  `battle_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`battle_id`),
  KEY `fk_user_has_battle_battle1_idx` (`battle_id`),
  KEY `fk_user_has_battle_user1_idx` (`user_id`),
  CONSTRAINT `fk_user_has_battle_battle1` FOREIGN KEY (`battle_id`) REFERENCES `battle` (`battle_id`),
  CONSTRAINT `fk_user_has_battle_user1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_battle`
--

LOCK TABLES `user_battle` WRITE;
/*!40000 ALTER TABLE `user_battle` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_battle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_group`
--

DROP TABLE IF EXISTS `user_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_group` (
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`group_id`),
  KEY `fk_user_has_group_group1_idx` (`group_id`),
  KEY `fk_user_has_group_user1_idx` (`user_id`),
  CONSTRAINT `fk_user_has_group_group1` FOREIGN KEY (`group_id`) REFERENCES `group` (`group_id`),
  CONSTRAINT `fk_user_has_group_user1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_group`
--

LOCK TABLES `user_group` WRITE;
/*!40000 ALTER TABLE `user_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_photo`
--

DROP TABLE IF EXISTS `user_photo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_photo` (
  `user_id` int NOT NULL,
  `photo_id` int NOT NULL,
  `vote` int NOT NULL,
  `create_date` datetime NOT NULL,
  PRIMARY KEY (`user_id`,`photo_id`),
  KEY `fk_user_has_photo_photo1_idx` (`photo_id`),
  KEY `fk_user_has_photo_user1_idx` (`user_id`),
  CONSTRAINT `fk_user_has_photo_photo1` FOREIGN KEY (`photo_id`) REFERENCES `photo` (`photo_id`),
  CONSTRAINT `fk_user_has_photo_user1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_photo`
--

LOCK TABLES `user_photo` WRITE;
/*!40000 ALTER TABLE `user_photo` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_photo` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-06-10 16:41:57
