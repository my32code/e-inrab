-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 15, 2025 at 05:15 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `e_inrab`
--

-- --------------------------------------------------------

--
-- Table structure for table `commandes`
--

CREATE TABLE `commandes` (
  `id` int(11) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `produit_id` int(11) NOT NULL,
  `quantite` int(11) NOT NULL,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `statut` enum('en_attente','payee','expediee','annulee') DEFAULT 'en_attente',
  `reference_paiement` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `commandes`
--

INSERT INTO `commandes` (`id`, `utilisateur_id`, `produit_id`, `quantite`, `prix_unitaire`, `statut`, `reference_paiement`, `created_at`) VALUES
(1, 3, 1, 1, 250.00, 'en_attente', NULL, '2025-04-18 09:30:41'),
(2, 3, 1, 1, 250.00, 'en_attente', NULL, '2025-04-18 09:42:56'),
(3, 3, 1, 1, 250.00, 'en_attente', NULL, '2025-04-22 14:07:22'),
(4, 3, 1, 1, 250.00, 'en_attente', NULL, '2025-04-24 13:26:46'),
(5, 3, 1, 1, 250.00, 'en_attente', NULL, '2025-04-24 14:34:42'),
(6, 3, 1, 1, 250.00, 'en_attente', NULL, '2025-04-24 14:40:03'),
(7, 3, 1, 1, 250.00, 'en_attente', NULL, '2025-04-24 15:06:07'),
(8, 3, 1, 1, 250.00, 'en_attente', NULL, '2025-04-24 15:08:38'),
(9, 3, 1, 1, 250.00, 'en_attente', NULL, '2025-04-24 15:19:27'),
(10, 3, 1, 1, 250.00, 'en_attente', NULL, '2025-04-24 15:39:45'),
(11, 3, 1, 1, 250.00, 'en_attente', NULL, '2025-04-24 16:54:04'),
(12, 3, 1, 1, 250.00, 'en_attente', NULL, '2025-05-07 10:31:47'),
(13, 3, 1, 1, 250.00, 'en_attente', NULL, '2025-05-07 10:32:22');

-- --------------------------------------------------------

--
-- Table structure for table `demandes`
--

CREATE TABLE `demandes` (
  `id` int(11) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `statut` enum('en attente','validée','en cours','livrée','rejetée') DEFAULT 'en attente',
  `quantite` int(11) NOT NULL,
  `description` text NOT NULL,
  `date_demande` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_mise_a_jour` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `montant_proforma` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `demandes`
--

INSERT INTO `demandes` (`id`, `utilisateur_id`, `service_id`, `statut`, `quantite`, `description`, `date_demande`, `date_mise_a_jour`, `montant_proforma`) VALUES
(5, 3, 14, 'en attente', 1, 'diagnostics', '2025-05-07 16:06:17', '2025-05-14 12:22:03', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `commande_id` int(11) DEFAULT NULL,
  `demande_id` int(11) DEFAULT NULL,
  `document_demande_id` int(11) DEFAULT NULL,
  `nom_fichier` varchar(255) NOT NULL,
  `chemin_fichier` varchar(255) NOT NULL,
  `type_document` enum('commande','service') NOT NULL,
  `categorie` enum('facture','preuve_paiement','piece_complementaire','autre') NOT NULL,
  `uploaded_by` enum('admin','client') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `commande_id`, `demande_id`, `document_demande_id`, `nom_fichier`, `chemin_fichier`, `type_document`, `categorie`, `uploaded_by`, `created_at`) VALUES
(22, 13, NULL, NULL, 'facture_proforma_13.pdf', 'uploads/factures/facture_proforma_13.pdf', 'commande', 'facture', '', '2025-05-15 11:01:37'),
(25, 13, NULL, NULL, 'admindash.PNG', 'C:\\Users\\princ\\Documents\\e-inrab\\uploads\\documents\\1747318584525-771313344-admindash.PNG', 'commande', '', 'admin', '2025-05-15 14:16:24');

-- --------------------------------------------------------

--
-- Table structure for table `documentsold`
--

CREATE TABLE `documentsold` (
  `id` int(11) NOT NULL,
  `commande_id` int(11) NOT NULL,
  `nom_fichier` varchar(255) NOT NULL,
  `chemin_fichier` varchar(255) NOT NULL,
  `type_document` enum('commande','service') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documents_demandes`
--

CREATE TABLE `documents_demandes` (
  `id` int(11) NOT NULL,
  `demande_id` int(11) NOT NULL,
  `nom_fichier` varchar(255) NOT NULL,
  `chemin_fichier` varchar(255) NOT NULL,
  `date_upload` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents_demandes`
--

INSERT INTO `documents_demandes` (`id`, `demande_id`, `nom_fichier`, `chemin_fichier`, `date_upload`) VALUES
(2, 5, 'mode.PNG', '1746633977978-mode.PNG', '2025-05-07 16:06:17');

-- --------------------------------------------------------

--
-- Table structure for table `old_d`
--

CREATE TABLE `old_d` (
  `id` int(11) NOT NULL,
  `commande_id` int(11) NOT NULL,
  `demande_id` int(11) NOT NULL,
  `nom_fichier` varchar(255) NOT NULL,
  `chemin_fichier` varchar(255) NOT NULL,
  `type_document` enum('commande','service') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `document_demande_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `old_demandes`
--

CREATE TABLE `old_demandes` (
  `id` int(11) NOT NULL,
  `utilisateur_id` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `statut` enum('en attente','validée','en cours','livrée','rejetée') DEFAULT 'en attente',
  `date_demande` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `paiements`
--

CREATE TABLE `paiements` (
  `id` int(11) NOT NULL,
  `demande_id` int(11) DEFAULT NULL,
  `commande_id` int(11) DEFAULT NULL,
  `montant` decimal(10,2) NOT NULL,
  `statut` enum('en attente','validé','échoué','annulé') DEFAULT 'en attente',
  `date_mise_a_jour` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reference_kkiapay` varchar(255) DEFAULT NULL,
  `mode_paiement` enum('mtn','moov','mtn_ci','orange','card') DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `client_email` varchar(100) DEFAULT NULL,
  `client_telephone` varchar(20) DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'XOF',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `date_creation` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `paiements`
--

INSERT INTO `paiements` (`id`, `demande_id`, `commande_id`, `montant`, `statut`, `date_mise_a_jour`, `reference_kkiapay`, `mode_paiement`, `description`, `client_email`, `client_telephone`, `currency`, `metadata`, `date_creation`) VALUES
(1, NULL, 1, 250.00, 'en attente', '2025-04-18 10:30:41', NULL, NULL, NULL, NULL, NULL, 'XOF', NULL, '2025-04-18 10:30:41'),
(2, NULL, 2, 250.00, 'en attente', '2025-04-18 10:42:56', NULL, NULL, NULL, NULL, NULL, 'XOF', NULL, '2025-04-18 10:42:56'),
(3, NULL, 3, 250.00, 'en attente', '2025-04-22 15:07:22', NULL, NULL, NULL, NULL, NULL, 'XOF', NULL, '2025-04-22 15:07:22'),
(4, NULL, 4, 250.00, 'en attente', '2025-04-24 14:26:46', NULL, NULL, NULL, NULL, NULL, 'XOF', NULL, '2025-04-24 14:26:46'),
(5, NULL, 5, 250.00, 'en attente', '2025-04-24 15:34:42', NULL, NULL, NULL, NULL, NULL, 'XOF', NULL, '2025-04-24 15:34:42'),
(6, NULL, 6, 250.00, 'en attente', '2025-04-24 15:40:03', NULL, NULL, NULL, NULL, NULL, 'XOF', NULL, '2025-04-24 15:40:03');

-- --------------------------------------------------------

--
-- Table structure for table `partenariats`
--

CREATE TABLE `partenariats` (
  `id` int(11) NOT NULL,
  `nom_organisation` varchar(255) NOT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `projet` text DEFAULT NULL,
  `date_signature` date DEFAULT NULL,
  `utilisateur_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `produits`
--

CREATE TABLE `produits` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `categorie` varchar(100) NOT NULL,
  `prix` varchar(100) DEFAULT NULL,
  `pieces_requise` text DEFAULT NULL,
  `delai_mise_disposition` varchar(100) DEFAULT NULL,
  `meta_estimation` enum('produit','service') NOT NULL,
  `stock` int(11) DEFAULT 0,
  `prix_numerique` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `produits`
--

INSERT INTO `produits` (`id`, `nom`, `description`, `categorie`, `prix`, `pieces_requise`, `delai_mise_disposition`, `meta_estimation`, `stock`, `prix_numerique`) VALUES
(1, 'Graines germées de palmier à huile', 'Semences pré-germées de palmier à huile', 'Semences', '250 FCFA l\'unité', 'Demande écrite adressée au DG/INRAB, Directeur du CRA-PP ou DDAEP', '8 à 10 mois', 'produit', 1, 250.00),
(2, 'Plants de palmier à huile', 'Jeunes plants de palmier à huile prêts à planter', 'Plants', '705 FCFA l\'unité', 'Demande écrite adressée au DG/INRAB, Directeur du CRA-PP ou DDAEP', '8 à 10 mois', 'produit', 0, 705.00),
(3, 'Régimes de palme', 'Régimes frais de palmier à huile', 'Produits dérivés', '45.000 à 55.000 FCFA la tonne', 'Demande écrite adressée au DG/INRAB, Directeur du CRA-PP ou DDAEP', '10 à 30 jours', 'produit', 0, 45.00),
(4, 'Tourteaux de noix de palme', 'Résidus de pression des noix de palme', 'Produits dérivés', '2000 à 3500 FCFA', 'Demande écrite adressée au DG/INRAB, Directeur du CRA-PP ou DDAEP', '10 jours', 'produit', 0, 20003500.00),
(5, 'Plants de cocotier hybrides et nains', 'Jeunes plants de cocotier améliorés', 'Plants', '1000 FCFA l\'unité', 'Demande écrite adressée au DG/INRAB ou Directeur du CRA-PP', '8 à 10 mois', 'produit', 0, 1000.00),
(6, 'Plants de cocotier GOA', 'Variété traditionnelle de cocotier', 'Plants', '800 FCFA l\'unité', 'Demande écrite adressée au DG/INRAB ou Directeur du CRA-PP', '8 à 10 mois', 'produit', 6, 800.00),
(7, 'Noix de coco de bouche', 'Noix de coco pour consommation directe', 'Fruits', '80 FCFA l\'unité (tas de 500)', 'Demande écrite adressée au DG/INRAB ou Directeur du CRA-PP', '30 à 90 jours', 'produit', 0, 80500.00),
(8, 'Semences polyclonales d\'anacardier', 'Semences sélectionnées d\'anacardier', 'Semences', '1500 FCFA le kg', 'Demande écrite adressée au DG/INRAB ou Directeur du CRA-Centre', '1 à 4 mois', 'produit', 0, 1500.00),
(9, 'Plants greffés d\'anacardier', 'Plants d\'anacardier greffés', 'Plants', '600 FCFA l\'unité', 'Demande écrite adressée au DG/INRAB ou Directeur du CRA-Centre', '15 à 45 jours', 'produit', 0, 600.00),
(10, 'Semenceaux de base d\'igname', 'Semences certifiées d\'igname', 'Semences', '250 FCFA l\'unité', 'Demande écrite adressée au DG/INRAB ou Directeur du CRA-Centre', '10 à 12 mois', 'produit', 0, 250.00),
(11, 'Boutures de manioc de base', 'Boutures saines de manioc', 'Semences', '50 FCFA l\'unité', 'Demande écrite adressée au DG/INRAB, Directeur du CRA-Centre ou CRA-Sud', '10 à 12 mois', 'produit', 2, 50.00),
(12, 'Semences de cultures maraîchères', 'Variétés diverses de légumes', 'Semences', 'Variable selon l\'espèce', 'Variable selon demande', 'Variable', 'produit', 0, 0.00),
(13, 'Semences de prébase de sorgho et mil', 'Semences certifiées de céréales', 'Semences', '1000 à 1500 FCFA le kg', 'Demande écrite, convention et avance', '1 an', 'produit', 0, 10001500.00),
(14, 'Semences de prébase de fonio', 'Semences certifiées de fonio', 'Semences', '2000 à 2500 FCFA le kg', 'Demande écrite, convention et avance', '1 an', 'produit', 0, 20002500.00),
(15, 'Semences de légumineuses à graines', 'Voandzou, soja, arachide, niébé', 'Semences', 'Variable selon l\'espèce', 'Demande écrite, convention et avance (60%)', '1 an', 'produit', 0, 0.00),
(16, 'Rejets d\'ananas pain de sucre', 'Plants d\'ananas traditionnel', 'Plants', '15 FCFA par rejet', 'Demande écrite adressée au DG/INRAB, DCRA-H ou DCRA-Sud', '12 mois', 'produit', 0, 15.00),
(17, 'Rejets d\'ananas cayenne lisse', 'Plants d\'ananas amélioré', 'Plants', '25 FCFA par rejet', 'Demande écrite adressée au DG/INRAB, DCRA-H ou DCRA-Sud', '12 mois', 'produit', 0, 25.00),
(18, 'Rejets de bananiers dessert et plantain', 'Plants de bananiers', 'Plants', '500 FCFA par rejet', 'Demande écrite adressée au DG/INRAB, DCRA-H ou DCRA-Sud', '3 à 4 mois', 'produit', 0, 500.00),
(19, 'Semences et géniteurs d\'animaux d\'élevage', 'Matériel génétique pour élevage', 'Élevage', NULL, 'Non spécifié', 'Non spécifié', 'produit', 0, NULL),
(20, 'Semences de prébase de poissons et crevettes', 'Alevins et géniteurs aquacoles', 'Aquaculture', NULL, 'Non spécifié', 'Non spécifié', 'produit', 0, NULL),
(21, 'Semences fourragères', 'Plantes pour alimentation animale', 'Fourrage', NULL, 'Non spécifié', 'Non spécifié', 'produit', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `publications`
--

CREATE TABLE `publications` (
  `id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `contenu` text DEFAULT NULL,
  `auteur_id` int(11) DEFAULT NULL,
  `date_publication` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `categorie` varchar(100) DEFAULT NULL,
  `prix` varchar(255) DEFAULT NULL,
  `pieces_requises` text DEFAULT NULL,
  `delai_mise_disposition` varchar(100) DEFAULT NULL,
  `meta_estimation` enum('officiel','estimé') DEFAULT 'officiel' COMMENT 'UTILISATION INTERNE - Ne pas afficher sur le site'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `nom`, `description`, `categorie`, `prix`, `pieces_requises`, `delai_mise_disposition`, `meta_estimation`) VALUES
(14, 'Diagnostic des maladies des cultures', 'Analyse phytosanitaire en laboratoire', 'Expertise', 'Sur devis', 'Échantillons à fournir', 'Variable', 'estimé'),
(15, 'Formation aux techniques agricoles', 'Sur mesure selon besoins', 'Formation', 'Sur devis', 'Demande détaillée', 'À convenir', 'estimé'),
(19, 'Documents scientifiques et techniques', 'Publications de recherche', 'Documentation', 'Gratuit ou sur devis', 'Demande motivée', '7-15 jours', 'estimé'),
(20, 'Accès aux acquis de recherche', 'Résultats validés par l\'INRAB', 'Ressources', 'Gratuit (sous conditions)', 'Convention de partenariat', 'À convenir', 'estimé'),
(21, 'Renseignements techniques', 'Conseils agricoles de base', 'Conseil', 'Gratuit', 'Demande simple', 'Sous 48h', 'officiel'),
(22, 'Équipements agricoles', 'Matériel de culture et récolte', 'Matériel', 'Sur devis', 'Spécifications techniques', '2-4 semaines', 'estimé'),
(23, 'Installations piscicoles', 'Étude et mise en place', 'Aquaculture', 'Sur devis', 'Diagnostic terrain', '1-3 mois', 'estimé'),
(24, 'Élevage d\'espèces non conventionnelles', 'Lapins, escargots, etc.', 'Élevage', 'Sur devis', 'Projet détaillé', 'Variable', 'estimé'),
(25, 'Formation en transformation alimentaire', 'Technologies de conservation', 'Formation', '25 000 FCFA/jour/pers.', 'Inscription préalable', 'Calendrier annuel', 'officiel'),
(26, 'Contrôle qualité des denrées', 'Normes sanitaires', 'Formation', '30 000 FCFA/jour/pers.', 'Inscription + échantillons', 'Selon planning', 'officiel'),
(27, 'Formation en techniques culturales', 'Méthodes améliorées', 'Formation', '20 000 FCFA/jour/pers.', 'Demande 15 jours à l\'avance', 'Saisonnière', 'officiel'),
(28, 'Diagnostic de maladies des cultures', 'Analyse en laboratoire', 'Expertise', '15 000 FCFA/échantillon', 'Échantillons frais', '5-7 jours', 'officiel'),
(29, 'Analyse de sols', 'Fertilité et composition', 'Laboratoire', '20 000 FCFA/analyse', '500g de terre', '10 jours', 'officiel'),
(30, 'Partenariats de recherche', 'Collaborations scientifiques', 'Partenariat', 'Sur convention', 'Dossier technique', '3-6 mois', 'officiel'),
(31, 'Agrément prestataire INRAB', 'Liste officielle des fournisseurs', 'Administratif', '50 000 FCFA/dossier', 'Dossier complet', '2 mois', 'officiel'),
(33, 'Accès aux acquis de recherche de l\'INRAB', 'Consultation des résultats et innovations issues de la recherche agricole', 'Information', NULL, 'Non spécifié', 'Non spécifié', ''),
(34, 'Renseignements et orientation techniques', 'Conseils et orientations techniques pour les projets agricoles', 'Conseil', NULL, 'Non spécifié', 'Non spécifié', ''),
(35, 'Mise à disposition des documents de valorisation', 'Documents promotionnels et supports de vulgarisation', 'Information', NULL, 'Non spécifié', 'Non spécifié', ''),
(36, 'Acquisition d\'équipements d\'entretien des cultures', 'Conseil et accompagnement pour l\'acquisition d\'équipements agricoles', 'Conseil', NULL, 'Non spécifié', 'Non spécifié', ''),
(37, 'Mise en place des installations piscicoles', 'Conseil et accompagnement pour la création de fermes piscicoles', 'Conseil', NULL, 'Non spécifié', 'Non spécifié', ''),
(41, 'Formation sur le contrôle de qualité sanitaire', 'Formation sur les normes sanitaires et nutritionnelles', 'Formation', NULL, 'Non spécifié', 'Non spécifié', ''),
(43, 'Formation sur les technologies végétales', 'Formation sur les innovations en cultures végétales', 'Formation', NULL, 'Non spécifié', 'Non spécifié', ''),
(44, 'Formation en Horticultures et Agrumes', 'Formation spécialisée sur les cultures horticoles', 'Formation', NULL, 'Non spécifié', 'Non spécifié', ''),
(45, 'Encadrement de stages académiques', 'Accueil et encadrement des stagiaires étudiants', 'Formation', NULL, 'Non spécifié', 'Non spécifié', ''),
(46, 'Informations aux usagers', 'Service d\'information générale aux bénéficiaires', 'Information', NULL, 'Non spécifié', 'Non spécifié', ''),
(47, 'Diagnostic des maladies et nuisibles des cultures', 'Analyse et identification des pathologies végétales', 'Expertise', NULL, 'Non spécifié', 'Non spécifié', ''),
(48, 'Tests d\'efficacité de produits phytosanitaires', 'Évaluation scientifique des pesticides et engrais', 'Expertise', NULL, 'Non spécifié', 'Non spécifié', ''),
(49, 'Analyses Bio-Médicales', 'Analyses de qualité des produits animaux et halieutiques', 'Expertise', NULL, 'Non spécifié', 'Non spécifié', ''),
(50, 'Etudes Agro-Pédologiques', 'Analyses de sols, eaux et végétaux', 'Expertise', NULL, 'Non spécifié', 'Non spécifié', ''),
(51, 'Diagnostic des ichtyopathologies', 'Expertise en santé piscicole et bonnes pratiques', 'Expertise', NULL, 'Non spécifié', 'Non spécifié', ''),
(52, 'Obtention d\'agrément prestataire INRAB', 'Procédure pour devenir prestataire officiel de l\'INRAB', 'Administratif', NULL, 'Non spécifié', 'Non spécifié', ''),
(53, 'Participation aux appels à concurrence', 'Accompagnement pour répondre aux appels d\'offres', 'Administratif', NULL, 'Non spécifié', 'Non spécifié', ''),
(54, 'Règlement des contentieux des marchés publics', 'Assistance dans les litiges contractuels', 'Administratif', NULL, 'Non spécifié', 'Non spécifié', ''),
(55, 'Appui technique aux organes de presse', 'Support technique pour les médias couvrant l\'INRAB', 'Communication', NULL, 'Non spécifié', 'Non spécifié', ''),
(56, 'Mise à disposition d\'informations journalistiques', 'Fourniture de contenus médiatiques', 'Communication', NULL, 'Non spécifié', 'Non spécifié', ''),
(57, 'Ecotourisme', 'Activités et visites guidées en milieu agricole', 'Tourisme', NULL, 'Non spécifié', 'Non spécifié', ''),
(58, 'Soumission aux appels à projets', 'Appui à la soumission de projets de recherche', 'Recherche', NULL, 'Non spécifié', 'Non spécifié', ''),
(59, 'Recherche de partenariat', 'Facilitation des partenariats institutionnels', 'Partenariat', NULL, 'Non spécifié', 'Non spécifié', '');

-- --------------------------------------------------------

--
-- Table structure for table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mot_de_passe` text NOT NULL,
  `role` enum('agriculteur','chercheur','entreprise','partenaire','admin') NOT NULL,
  `date_inscription` timestamp NOT NULL DEFAULT current_timestamp(),
  `session_id` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `nom`, `email`, `mot_de_passe`, `role`, `date_inscription`, `session_id`) VALUES
(1, 'ADILEHOU ', 'wilmathadilehou@gmail.com', '$2b$12$IOVS.5c9ta3U4gJOpkETE.3ymk/bbo5BffG0WJJhSnqNKea9olrPG', 'agriculteur', '2025-03-31 14:36:12', '471db172-24e1-4d7e-bec1-180ddeea6af0'),
(2, 'DAOUDA ', 'princeadilehou@gmail.com', '$2b$12$MxIoMEjXpOPn3W0USI3rJ.7/vfQ.yFNl25Tjs9MUPNaaAN5uwL7gC', 'agriculteur', '2025-03-31 17:02:52', NULL),
(3, 'MORGAN', 'adh@gmail.com', '$2b$12$hr9QCyPSzQkBC8IylaiBnOj6fYS6J5a/HIHLBl.5NDlsmzaik7jo.', 'agriculteur', '2025-04-02 09:31:28', '44fe4acb-5706-49f3-bd75-ca29a87f98fb'),
(4, 'GAKPE', 'gkp@gmail.com', '$2b$12$BCCwBQfGns2BreuiFdnp7ejhebKIMtmOFqv.WTeca50hdvAT.dYy6', 'agriculteur', '2025-05-07 09:24:43', NULL),
(5, 'ADMIN', 'admin@gmail.com', '$2b$12$SGHUNGm7Z/OQK1a9j31XfetuwRPaJcF1RYqvmcwkjrDcy3kfEvGwK', 'admin', '2025-05-08 09:20:21', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `commandes`
--
ALTER TABLE `commandes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`),
  ADD KEY `produit_id` (`produit_id`);

--
-- Indexes for table `demandes`
--
ALTER TABLE `demandes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `commande_id` (`commande_id`),
  ADD KEY `demande_id` (`demande_id`),
  ADD KEY `document_demande_id` (`document_demande_id`);

--
-- Indexes for table `documentsold`
--
ALTER TABLE `documentsold`
  ADD PRIMARY KEY (`id`),
  ADD KEY `commande_id` (`commande_id`);

--
-- Indexes for table `documents_demandes`
--
ALTER TABLE `documents_demandes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `demande_id` (`demande_id`);

--
-- Indexes for table `old_d`
--
ALTER TABLE `old_d`
  ADD PRIMARY KEY (`id`),
  ADD KEY `commande_id` (`commande_id`),
  ADD KEY `demande_id` (`demande_id`),
  ADD KEY `fk_document_demande` (`document_demande_id`);

--
-- Indexes for table `old_demandes`
--
ALTER TABLE `old_demandes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `paiements`
--
ALTER TABLE `paiements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `demande_id` (`demande_id`),
  ADD KEY `commande_id` (`commande_id`);

--
-- Indexes for table `partenariats`
--
ALTER TABLE `partenariats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`);

--
-- Indexes for table `produits`
--
ALTER TABLE `produits`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `publications`
--
ALTER TABLE `publications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `auteur_id` (`auteur_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `commandes`
--
ALTER TABLE `commandes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `demandes`
--
ALTER TABLE `demandes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `documentsold`
--
ALTER TABLE `documentsold`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documents_demandes`
--
ALTER TABLE `documents_demandes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `old_d`
--
ALTER TABLE `old_d`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `old_demandes`
--
ALTER TABLE `old_demandes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `paiements`
--
ALTER TABLE `paiements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `partenariats`
--
ALTER TABLE `partenariats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `produits`
--
ALTER TABLE `produits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `publications`
--
ALTER TABLE `publications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `commandes`
--
ALTER TABLE `commandes`
  ADD CONSTRAINT `commandes_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`),
  ADD CONSTRAINT `commandes_ibfk_2` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`);

--
-- Constraints for table `demandes`
--
ALTER TABLE `demandes`
  ADD CONSTRAINT `demandes_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`);

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`demande_id`) REFERENCES `demandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `documents_ibfk_3` FOREIGN KEY (`document_demande_id`) REFERENCES `documents_demandes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `documentsold`
--
ALTER TABLE `documentsold`
  ADD CONSTRAINT `documentsold_ibfk_1` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `documents_demandes`
--
ALTER TABLE `documents_demandes`
  ADD CONSTRAINT `documents_demandes_ibfk_1` FOREIGN KEY (`demande_id`) REFERENCES `demandes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `old_d`
--
ALTER TABLE `old_d`
  ADD CONSTRAINT `fk_document_demande` FOREIGN KEY (`document_demande_id`) REFERENCES `documents_demandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `old_d_ibfk_1` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `old_d_ibfk_2` FOREIGN KEY (`demande_id`) REFERENCES `demandes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `old_demandes`
--
ALTER TABLE `old_demandes`
  ADD CONSTRAINT `old_demandes_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `old_demandes_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `paiements`
--
ALTER TABLE `paiements`
  ADD CONSTRAINT `commande_id` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`);

--
-- Constraints for table `partenariats`
--
ALTER TABLE `partenariats`
  ADD CONSTRAINT `partenariats_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `publications`
--
ALTER TABLE `publications`
  ADD CONSTRAINT `publications_ibfk_1` FOREIGN KEY (`auteur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
