

/*----------------------------Canteen---------------------------------*/

CREATE TABLE canteen (
    canteen_id BIGSERIAL NOT NULL PRIMARY KEY,
    canteen_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    phone_no VARCHAR(15) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    address VARCHAR(100),
    profile_name VARCHAR(50),
    current_status VARCHAR(10),
    imageURL VARCHAR(100) UNIQUE
);



CREATE TABLE starters(
    food_name VARCHAR(50) NOT NULL UNIQUE,
    price VARCHAR(50) NOT NULL,
    imageURL VARCHAR(100) UNIQUE,
    canteen_id INT,
    status VARCHAR(6) NOT NULL,
    FOREIGN KEY (canteen_id) REFERENCES canteen(canteen_id)
);

CREATE TABLE deserts(
    food_name VARCHAR(50) NOT NULL UNIQUE,
    price VARCHAR(50) NOT NULL,
    imageURL VARCHAR(100) UNIQUE,
    canteen_id INT,
    status VARCHAR(6) NOT NULL,
    FOREIGN KEY (canteen_id) REFERENCES canteen(canteen_id)
);

CREATE TABLE maincourse(
    food_name VARCHAR(50) NOT NULL UNIQUE,
    price VARCHAR(50) NOT NULL,
    imageURL VARCHAR(100) UNIQUE,
    canteen_id INT,
    status VARCHAR(6) NOT NULL,
    FOREIGN KEY (canteen_id) REFERENCES canteen(canteen_id)
);

CREATE TABLE drinks(
    food_name VARCHAR(50) NOT NULL UNIQUE,
    price VARCHAR(50) NOT NULL,
    imageURL VARCHAR(100) UNIQUE,
    canteen_id INT,
    status VARCHAR(6) NOT NULL,
    FOREIGN KEY (canteen_id) REFERENCES canteen(canteen_id)
);

CREATE TABLE FoodImages (
    image_id BIGSERIAL NOT NULL PRIMARY KEY,
    imageurl VARCHAR(150) NOT NULL,
    can_id INT,
    FOREIGN KEY (client_id) REFERENCES student(client_id)
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
    imageurl VARCHAR(150) NOT NULL,
    client_id INT,
    FOREIGN KEY (client_id) REFERENCES student(client_id)
);


/*----------------------------Orders---------------------------------*/

CREATE TABLE scheduler (
    order_id BIGSERIAL NOT NULL PRIMARY KEY,
    canteen_id INT,
    client_id INT,
    client_name VARCHAR(50) NOT NULL,
    client_email VARCHAR(50) NOT NULL,
    client_phone_no VARCHAR(15) NOT NULL,
    orders json NOT NULL,
    status VARCHAR(50),
    FOREIGN KEY (client_id) REFERENCES student(client_id),
    FOREIGN KEY (canteen_id) REFERENCES canteen(canteen_id)
);

