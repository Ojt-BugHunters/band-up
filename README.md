# band-up

## How to run Frontend by using docker:
### Step 1:
```
docker pull ghcr.io/ojt-bughunters/band-up/frontend:v1.0.0
```
Or using the latest version of frontend in **Package** tab in this repo

### Step 2:
```
docker run -d -p 3000:3000 ghcr.io/ojt-bughunters/band-up/frontend:v1.0.0
```
Or replace the version in this command by version downloaded in **Package**

### OR

Run with our backend server: 
- Create a new file .env.local with the contain: API_URL=https://bandupdb.bughunters.site/api
- cd to the directory that contain .env.local file
- Run the command:
```
sudo docker run -d --name bandup-fe -p 3000:3000 \ 
  --env-file .env.local \
  ghcr.io/ojt-bughunters/band-up/frontend:v112

```
### Step 3:
Visit http://localhost:3000 and enjoy
All the routes is in the **/frontend/src/app**

