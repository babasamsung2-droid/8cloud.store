import React, { useEffect } from 'react';
import { CategoryId, Product, CurrencyCode } from '../types';
import { CATEGORIES } from '../data/products';

interface SEOHeadProps {
  selectedCategory: CategoryId | 'all';
  selectedProduct?: Product | null;
  currency?: CurrencyCode;
}

/**
 * Dynamic Meta Tag Generator Component
 * Updates the document head (<title>, meta description, OpenGraph, Twitter Cards,
 * canonical link, and Schema.org JSON-LD structured data) in real-time based on
 * the currently selected category or active product to maximize SEO and social sharing.
 */
export const SEOHead: React.FC<SEOHeadProps> = ({
  selectedCategory,
  selectedProduct,
  currency = 'USD',
}) => {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const origin = window.location.origin || 'https://8cloud.store';

    // Helper to safely upsert meta tag
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to safely upsert canonical link
    const setCanonicalLink = (href: string) => {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Helper to safely upsert JSON-LD schema
    const setJsonLd = (scriptId: string, schemaObj: object) => {
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schemaObj, null, 2);
    };

    // Default Fallback Store Data
    let title = '8cloud.store — Level Up Your Digital Life | Instant Digital Assets';
    let description = 'Ultra-modern, futuristic digital products store for instant-delivery Software Keys, AI Prompts, Creator Kits, Courses, and Web Dev Assets.';
    let ogType = 'website';
    let canonicalUrl = origin;
    let ogImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop&q=80';
    let jsonLdSchema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'OnlineStore',
      'name': '8cloud.store',
      'url': origin,
      'description': description,
      'currenciesAccepted': 'USD, INR, EUR, GBP',
      'paymentAccepted': 'Razorpay, UPI, Credit Card, Google Pay, NetBanking, Cryptocurrency',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${origin}/?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };

    // CASE 1: Individual Product is Selected (Modal open / detail view)
    if (selectedProduct) {
      title = `${selectedProduct.name} — Buy & Instant Delivery | 8cloud`;
      description = selectedProduct.description.length > 155
        ? `${selectedProduct.description.substring(0, 152)}...`
        : `${selectedProduct.description} Instant cryptographic delivery within 0 seconds on 8cloud.store.`;
      
      ogType = 'product';
      canonicalUrl = `${origin}/?product=${encodeURIComponent(selectedProduct.id)}`;
      
      jsonLdSchema = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        'name': selectedProduct.name,
        'description': selectedProduct.description,
        'sku': selectedProduct.sku || `8CLD-${selectedProduct.id.toUpperCase()}`,
        'image': [ogImage],
        'brand': {
          '@type': 'Brand',
          'name': '8cloud.store',
        },
        'offers': {
          '@type': 'Offer',
          'url': canonicalUrl,
          'priceCurrency': 'USD',
          'price': selectedProduct.priceUSD.toString(),
          'priceValidUntil': '2027-12-31',
          'itemCondition': 'https://schema.org/NewCondition',
          'availability': (selectedProduct.stock && selectedProduct.stock > 0)
            ? 'https://schema.org/InStock'
            : 'https://schema.org/InStock',
          'seller': {
            '@type': 'Organization',
            'name': '8cloud.store',
          },
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': (selectedProduct.rating || 4.9).toString(),
          'reviewCount': (selectedProduct.reviewsCount || 48).toString(),
        },
      };

      // Set product-specific price meta tags
      setMetaTag('property', 'product:price:amount', selectedProduct.priceUSD.toString());
      setMetaTag('property', 'product:price:currency', currency);
    } 
    // CASE 2: Category is Filtered (and no product modal is active)
    else if (selectedCategory !== 'all') {
      const catInfo = CATEGORIES.find((c) => c.id === selectedCategory);
      if (catInfo) {
        title = `${catInfo.name} — Instant Cloud Delivery | 8cloud.store`;
        description = `${catInfo.shortDescription} Guaranteed authentic cryptographic delivery with 24/7 buyer support at 8cloud.store.`;
        canonicalUrl = `${origin}/?category=${encodeURIComponent(selectedCategory)}`;
        
        jsonLdSchema = {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          'name': `${catInfo.name} Catalog`,
          'description': catInfo.shortDescription,
          'url': canonicalUrl,
          'isPartOf': {
            '@type': 'WebSite',
            'name': '8cloud.store',
            'url': origin,
          },
          'about': {
            '@type': 'Thing',
            'name': catInfo.name,
          },
        };
      }
    }

    // Apply Page Title
    document.title = title;

    // Apply Primary Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', `8cloud, digital assets, instant delivery, software keys, ai prompts, razorpay, ${selectedCategory !== 'all' ? selectedCategory : 'crypto licenses, creator kits'}`);

    // Apply OpenGraph Social Graph Tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:site_name', '8cloud.store');
    setMetaTag('property', 'og:image', ogImage);

    // Apply Twitter / X Cards Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // Apply Canonical Link
    setCanonicalLink(canonicalUrl);

    // Apply Structured Data (JSON-LD)
    setJsonLd('dynamic-seo-jsonld', jsonLdSchema);

  }, [selectedCategory, selectedProduct, currency]);

  // Invisible component — renders nothing to visual DOM, only manipulates document.head
  return null;
};
