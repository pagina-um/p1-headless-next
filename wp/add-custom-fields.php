<?php
/*
Plugin Name: Add Custom Fields
Description: Registers custom ACF fields with GraphQL support
Version: 1.0
Author: Your Name
*/

if (!defined('ABSPATH')) {
    exit;
}

function register_custom_acf_fields() {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group([
        'key' => 'group_6782407139b91',
        'title' => 'postFields',
        'fields' => [
            [
                'key' => 'field_67824073f100a',
                'label' => 'antetitulo',
                'name' => 'antetitulo',
                'type' => 'text',
                'instructions' => '',
                'required' => 0,
                'conditional_logic' => 0,
                'wrapper' => [
                    'width' => '',
                    'class' => '',
                    'id' => '',
                ],
                'default_value' => '',
                'maxlength' => '',
                'placeholder' => '',
                'prepend' => '',
                'append' => '',
                'show_in_graphql' => 1,
                'graphql_field_name' => 'antetitulo',
            ],
            [
                'key' => 'field_6782408cf100b',
                'label' => 'chamada-manchete',
                'name' => 'chamada_manchete',
                'type' => 'text',
                'instructions' => '',
                'required' => 0,
                'conditional_logic' => 0,
                'wrapper' => [
                    'width' => '',
                    'class' => '',
                    'id' => '',
                ],
                'default_value' => '',
                'maxlength' => 220,
                'placeholder' => '',
                'prepend' => '',
                'append' => '',
                'show_in_graphql' => 1,
                'graphql_field_name' => 'chamadaManchete',
            ],
            [
                'key' => 'field_6782409cf100c',
                'label' => 'chamada-destaque',
                'name' => 'chamada_destaque',
                'type' => 'text',
                'instructions' => '',
                'required' => 0,
                'conditional_logic' => 0,
                'wrapper' => [
                    'width' => '',
                    'class' => '',
                    'id' => '',
                ],
                'default_value' => '',
                'maxlength' => 220,
                'placeholder' => '',
                'prepend' => '',
                'append' => '',
                'show_in_graphql' => 1,
                'graphql_field_name' => 'chamadaDestaque',
            ],
        ],
        'location' => [
            [
                [
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'post',
                ],
            ],
        ],
        'menu_order' => 0,
        'position' => 'normal',
        'style' => 'default',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
        'hide_on_screen' => '',
        'active' => true,
        'description' => '',
        'show_in_graphql' => 1,
        'graphql_field_name' => 'postFields',
    ]);
}

add_action('acf/include_fields', 'register_custom_acf_fields');