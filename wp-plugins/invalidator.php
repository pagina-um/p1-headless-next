<?php
/*
Plugin Name: Next.js Cache Invalidator
Description: Invalidates Next.js cache when WordPress posts are created or updated
Version: 1.0
Author: Your Name
*/

// Prevent direct access to this file
if (!defined('ABSPATH')) {
    exit;
}

// Add menu page for plugin settings
function nextjs_invalidator_menu()
{
    add_options_page(
        'Next.js Invalidator Settings',
        'Next.js Invalidator',
        'manage_options',
        'nextjs-invalidator',
        'nextjs_invalidator_settings_page'
    );
}
add_action('admin_menu', 'nextjs_invalidator_menu');

// Create the settings page
function nextjs_invalidator_settings_page()
{
    ?>
    <div class="wrap">
        <h2>Next.js Invalidator Settings</h2>
        <form method="post" action="options.php">
            <?php
            settings_fields('nextjs-invalidator-settings');
            do_settings_sections('nextjs-invalidator-settings');
            ?>
            <table class="form-table">
                <tr>
                    <th scope="row">Invalidation Endpoint URL</th>
                    <td>
                        <input type="url" name="nextjs_invalidation_url"
                            value="<?php echo esc_attr(get_option('nextjs_invalidation_url')); ?>" class="regular-text">
                        <p class="description">Enter your Next.js revalidation endpoint URL (e.g.,
                            https://yoursite.com/api/revalidate)</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Revalidation Token</th>
                    <td>
                        <input type="password" name="nextjs_invalidation_token"
                            value="<?php echo esc_attr(get_option('nextjs_invalidation_token')); ?>" class="regular-text">
                        <p class="description">Enter the secret token that matches your Next.js REVALIDATION_SECRET
                            environment variable</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// Register plugin settings
function nextjs_invalidator_register_settings()
{
    register_setting('nextjs-invalidator-settings', 'nextjs_invalidation_url', array(
        'type' => 'string',
        'sanitize_callback' => 'esc_url_raw',
        'default' => ''
    ));

    register_setting('nextjs-invalidator-settings', 'nextjs_invalidation_token', array(
        'type' => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default' => ''
    ));
}
add_action('admin_init', 'nextjs_invalidator_register_settings');

// Function to send invalidation request
function send_invalidation_request($post_id)
{
    // Get the invalidation URL from settings
    $invalidation_url = get_option('nextjs_invalidation_url');

    // Check if URL is set
    if (empty($invalidation_url)) {
        return;
    }

    // Get post data
    $post = get_post($post_id);

    // Get the full permalink structure
    $permalink = str_replace(home_url(), '', get_permalink($post_id));
    // Remove leading/trailing slashes
    $permalink = trim($permalink, '/');

    // Prepare the request data
    $data = array(
        'post_id' => $post_id,
        'post_type' => $post->post_type,
        'post_slug' => $permalink,
        'timestamp' => current_time('timestamp')
    );

    // Get the revalidation token
    $token = get_option('nextjs_invalidation_token');

    // Send POST request to Next.js invalidation endpoint
    $response = wp_remote_post($invalidation_url, array(
        'headers' => array(
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $token,
        ),
        'body' => json_encode($data),
        'timeout' => 30
    ));

    // Log errors if any
    if (is_wp_error($response)) {
        error_log('Next.js invalidation request failed: ' . $response->get_error_message());
    }
}

// Hook into post save/update actions
add_action('save_post', function ($post_id) {
    // Don't trigger on autosaves
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    // Don't trigger for revisions
    if (wp_is_post_revision($post_id)) {
        return;
    }

    // Only trigger for public post types
    $post_type = get_post_type($post_id);
    if (!is_post_type_viewable($post_type)) {
        return;
    }

    send_invalidation_request($post_id);
}, 10, 1);