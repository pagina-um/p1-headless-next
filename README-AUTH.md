# GraphQL Authentication Setup

This document describes the authentication setup for WPGraphQL requests in the p1-headless-next application.

## Overview

The application implements a two-layer authentication system to secure WP GraphQL endpoint access:

1. **API Key Authentication**: All GraphQL requests include an API key header to identify the Next.js application
2. **Basic Authentication**: Admin operations additionally use Basic Auth credentials

## Environment Variables

Add these environment variables to your `.env.local` or deployment environment:

```bash
# WordPress GraphQL endpoint
NEXT_PUBLIC_WP_URL=https://your-wordpress-site.com/

# GraphQL API Key for authenticating Next.js app requests
WP_GRAPHQL_API_KEY=your_secure_api_key

# Admin credentials for admin operations
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_admin_password
```

## Authentication Layers

### 1. Public GraphQL Requests

All public GraphQL requests (posts, categories, etc.) include the API key header:

```
X-WP-GraphQL-API-Key: your_secure_api_key
```

This ensures only your Next.js application can access the GraphQL endpoint.

### 2. Admin GraphQL Requests

Admin operations include both the API key and Basic Auth:

```
X-WP-GraphQL-API-Key: your_secure_api_key
Authorization: Basic <base64_encoded_credentials>
```

## Client Configuration

The application provides two GraphQL client factories:

- `makeClient()`: For public queries with API key authentication
- `makeAdminClient()`: For admin queries with API key + Basic Auth

## WordPress Configuration

On your WordPress site, you'll need to configure the GraphQL endpoint to:

1. **Validate the API key**: Check for the `X-WP-GraphQL-API-Key` header and reject requests without it
2. **Support Basic Auth**: Allow authenticated admin operations when valid credentials are provided

### Example WP Plugin for API Key Validation

```php
<?php
// Add to your theme's functions.php or a custom plugin

add_action('graphql_before_execute', function($query, $variables, $context) {
    $api_key = $_SERVER['HTTP_X_WP_GRAPHQL_API_KEY'] ?? null;
    $expected_key = get_option('wp_graphql_api_key'); // Store this in WP admin
    
    if (!$api_key || $api_key !== $expected_key) {
        throw new Exception('Unauthorized: Invalid API key');
    }
}, 10, 3);
?>
```

## Security Benefits

1. **Application-only access**: The API key ensures only your Next.js app can access GraphQL
2. **Admin protection**: Basic Auth protects admin operations
3. **Environment isolation**: Different keys for development/staging/production
4. **Header-based**: More secure than URL parameters or body-embedded auth

## Development

In development mode, the application includes configuration validation that will warn about missing environment variables in the console.