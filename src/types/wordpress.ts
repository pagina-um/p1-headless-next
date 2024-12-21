// Base interfaces for common patterns
export interface WPRenderedContent {
  rendered: string;
  protected?: boolean;
}

export interface WPLink {
  href: string;
  embeddable?: boolean;
  templated?: boolean;
  targetHints?: {
    allow: string[];
  };
}

export interface WPLinks {
  self: WPLink[];
  collection: WPLink[];
  about: WPLink[];
  replies?: WPLink[];
  "version-history"?: Array<WPLink & { count: number }>;
  "predecessor-version"?: Array<WPLink & { id: number }>;
  curies: Array<{
    name: string;
    href: string;
    templated: boolean;
  }>;
}

// Media related interfaces
export interface WPMediaSize {
  file: string;
  width: number;
  height: number;
  filesize: number;
  mime_type: string;
  source_url: string;
}

export interface WPMediaSizes {
  medium: WPMediaSize;
  large: WPMediaSize;
  thumbnail: WPMediaSize;
  medium_large: WPMediaSize;
  full: WPMediaSize;
  [key: string]: WPMediaSize;
}

export interface WPMediaDetails {
  width: number;
  height: number;
  file: string;
  filesize: number;
  sizes: WPMediaSizes;
  image_meta: {
    aperture: string;
    credit: string;
    camera: string;
    caption: string;
    created_timestamp: string;
    copyright: string;
    focal_length: string;
    iso: string;
    shutter_speed: string;
    title: string;
    orientation: string;
    keywords: string[];
  };
}

export interface WPMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: WPRenderedContent;
  author: number;
  caption: WPRenderedContent;
  alt_text: string;
  media_type: string;
  mime_type: string;
  media_details: WPMediaDetails;
  source_url: string;
  _links: WPLinks;
}

// Author related interfaces
export interface WPAuthor {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: {
    [size: string]: string;
  };
  _links: WPLinks;
}

// Meta interface
export interface WPMeta {
  _seopress_robots_primary_cat: string;
  _seopress_titles_title: string;
  _seopress_titles_desc: string;
  _seopress_robots_index: string;
  footnotes: string;
  [key: string]: string;
}

// Main post interface
export interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: WPRenderedContent;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: WPRenderedContent;
  content: WPRenderedContent;
  excerpt: WPRenderedContent;
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: WPMeta;
  categories: number[];
  tags: number[];
  class_list: string[];
  _links: WPLinks;
  _embedded?: {
    author?: WPAuthor[];
    "wp:featuredmedia"?: WPMedia[];
  };
}

export interface WPPostById {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: {
    _seopress_robots_primary_cat: string;
    _seopress_titles_title: string;
    _seopress_titles_desc: string;
    _seopress_robots_index: string;
    footnotes: string;
    [key: string]: string; // For any additional meta fields
  };
  categories: number[];
  tags: number[];
  class_list: string[];
  _links: {
    self: Array<{
      href?: string;
      [key: string]: any;
    }>;
    collection: Array<any>;
    about: Array<any>;
    author: Array<any>;
    replies: Array<any>;
    "version-history": Array<any>;
    "predecessor-version": Array<any>;
    "wp:featuredmedia": Array<any>;
    "wp:attachment": Array<any>;
    "wp:term": Array<any>;
    curies: Array<any>;
    [key: string]: Array<any>;
  };
}

// Category interface
export interface WPCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
  meta: any[];
  _links: WPLinks;
}
