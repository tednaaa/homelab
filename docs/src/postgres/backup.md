```fish
docker exec -t container_name pg_dump -U postgres database_name | gzip > /tmp/dump.sql.gz
```

```fish
scp user@your-server-ip:/tmp/dump.sql.gz ~/Downloads/
```

```fish
docker cp ~/Downloads/dump.sql.gz container_name:/tmp/
docker exec -it container_name bash -c "gunzip < /tmp/dump.sql.gz | psql -U postgres database_name"
```
