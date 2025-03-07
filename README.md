# Google Sheets Proxy API

This is a simple Express-based API that fetches data from a Google Sheet in CSV
format.

## Requirements

- Node.js
- `express` and `request` modules

## Environment Variables

- `GSPROXY_PORT`: The port on which the server runs (default: `3000`).
- `GSPROXY_API_KEYS`: Comma-separated list of valid API keys.

## Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Start the server with `node server.js`.

## API Usage

### **Endpoint:**

```
GET /dl?id=<GoogleSheetID>&sheetName=<SheetName>
```

### **Headers:**

- `Authorization`: A valid API key.

### **Example Request:**

```sh
curl -H "Authorization: YOUR_API_KEY" \
     "http://localhost:3000/dl?id=YOUR_SHEET_ID&sheetName=YOUR_SHEET_NAME"
```

### **Response:**

- **200 OK**: Returns the sheet data in CSV format.
- **400 Bad Request**: Missing query parameters.
- **403 Unauthorized**: Invalid or missing API key.
- **500 Internal Server Error**: Failed to fetch data.

## License

Copyright &copy; 2021-25 Siddharth Singh, [The MIT License](./LICENSE.md).
