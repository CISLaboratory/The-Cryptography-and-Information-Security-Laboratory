export const SITE_BASE_URL = 'https://cislaboratory.github.io/The-Cryptography-and-Information-Security-Laboratory';

export const LAB_ORGANIZATION = {
  '@type': 'ResearchOrganization',
  '@id': `${SITE_BASE_URL}/#organization`,
  name: 'The Cryptography and Information Security Laboratory',
  alternateName: 'CIS-Lab',
  url: `${SITE_BASE_URL}/`,
  email: 'hailun.yan@ucas.ac.cn',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '19 (A) Yuquan Road',
    addressLocality: 'Beijing',
    addressRegion: 'Beijing',
    addressCountry: 'CN'
  },
  parentOrganization: {
    '@type': 'Organization',
    name: 'School of Cryptology, University of Chinese Academy of Sciences',
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: 'University of Chinese Academy of Sciences',
      alternateName: 'UCAS',
      url: 'https://english.ucas.ac.cn/'
    }
  }
};

export function toSiteUrl(path = '') {
  return new URL(path, `${SITE_BASE_URL}/`).href;
}

export function setCanonicalUrl(url) {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}

export function setMetaName(name, content) {
  if (!content) return;
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

export function setMetaProperty(property, content) {
  if (!content) return;
  let element = document.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function setStructuredData(value) {
  let script = document.getElementById('structured-data');
  if (!script) {
    script = document.createElement('script');
    script.id = 'structured-data';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(value);
}
