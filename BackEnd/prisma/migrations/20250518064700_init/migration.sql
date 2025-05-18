-- CreateTable
CREATE TABLE `Boat` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `cabin_count` INTEGER NOT NULL,
    `feature_photo` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cabin` (
    `id` VARCHAR(191) NOT NULL,
    `boat_id` VARCHAR(191) NOT NULL,
    `cabin_number` VARCHAR(191) NOT NULL,
    `cabin_type` VARCHAR(191) NOT NULL,
    `bed_count` INTEGER NOT NULL,
    `bed_numbers` VARCHAR(191) NOT NULL,
    `deck` VARCHAR(191) NOT NULL,
    `deck_name` VARCHAR(191) NULL,
    `base_price` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trip` (
    `id` VARCHAR(191) NOT NULL,
    `boat_id` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `location_from` VARCHAR(191) NOT NULL,
    `location_to` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `price` DOUBLE NOT NULL,
    `available_spots` INTEGER NOT NULL,
    `booked_spots` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CabinBooking` (
    `id` VARCHAR(191) NOT NULL,
    `trip_id` VARCHAR(191) NOT NULL,
    `cabin_id` VARCHAR(191) NOT NULL,
    `bed_number` INTEGER NOT NULL,
    `booked_at` DATETIME(3) NULL,
    `price` DOUBLE NOT NULL,
    `status` VARCHAR(191) NULL,
    `passenger_gender` VARCHAR(191) NULL,
    `cancel_date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingClientDetails` (
    `id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NOT NULL,
    `trip_id` VARCHAR(191) NOT NULL,
    `cabin_number` VARCHAR(191) NOT NULL,
    `bed_number` INTEGER NOT NULL,
    `name` VARCHAR(191) NULL,
    `surname` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `nationality` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `group_name` VARCHAR(191) NULL,
    `single_use` BOOLEAN NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingClientInfo` (
    `id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NOT NULL,
    `trip_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `surname` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `postal_code` VARCHAR(191) NULL,
    `date_of_birth` DATETIME(3) NULL,
    `emergency_contact_name` VARCHAR(191) NULL,
    `emergency_contact_phone` VARCHAR(191) NULL,
    `dietary_restrictions` VARCHAR(191) NULL,
    `diving_level` VARCHAR(191) NULL,
    `diving_license_type` VARCHAR(191) NULL,
    `document_uploaded` BOOLEAN NULL,
    `food_remarks` VARCHAR(191) NULL,
    `special_needs` VARCHAR(191) NULL,
    `visa_number` VARCHAR(191) NULL,
    `visa_issue_date` DATETIME(3) NULL,
    `group_name` VARCHAR(191) NULL,
    `cabin` VARCHAR(191) NULL,
    `bed_number` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingTravelInfo` (
    `id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NOT NULL,
    `trip_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `surname` VARCHAR(191) NULL,
    `arrival_airport` VARCHAR(191) NULL,
    `arrival_flight_number` VARCHAR(191) NULL,
    `arrival_date` DATETIME(3) NULL,
    `arrival_time` VARCHAR(191) NULL,
    `arrival_hotel` VARCHAR(191) NULL,
    `arrival_notes` VARCHAR(191) NULL,
    `departure_airport` VARCHAR(191) NULL,
    `departure_flight_number` VARCHAR(191) NULL,
    `departure_date` DATETIME(3) NULL,
    `departure_time` VARCHAR(191) NULL,
    `night_hotel` VARCHAR(191) NULL,
    `night_hotel_departure` VARCHAR(191) NULL,
    `day_use_hotel` VARCHAR(191) NULL,
    `day_use_hotel_departure` VARCHAR(191) NULL,
    `transfer_needed` BOOLEAN NULL,
    `transfer_details` VARCHAR(191) NULL,
    `transfer_airport_to_boat` VARCHAR(191) NULL,
    `transfer_hotel_to_boat` VARCHAR(191) NULL,
    `transfer_boat_to_airport` VARCHAR(191) NULL,
    `transfer_boat_to_hotel` VARCHAR(191) NULL,
    `transfer_boat_to_hotel_departure` VARCHAR(191) NULL,
    `transfer_hotel_to_airport` VARCHAR(191) NULL,
    `bed_number` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingTourismServices` (
    `id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NOT NULL,
    `trip_id` VARCHAR(191) NOT NULL,
    `service_name` VARCHAR(191) NOT NULL,
    `service_type` VARCHAR(191) NOT NULL,
    `service_date` DATETIME(3) NULL,
    `price_per_unit` DOUBLE NOT NULL,
    `quantity` INTEGER NULL,
    `total_price` DOUBLE NOT NULL,
    `notes` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `bed_number` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingRentals` (
    `id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NOT NULL,
    `trip_id` VARCHAR(191) NOT NULL,
    `equipment_type` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NULL,
    `size` VARCHAR(191) NULL,
    `price_per_unit` DOUBLE NOT NULL,
    `quantity` INTEGER NULL,
    `rent_period_days` INTEGER NULL,
    `total_price` DOUBLE NOT NULL,
    `notes` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `bed_number` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profile` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NULL,
    `last_name` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `company` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `Profile_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cabin` ADD CONSTRAINT `Cabin_boat_id_fkey` FOREIGN KEY (`boat_id`) REFERENCES `Boat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trip` ADD CONSTRAINT `Trip_boat_id_fkey` FOREIGN KEY (`boat_id`) REFERENCES `Boat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CabinBooking` ADD CONSTRAINT `CabinBooking_trip_id_fkey` FOREIGN KEY (`trip_id`) REFERENCES `Trip`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CabinBooking` ADD CONSTRAINT `CabinBooking_cabin_id_fkey` FOREIGN KEY (`cabin_id`) REFERENCES `Cabin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingClientDetails` ADD CONSTRAINT `BookingClientDetails_trip_id_fkey` FOREIGN KEY (`trip_id`) REFERENCES `Trip`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingClientInfo` ADD CONSTRAINT `BookingClientInfo_trip_id_fkey` FOREIGN KEY (`trip_id`) REFERENCES `Trip`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingTravelInfo` ADD CONSTRAINT `BookingTravelInfo_trip_id_fkey` FOREIGN KEY (`trip_id`) REFERENCES `Trip`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingTourismServices` ADD CONSTRAINT `BookingTourismServices_trip_id_fkey` FOREIGN KEY (`trip_id`) REFERENCES `Trip`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingRentals` ADD CONSTRAINT `BookingRentals_trip_id_fkey` FOREIGN KEY (`trip_id`) REFERENCES `Trip`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
