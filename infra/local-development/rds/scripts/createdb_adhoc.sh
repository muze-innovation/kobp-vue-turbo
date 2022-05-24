#!/bin/bash
# this script will be allocated in /usr/scripts inside postgres docker.
# Example usecase via docker-compose
#
# docker-compose exec -e APP_DB_NAMES=spw_products_agg rds /bin/sh -C /var/scripts/createdb_adhoc.sh
#
set -e
echo "MUST RUN WITH ROOT..."
export PGPASSWORD=$POSTGRES_PASSWORD;

export IFS=";"
for APP_DB_NAME in $APP_DB_NAMES; do
echo "Checking Database $APP_DB_NAME status.."
if psql $APP_DB_NAME -c '\q' 2>&1; then
   echo "database $APP_DB_NAME exists"
else
echo "INIT $APP_DB_NAME";
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE DATABASE $APP_DB_NAME
    WITH
      OWNER = $APP_DB_USER
      ENCODING = 'UTF8'
      LC_COLLATE = 'en_US.utf8'
      LC_CTYPE = 'en_US.utf8'
      TABLESPACE = pg_default
      CONNECTION LIMIT = -1;
  \connect $APP_DB_NAME
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $APP_DB_USER;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $APP_DB_USER;
EOSQL
fi
done