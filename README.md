# Food Sustainabilty Dashboard

Before running (in either dev or prod mode) you need to add an `application.yml` file into
the `backend` folder. The contents of which should look like

```
elastic:
  endpoint: http://elasticserver:9931
  index: index-pattern
```

where the two values are configured correctly to give access to the required index.

## Development

During development the app is run as two separate pieces. The backend is started using

```
cd backend
mvn spring-boot:run
```

This starts the server on `http://localhost:9000`

The frontend is then started using

```
cd frontend
npm start
```

Which runs the webapp on `http://localhost:3000`. The backend server is specified in `package.json` using
the 'proxy' field. This ensures that paths not part of the frontend (notably `/process`) are passed to the
backend.

Both the frontend and backend automatically reload on code changes.

## Production

To build the production version into a Docker image run

```
docker build -t alpro-dashboard:latest .
```

Once completed you can then run this with the command

```
docker run -p 9000:9000 -d --restart always alpro-dashboard:latest
```

This starts a single server on `http://localhost:9000`. In theory this can then be run behind a proxy putting
the app at any context path. This works as the `homepage` field in `package.json` is set to `.` meaning requests
within the app are relative to the folder in which it is accessed rather than all being directed to the root (i.e. `/`).

## Known Issues

- when running in production `manifest.json` can't be loaded by the web app due to a 401 error. This looks
like a CORS issue but not sure why yet
