DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username varchar(80) NOT NULL,
    password varchar(128) NOT NULL,
    email varchar(100) NOT NULL,
    is_admin tinyint(1) NOT NULL DEFAULT 0,
    INDEX idx_username (username),
    INDEX idx_email (email)
);


INSERT INTO users
    SET username='guest1',
        password='dGl1;41403470df0873202278944aa5bac987dfca4145',
        email='guest1@example.com';


INSERT INTO users
    SET username='guest2',
        password='dGl1;41403470df0873202278944aa5bac987dfca4145',
        email='guest2@example.com';
