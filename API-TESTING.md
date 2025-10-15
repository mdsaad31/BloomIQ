# BloomIQ API Testing with Postman

## Import Collection

You can test the BloomIQ API using Postman. Here are the main endpoints:

### Base URL
```
http://localhost:5000/api
```

## Endpoints

### 1. Health Check
```
GET /health
```

### 2. Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "region": "California",
  "language": "en"
}
```

### 3. Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response will include a `token` - use this for authenticated requests.

### 4. Get Current User
```
GET /auth/me
Authorization: Bearer <your-token>
```

### 5. Analyze Crop
```
POST /analysis/analyze
Authorization: Bearer <your-token>
Content-Type: multipart/form-data

Form Data:
- image: (select file)
```

### 6. Get Analysis Stats
```
GET /analysis/stats
Authorization: Bearer <your-token>
```

### 7. Get Weather
```
GET /weather/current?city=California
Authorization: Bearer <your-token>
```

### 8. Get All Reports
```
GET /reports?limit=10&offset=0
Authorization: Bearer <your-token>
```

### 9. Get Report by ID
```
GET /reports/:reportId
Authorization: Bearer <your-token>
```

### 10. Get Profile
```
GET /profile
Authorization: Bearer <your-token>
```

### 11. Update Profile
```
PUT /profile
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "name": "John Updated",
  "region": "New York",
  "language": "es"
}
```

## Testing Python Service

### Health Check
```
GET http://localhost:8000/health
```

### Predict
```
POST http://localhost:8000/predict
Content-Type: multipart/form-data

Form Data:
- file: (select image file)
```

### Models Info
```
GET http://localhost:8000/models/info
```

## Sample Test Flow

1. Register a new user
2. Login and save the token
3. Get user profile
4. Upload a crop image for analysis
5. View the analysis report
6. Check weather data
7. Get all historical reports

## Tips

- Save the auth token in Postman environment variable
- Use the token in all authenticated requests
- Test with different image types
- Check error responses for validation

---

**Postman Collection:** You can create a Postman collection from these endpoints for easy testing.
