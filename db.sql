CREATE TABLE canteen (
    canteen_id BIGSERIAL NOT NULL PRIMARY KEY,
    canteen_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    phone_no VARCHAR(15) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    address VARCHAR(100),
    profile_name VARCHAR(50),
    current_status VARCHAR(10)
);