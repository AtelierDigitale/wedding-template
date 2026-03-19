-- =====================
-- UTENTI (auth multi-ruolo)
-- =====================
CREATE TABLE IF NOT EXISTS utenti (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  ruolo ENUM('sposi', 'planner') NOT NULL,
  nome VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================
-- CATEGORIE PREVENTIVO
-- =====================
CREATE TABLE IF NOT EXISTS categorie_preventivo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  icona VARCHAR(50) DEFAULT NULL,
  ordine INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================
-- PREVENTIVI
-- =====================
CREATE TABLE IF NOT EXISTS preventivi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT NOT NULL,
  fornitore VARCHAR(255) NOT NULL,
  descrizione TEXT,
  prezzo DECIMAL(10,2) NOT NULL,
  note TEXT,
  scelto TINYINT DEFAULT 0,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorie_preventivo(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES utenti(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================
-- ALLEGATI PREVENTIVI
-- =====================
CREATE TABLE IF NOT EXISTS preventivi_allegati (
  id INT AUTO_INCREMENT PRIMARY KEY,
  preventivo_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  tipo VARCHAR(50),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (preventivo_id) REFERENCES preventivi(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================
-- SPESE
-- =====================
CREATE TABLE IF NOT EXISTS spese (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT DEFAULT NULL,
  preventivo_id INT DEFAULT NULL,
  descrizione VARCHAR(255) NOT NULL,
  importo DECIMAL(10,2) NOT NULL,
  stato ENUM('da_pagare', 'acconto', 'saldato') DEFAULT 'da_pagare',
  nota TEXT,
  manuale TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorie_preventivo(id) ON DELETE SET NULL,
  FOREIGN KEY (preventivo_id) REFERENCES preventivi(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================
-- COMMENTI
-- =====================
CREATE TABLE IF NOT EXISTS commenti (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('preventivo', 'categoria', 'generale') NOT NULL,
  riferimento_id INT DEFAULT NULL,
  utente_id INT NOT NULL,
  testo TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utente_id) REFERENCES utenti(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================
-- GRUPPI INVITI
-- =====================
CREATE TABLE IF NOT EXISTS gruppi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inviti (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(32) NOT NULL UNIQUE,
  nome_gruppo VARCHAR(255) NOT NULL,
  gruppo_id INT DEFAULT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token (token),
  FOREIGN KEY (gruppo_id) REFERENCES gruppi(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invitati (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invito_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  genere CHAR(1) DEFAULT 'M',
  confermato TINYINT DEFAULT NULL,
  confirmed_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (invito_id) REFERENCES inviti(id) ON DELETE CASCADE,
  INDEX idx_invito (invito_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS foto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  nome_autore VARCHAR(255) DEFAULT NULL,
  commento TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_uploaded (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
