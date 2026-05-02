CREATE TABLE IF NOT EXISTS `USER` (
  `User_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `User_FName` VARCHAR(100) NOT NULL,
  `User_LName` VARCHAR(100) NOT NULL,
  `User_Email` VARCHAR(255) NOT NULL UNIQUE,
  `User_Password` VARCHAR(255) NOT NULL,
  `User_PhoneNum` VARCHAR(30),
  `User_Address` VARCHAR(500),
  `User_Role` ENUM('CUSTOMER', 'STORE_OWNER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `User_CreatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `STORE` (
  `Store_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Store_Name` VARCHAR(150) NOT NULL,
  `Store_City` VARCHAR(100) NOT NULL,
  `Store_Loc` VARCHAR(255) NOT NULL,
  `Store_ContactNum` VARCHAR(30) NOT NULL,
  `Store_OwnerID` INT NOT NULL,
  `Store_Status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
  INDEX `idx_store_owner` (`Store_OwnerID`),
  CONSTRAINT `fk_store_owner`
    FOREIGN KEY (`Store_OwnerID`) REFERENCES `USER` (`User_ID`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `PRODUCT` (
  `Prod_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Prod_StoreID` INT NOT NULL,
  `Prod_Name` VARCHAR(150) NOT NULL,
  `Prod_Price` DECIMAL(10, 2) NOT NULL CHECK (`Prod_Price` >= 0),
  `Prod_Stock` INT NOT NULL DEFAULT 0 CHECK (`Prod_Stock` >= 0),
  `Prod_ImageURL` VARCHAR(1000),
  INDEX `idx_product_store` (`Prod_StoreID`),
  CONSTRAINT `fk_product_store`
    FOREIGN KEY (`Prod_StoreID`) REFERENCES `STORE` (`Store_ID`)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `SHOPPER` (
  `Shopr_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Shopr_FName` VARCHAR(100) NOT NULL,
  `Shopr_LName` VARCHAR(100) NOT NULL,
  `Shopr_PhoneNum` VARCHAR(30) NOT NULL,
  `Shopr_Status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ORDER` (
  `Order_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Order_UserID` INT NOT NULL,
  `Order_StoreID` INT NOT NULL,
  `Order_ShoprID` INT NULL,
  `Order_OrderDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Order_Total` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `Order_Status` ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `Order_PaymentStatus` ENUM('PENDING', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  `Order_DeliveryAddress` VARCHAR(500) NOT NULL,
  INDEX `idx_order_user` (`Order_UserID`),
  INDEX `idx_order_store` (`Order_StoreID`),
  INDEX `idx_order_shopper` (`Order_ShoprID`),
  CONSTRAINT `fk_order_user`
    FOREIGN KEY (`Order_UserID`) REFERENCES `USER` (`User_ID`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT `fk_order_store`
    FOREIGN KEY (`Order_StoreID`) REFERENCES `STORE` (`Store_ID`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT `fk_order_shopper`
    FOREIGN KEY (`Order_ShoprID`) REFERENCES `SHOPPER` (`Shopr_ID`)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ORDER_ITEM` (
  `OItem_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `OItem_OrderID` INT NOT NULL,
  `OItem_ProdID` INT NOT NULL,
  `OItem_Quantity` INT NOT NULL CHECK (`OItem_Quantity` > 0),
  `OItem_SubTotal` DECIMAL(10, 2) NOT NULL CHECK (`OItem_SubTotal` >= 0),
  INDEX `idx_order_item_order` (`OItem_OrderID`),
  INDEX `idx_order_item_product` (`OItem_ProdID`),
  CONSTRAINT `fk_order_item_order`
    FOREIGN KEY (`OItem_OrderID`) REFERENCES `ORDER` (`Order_ID`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT `fk_order_item_product`
    FOREIGN KEY (`OItem_ProdID`) REFERENCES `PRODUCT` (`Prod_ID`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `DELIVERY` (
  `Dlvery_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Dlvery_OrderID` INT NOT NULL,
  `Dlvery_RiderName` VARCHAR(150) NOT NULL,
  `Dlvery_Distance` DECIMAL(8, 2) NOT NULL CHECK (`Dlvery_Distance` >= 0),
  `Dlvery_Status` ENUM('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED') NOT NULL DEFAULT 'ASSIGNED',
  `Dlvery_DeliveryFee` DECIMAL(10, 2) NOT NULL CHECK (`Dlvery_DeliveryFee` >= 0),
  INDEX `idx_delivery_order` (`Dlvery_OrderID`),
  CONSTRAINT `fk_delivery_order`
    FOREIGN KEY (`Dlvery_OrderID`) REFERENCES `ORDER` (`Order_ID`)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
