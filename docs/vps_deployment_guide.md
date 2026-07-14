# Production VPS Deployment Guide - Docker Compose

Follow this step-by-step guide to deploy your **MeetingFlow** application stack live on a Virtual Private Server (VPS) such as DigitalOcean, AWS EC2, or Google Cloud Platform (GCP).

---

## Step 1: Server Setup (Ubuntu 22.04 LTS recommended)

After spinning up your VPS, connect to it via SSH from your computer:
```bash
ssh username@your_server_public_ip
```

### 1. Update Packages
Run updates to ensure the latest dependencies are installed:
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker & Docker Compose
Install the Docker container runtime and compose engine:
```bash
sudo apt install -y docker.io docker-compose
```

Verify that the Docker service is running:
```bash
sudo systemctl status docker
```
*(Press `q` to exit the status view. If it is inactive, start it with `sudo systemctl enable --now docker`)*.

---

## Step 2: Transfer Project Files to the Server

You can move your project files to the VPS in one of two ways:

### Option A: Clone from GitHub (Recommended)
1. Initialize a Git repository in `D:\Projects\MeetingFlow` if you haven't already, commit the code, and push it to a private/public GitHub repository.
2. On your VPS, clone the repo:
   ```bash
   git clone https://github.com/yourusername/MeetingFlow.git
   cd MeetingFlow
   ```

### Option B: Copy Directly via SCP (Secure Copy Protocol)
Run this command from your **local Windows PowerShell terminal** (not the VPS) to upload the project files:
```powershell
scp -r D:\Projects\MeetingFlow username@your_server_public_ip:/home/username/
```
Then, on your VPS, navigate to the folder:
```bash
cd /home/username/MeetingFlow
```

---

## Step 3: Configure Environment Variables

For a public production server, you should update credentials inside `docker-compose.yml` to secure your database.
1. Open the file on your server:
   ```bash
   nano docker-compose.yml
   ```
2. Modify the **MySQL Database Password** under both `db` and `backend` services. Replace `root` with a strong password:
   ```yaml
   # Under db:
   MYSQL_ROOT_PASSWORD: your_strong_secure_password
   
   # Under backend:
   - SPRING_DATASOURCE_PASSWORD=your_strong_secure_password
   ```
3. Press `Ctrl+O` and `Enter` to save, and `Ctrl+X` to exit nano.

---

## Step 4: Open Firewall Ports

Ensure your cloud provider's firewall (AWS Security Groups, Google Cloud Firewalls, or DigitalOcean Cloud Firewalls) permits inbound traffic on these ports:
* **`22`** (SSH Access)
* **`80`** (HTTP - public web traffic to the React frontend)
* **`8080`** (Optional: only if you want direct access to the Spring Boot REST API from the outside. For security, Nginx proxies this internally, so you do not need to open port 8080 publicly).

---

## Step 5: Start the Container Stack

In the root directory of the project on your VPS, run:
```bash
sudo docker-compose up --build -d
```

### Checking Deployment Status:
* **List Running Containers**:
  ```bash
  sudo docker ps
  ```
* **View Backend Application Logs**:
  ```bash
  sudo docker logs -f meetingflow_backend
  ```
* **View Database Setup Logs**:
  ```bash
  sudo docker logs -f meetingflow_db
  ```

---

## Step 6: Access Your Live Application

Open a browser and navigate to:
```text
http://your_server_public_ip
```
The React frontend (served via Nginx) will load, and Nginx will handle all background API requests securely.

---

## Step 7: (Optional) Set up SSL/HTTPS with Let's Encrypt

To secure your deployment with `https://`:
1. Map a domain name (e.g. `meetingflow.yourdomain.com`) to your VPS public IP in your domain registrar's DNS settings.
2. Install Certbot on the server:
   ```bash
   sudo apt install certbot -y
   ```
3. Edit Nginx's proxy config on the VPS to support SSL or follow Let's Encrypt's automated Nginx cert generation.
