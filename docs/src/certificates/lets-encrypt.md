# Let's Encrypt

## New IP

After pointing a domain to a new server, request a certificate only once `dig` returns the new IP. Run on the server, both must print the same IP:

```fish
curl -4 ifconfig.me
dig +short A <domain> @8.8.8.8
```

> until then Let's Encrypt may still validate the old IP and fail with `Timeout during connect`

> [!WARNING]
> don't retry in a loop - 5 failed validations per domain per hour, then it blocks for an hour
