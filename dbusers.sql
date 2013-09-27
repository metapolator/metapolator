DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username varchar(80) NOT NULL,
    password varchar(128) NOT NULL,
    email varchar(100) NOT NULL,
    is_admin tinyint(1) NOT NULL DEFAULT 0,
    date_joined datetime NOT NULL,
    INDEX idx_username (username),
    INDEX idx_email (email)
);


INSERT INTO users
    SET username='guest1',
        password='$2a$12$sZKe4qnuECXbACZcbZeJpuB3HmIxWooFsdXP3Y.nO8Qgz5wuhONsq',
        email='guest1@example.com';


INSERT INTO users
    SET username='guest2',
        password='$2a$12$sZKe4qnuECXbACZcbZeJpuB3HmIxWooFsdXP3Y.nO8Qgz5wuhONsq',
        email='guest2@example.com';
