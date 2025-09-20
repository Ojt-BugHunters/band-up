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

### Step 3:
Visit http://localhost:3000
All the routes is in the **/frontend/src/app**

