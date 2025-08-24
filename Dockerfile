# Use the Official Python Docker Image
FROM python:3.9-slim

# Set the Working Directory
WORKDIR /app

# Copy the Requirements File
COPY ./app/requirements.txt ./requirements.txt

# Install the Dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Application Code
COPY ./app /app

# Expose the Application Port
EXPOSE 5000

# Start the Application
CMD ["python", "app.py"]
