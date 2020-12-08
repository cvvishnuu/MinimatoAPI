

/*----------------------------Canteen---------------------------------*/

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

CREATE TABLE canteenImages (
    imageID BIGSERIAL NOT NULL PRIMARY KEY,
    canteen_id INT,
    imageURL VARCHAR(100) UNIQUE,
    FOREIGN KEY (canteen_id) REFERENCES canteen(canteen_id)
);

CREATE TABLE starters(
    food_name VARCHAR(50) NOT NULL UNIQUE,
    price VARCHAR(50) NOT NULL,
    canteen_id INT,
    status VARCHAR(6) NOT NULL,
    FOREIGN KEY (canteen_id) REFERENCES canteen(canteen_id)
);

CREATE TABLE deserts(
    food_name VARCHAR(50) NOT NULL UNIQUE,
    price VARCHAR(50) NOT NULL,vvc
    canteen_id INT,
    status VARCHAR(6) NOT NULL,
    FOREIGN KEY (canteen_id) REFERENCES canteen(canteen_id)
);

CREATE TABLE maincourse(
    food_name VARCHAR(50) NOT NULL UNIQUE,
    price VARCHAR(50) NOT NULL,
    canteen_id INT,
    status VARCHAR(6) NOT NULL,
    FOREIGN KEY (canteen_id) REFERENCES canteen(canteen_id)
);

CREATE TABLE drinks(
    food_name VARCHAR(50) NOT NULL UNIQUE,
    price VARCHAR(50) NOT NULL,
    canteen_id INT,
    status VARCHAR(6) NOT NULL,
    FOREIGN KEY (canteen_id) REFERENCES canteen(canteen_id)
);

/*----------------------------students---------------------------------*/
CREATE TABLE student (
    client_id BIGSERIAL NOT NULL PRIMARY KEY,
    client_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    phone_no VARCHAR(15) NOT NULL UNIQUE,
    gender  VARCHAR (10) ,
    address VARCHAR(100),
    password VARCHAR(100) NOT NULL 
);


CREATE TABLE images (
    image_id BIGSERIAL NOT NULL PRIMARY KEY,
    image_name VARCHAR(150) NOT NULL,
    image BYTEA NOT NULL,
    client_id INT,
    FOREIGN KEY (client_id) REFERENCES student(client_id)
);


