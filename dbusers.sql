DROP TABLE IF EXISTS users;

-- ALTER TABLE glyph DROP INDEX idx_user_id, DROP COLUMN user_id;
-- ALTER TABLE glyphoutline DROP INDEX idx_user_id, DROP COLUMN user_id;
-- ALTER TABLE glyphparam DROP INDEX idx_user_id, DROP COLUMN user_id;
-- ALTER TABLE groupparam DROP INDEX idx_user_id, DROP COLUMN user_id;
-- ALTER TABLE master DROP INDEX idx_user_id, DROP COLUMN user_id;
-- ALTER TABLE globalparam DROP INDEX idx_user_id, DROP COLUMN user_id;
-- ALTER TABLE localparam DROP INDEX idx_user_id, DROP COLUMN user_id;

ALTER TABLE glyph ADD COLUMN user_id INT(11) NOT NULL, ADD INDEX idx_user_id (user_id);
ALTER TABLE glyphoutline ADD COLUMN user_id INT(11) NOT NULL, ADD INDEX idx_user_id (user_id);
ALTER TABLE glyphparam ADD COLUMN user_id INT(11) NOT NULL, ADD INDEX idx_user_id (user_id);
ALTER TABLE groupparam ADD COLUMN user_id INT(11) NOT NULL, ADD INDEX idx_user_id (user_id);
ALTER TABLE master ADD COLUMN user_id INT(11) NOT NULL, ADD INDEX idx_user_id (user_id);
ALTER TABLE globalparam ADD COLUMN user_id INT(11) NOT NULL, ADD INDEX idx_user_id (user_id);
ALTER TABLE localparam ADD COLUMN user_id INT(11) NOT NULL, ADD INDEX idx_user_id (user_id);

ALTER TABLE glyphoutline DROP PRIMARY KEY, ADD PRIMARY KEY (idmaster, id, glyphName, user_id);
ALTER TABLE glyphparam DROP PRIMARY KEY, ADD PRIMARY KEY (idmaster, id, glyphName, user_id);
ALTER TABLE groupparam DROP PRIMARY KEY, ADD PRIMARY KEY (idmaster, groupname, user_id);

CREATE TABLE users (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username varchar(80) NOT NULL,
    password varchar(128) NOT NULL,
    email varchar(100) NOT NULL,
    is_admin tinyint(1) NOT NULL DEFAULT 0,
    date_joined datetime NOT NULL DEFAULT NOW(),
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


UPDATE glyph SET user_id = 1;
UPDATE glyphoutline SET user_id = 1;
UPDATE glyphparam SET user_id = 1;
UPDATE groupparam SET user_id = 1;
UPDATE master SET user_id = 1;
UPDATE globalparam SET user_id = 1;
UPDATE localparam SET user_id = 1;