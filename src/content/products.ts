import { Product, ProductCategory } from '@/types';

export const products: Product[] = [
  {
    slug: 'duplex-board',
    i18nKey: 'products.duplexBoard',
    category: 'board',
    specTable: [
      { labelKey: 'specs.gsmRange', value: '230–450 gsm' },
      { labelKey: 'specs.grades', value: 'GC1, GC2, GD2' },
      { labelKey: 'specs.backColor', value: 'Grey / White', valueKey: 'specValues.backColor.greyWhite' },
      { labelKey: 'specs.reelWidth', value: '600–2800 mm' },
      { labelKey: 'specs.coreSize', value: '76mm / 100mm' },
    ],
    applications: [
      'products.duplexBoard.apps.fmcg',
      'products.duplexBoard.apps.cosmetics',
      'products.duplexBoard.apps.pharma',
      'products.duplexBoard.apps.electronics',
    ],
    origins: ['Turkey', 'India', 'China', 'EU'],
    typicalIndustries: [
      'products.duplexBoard.industries.packaging',
      'products.duplexBoard.industries.printing',
      'products.duplexBoard.industries.converting',
    ],
  },
  {
    slug: 'testliner-fluting',
    i18nKey: 'products.testlinerFluting',
    category: 'containerboard',
    specTable: [
      { labelKey: 'specs.gsmRange', value: '100–200 gsm' },
      { labelKey: 'specs.grades', value: 'TL1, TL2, TL3, Fluting', valueKey: 'specValues.grades.testlinerFluting' },
      { labelKey: 'specs.recycledContent', value: '60–100%' },
      { labelKey: 'specs.reelWidth', value: '800–2800 mm' },
      { labelKey: 'specs.coreSize', value: '76mm' },
    ],
    applications: [
      'products.testlinerFluting.apps.ecommerce',
      'products.testlinerFluting.apps.shipping',
      'products.testlinerFluting.apps.industrial',
      'products.testlinerFluting.apps.agriculture',
    ],
    origins: ['Turkey', 'EU', 'Egypt'],
    typicalIndustries: [
      'products.testlinerFluting.industries.boxPlants',
      'products.testlinerFluting.industries.corrugated',
      'products.testlinerFluting.industries.converters',
    ],
  },
  {
    slug: 'kraftliner-white-top',
    i18nKey: 'products.kraftlinerWhiteTop',
    category: 'containerboard',
    specTable: [
      { labelKey: 'specs.gsmRange', value: '125–300 gsm' },
      { labelKey: 'specs.type', value: 'Virgin Fiber', valueKey: 'specValues.type.virginFiber' },
      { labelKey: 'specs.burstIndex', value: '3.5–5.5 kPa·m²/g' },
      { labelKey: 'specs.reelWidth', value: '1000–2800 mm' },
      { labelKey: 'specs.coreSize', value: '76mm / 100mm' },
    ],
    applications: [
      'products.kraftlinerWhiteTop.apps.heavy',
      'products.kraftlinerWhiteTop.apps.export',
      'products.kraftlinerWhiteTop.apps.premium',
      'products.kraftlinerWhiteTop.apps.frozen',
    ],
    origins: ['EU', 'Russia', 'Brazil', 'Nordic'],
    typicalIndustries: [
      'products.kraftlinerWhiteTop.industries.corrugated',
      'products.kraftlinerWhiteTop.industries.export',
      'products.kraftlinerWhiteTop.industries.food',
    ],
  },
  {
    slug: 'triplex-board',
    i18nKey: 'products.triplexBoard',
    category: 'board',
    specTable: [
      { labelKey: 'specs.gsmRange', value: '230–450 gsm' },
      { labelKey: 'specs.coating', value: 'Double Coated', valueKey: 'specValues.coating.doubleCoated' },
      { labelKey: 'specs.brightness', value: '80–90% ISO' },
      { labelKey: 'specs.reelWidth', value: '600–2400 mm' },
      { labelKey: 'specs.coreSize', value: '76mm / 100mm' },
    ],
    applications: [
      'products.triplexBoard.apps.fmcg',
      'products.triplexBoard.apps.pharma',
      'products.triplexBoard.apps.cosmetics',
      'products.triplexBoard.apps.confectionery',
    ],
    origins: ['Turkey', 'China', 'India', 'EU'],
    typicalIndustries: [
      'products.triplexBoard.industries.packaging',
      'products.triplexBoard.industries.printing',
      'products.triplexBoard.industries.luxury',
    ],
  },
  {
    slug: 'paper-cones-tubes',
    i18nKey: 'products.paperConesTubes',
    category: 'converted',
    specTable: [
      { labelKey: 'specs.productTypes', value: 'Cones, spool tubes, specialty cones', valueKey: 'specValues.productTypes.paperConesTubes' },
      { labelKey: 'specs.dimensions', value: 'Custom lengths and diameters', valueKey: 'specValues.dimensions.custom' },
      { labelKey: 'specs.surfaceOptions', value: 'Natural, colored, velvet/flocked', valueKey: 'specValues.surfaceOptions.cones' },
      { labelKey: 'specs.printOptions', value: 'Printed patterns, codes, branding', valueKey: 'specValues.printOptions.cones' },
      { labelKey: 'specs.applications', value: 'Textile yarn, paper, foil', valueKey: 'specValues.applications.cones' },
    ],
    applications: [
      'products.paperConesTubes.apps.textileYarn',
      'products.paperConesTubes.apps.paperFoil',
      'products.paperConesTubes.apps.technicalTextiles',
      'products.paperConesTubes.apps.brandedCones',
    ],
    origins: ['Turkey', 'EU'],
    typicalIndustries: [
      'products.paperConesTubes.industries.textileMills',
      'products.paperConesTubes.industries.yarnProducers',
      'products.paperConesTubes.industries.converters',
    ],
    heroImage: {
      src: '/images/products/paper-cones-tubes/product-family-cover.jpeg',
      altKey: 'products.paperConesTubes.gallery.cover.alt',
      captionKey: 'products.paperConesTubes.gallery.cover.caption',
    },
    images: [
      {
        src: '/images/products/paper-cones-tubes/product-family-cover.jpeg',
        altKey: 'products.paperConesTubes.gallery.cover.alt',
        captionKey: 'products.paperConesTubes.gallery.cover.caption',
      },
      {
        src: '/images/products/paper-cones-tubes/product-flyer.jpeg',
        altKey: 'products.paperConesTubes.gallery.flyer.alt',
        captionKey: 'products.paperConesTubes.gallery.flyer.caption',
      },
      {
        src: '/images/products/paper-cones-tubes/sample-measurements-1.jpeg',
        altKey: 'products.paperConesTubes.gallery.measurements.alt',
        captionKey: 'products.paperConesTubes.gallery.measurements.caption',
      },
      {
        src: '/images/products/paper-cones-tubes/sample-measurements-2.jpeg',
        altKey: 'products.paperConesTubes.gallery.measurementsDetail.alt',
        captionKey: 'products.paperConesTubes.gallery.measurementsDetail.caption',
      },
      {
        src: '/images/products/paper-cones-tubes/sample-color-rings.jpeg',
        altKey: 'products.paperConesTubes.gallery.colorRings.alt',
        captionKey: 'products.paperConesTubes.gallery.colorRings.caption',
      },
      {
        src: '/images/products/paper-cones-tubes/flocked-tip-colors.jpeg',
        altKey: 'products.paperConesTubes.gallery.flockedColors.alt',
        captionKey: 'products.paperConesTubes.gallery.flockedColors.caption',
      },
      {
        src: '/images/products/paper-cones-tubes/flocked-pattern-catalog.jpeg',
        altKey: 'products.paperConesTubes.gallery.patternCatalog.alt',
        captionKey: 'products.paperConesTubes.gallery.patternCatalog.caption',
      },
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter(p => p.category === category);
}
