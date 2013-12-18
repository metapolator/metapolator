#!/bin/sh

rm -rf users
git reset --hard
git pull origin master
mysql --user=root -e 'drop database blog; create database blog;'
python metapolator/models.py
mysql --user=root -e 'insert into users set username="guest1", password="$2a$12$sPBgjGusgt71PSKMoTmMaOqakk713Ac/wTEMMeZVrUBY2rOvJwvvy", email="guest@example.com", date_joined=NOW()' blog
echo "Update complete: use parameters below to authenticate\n"
echo "Username: guest1"
echo "Password: 1"
echo ""