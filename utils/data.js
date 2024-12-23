import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
      name: 'Admin User',
      email: 'admin@statsurgicalsupply.com',
      password: bcrypt.hashSync('Statsurgicalsupply1*'),
      isAdmin: true,
    },
    {
      name: 'Sebastian',
      email: 'admin@surgicalsc.com',
      password: bcrypt.hashSync('Statsurgicalsupply1*'),
      isAdmin: false,
    },
  ],
  products: [
    {
      _id: {
        $oid: '64de93a1a53a8127eebbab03',
      },
      name: '72203521',
      manufacturer: 'SMITH NEPHEW',
      slug: '72203521',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description:
        'Dyonics Full Radius Platinum Blade, Yellow Latch, 4.5 mm Size',
      descriptionBulk: 'sample description box',
      price: 43,
      priceBulk: 0,
      countInStock: 5,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:39:45.864Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:43:51.116Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de93b1a53a8127eebbab11',
      },
      name: 'AR-2922D-24-3',
      manufacturer: 'ARTHREX',
      slug: 'AR-2922D-24-3',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description: 'Drill for 2.4 mm PushLock Anchor, Hard Bone, Sterile',
      descriptionBulk: 'sample description box',
      price: 98,
      priceBulk: 0,
      countInStock: 4,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:40:01.369Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:39:27.205Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de93eba53a8127eebbab1f',
      },
      name: 'AR-1934-24DS',
      manufacturer: 'ARTHREX',
      slug: 'AR-1934-24DS',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description:
        'Disposables Kit, 2.4 mm Bio-SutureTak (includes: Step Drill and Spear with Trocar)',
      descriptionBulk: 'sample description box',
      price: 99,
      priceBulk: 0,
      countInStock: 2,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:40:59.974Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:39:43.921Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de942aa53a8127eebbab2d',
      },
      name: 'AR-2922BC',
      manufacturer: 'ARTHREX',
      slug: 'AR-2922BC',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description: 'sample description',
      descriptionBulk:
        'BioComposite PushLock Anchor, 2.4 mm x 11.3 mm (box of 5)',
      price: 0,
      priceBulk: 198,
      countInStock: 0,
      countInStockBulk: 1,
      sentOverNight: true,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:42:02.789Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:40:17.802Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de94aea53a8127eebbab45',
      },
      name: 'AR-8400DC',
      manufacturer: 'ARTHREX',
      slug: 'AR-8400DC',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description: 'Doublecut, 4.0 mm x 13 cm',
      descriptionBulk: 'sample description box',
      price: 24,
      priceBulk: 0,
      countInStock: 1,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:44:14.867Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:40:37.555Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de94f6a53a8127eebbab5d',
      },
      name: '912057',
      manufacturer: 'BIOMET',
      slug: '912057',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description: 'Juggerknot Disposable Kit 2.9 mm ',
      descriptionBulk: 'sample description box',
      price: 199,
      priceBulk: 0,
      countInStock: 2,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:45:26.164Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:40:55.150Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de9525a53a8127eebbab6b',
      },
      name: '912029',
      manufacturer: 'BIOMET',
      slug: '912029',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description: 'sample description',
      descriptionBulk: 'sample description box',
      price: 199,
      priceBulk: 0,
      countInStock: 2,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:46:13.161Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:41:08.231Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de9551a53a8127eebbab79',
      },
      name: '912031',
      manufacturer: 'BIOMET',
      slug: '912031',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description:
        'Juggerknot Single Loaded Anchor Size 2 Blue/white Maxbraid, 1.5mm',
      descriptionBulk: 'sample description box',
      price: 0,
      priceBulk: 199,
      countInStock: 1,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:46:57.988Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:41:24.550Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de9586a53a8127eebbab87',
      },
      name: '480440',
      manufacturer: 'INTUITIVE',
      slug: '480440',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description: 'Synchroseal Single Use Instrument, 8mm',
      descriptionBulk: 'sample description box',
      price: 399,
      priceBulk: 0,
      countInStock: 3,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:47:50.449Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:41:39.432Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de95b2a53a8127eebbab95',
      },
      name: '222002',
      manufacturer: 'DEPUY',
      slug: '222002',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description:
        'Soft Anchor, 4.5 mm Size, Biocryl Rapide BioComposite, Blue, White/Blue/Green Striped, White/Black Striped Suture, 3 Suture, #2 Suture Size, With Dynacord Suture',
      descriptionBulk: 'sample description box',
      price: 249,
      priceBulk: 0,
      countInStock: 4,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:48:34.394Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:42:12.551Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de95f1a53a8127eebbaba3',
      },
      name: '228147',
      manufacturer: 'DEPUY',
      slug: '228147',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description:
        'Vapr Coolpulse 90 Electrode With Hand Controls, 90 Degree Suction With Integrated Handpiece',
      descriptionBulk: 'sample description box',
      price: 229,
      priceBulk: 0,
      countInStock: 1,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:49:37.437Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:42:32.579Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de9625a53a8127eebbabb1',
      },
      name: '72205110',
      manufacturer: 'SMITH NEPHEW',
      slug: '72205110',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description:
        'Arthroscopic Surgery Blade 4.5mm Curved Synovator Concave Blade, Platinum Series (Green/gray)',
      descriptionBulk: 'sample description box',
      price: 24,
      priceBulk: 0,
      countInStock: 9,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:50:29.262Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:42:48.399Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de9659a53a8127eebbabbf',
      },
      name: '7205668',
      manufacturer: 'SMITH NEPHEW',
      slug: '7205668',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description:
        'Dyonics Wide Mouth Straight Acromioblaster Burr, 4 mm dia., Sage Green Latch',
      descriptionBulk: 'sample description box',
      price: 43,
      priceBulk: 0,
      countInStock: 1,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:51:21.582Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:43:19.843Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de9708a53a8127eebbabfb',
      },
      name: '72205292',
      manufacturer: 'SMITH NEPHEW',
      slug: '72205292',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description:
        'Arthroscopic Surgery Blade Flyer Blade, Platinum Series, 4.0mm (Red)',
      descriptionBulk: 'sample description box',
      price: 39,
      priceBulk: 0,
      countInStock: 3,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:54:16.305Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:44:09.920Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de973ca53a8127eebbac09',
      },
      name: '7205311',
      manufacturer: 'SMITH NEPHEW',
      slug: '7205311',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description: 'Dyonics Synovator Straight Blade, 5.5 mm dia.',
      descriptionBulk: 'sample description box',
      price: 30,
      priceBulk: 0,
      countInStock: 7,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:55:08.996Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:44:33.019Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de9772a53a8127eebbac17',
      },
      name: '72205109',
      manufacturer: 'SMITH NEPHEW',
      slug: '72205109',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description:
        ' Dyonics Arthroscopic Surgery Blade 4.5mm Curved Incisor Plus Concave Blade, Platinum Series (Blue/gray)',
      descriptionBulk: 'sample description box',
      price: 43,
      priceBulk: 0,
      countInStock: 6,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:56:02.377Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:45:03.320Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de9798a53a8127eebbac25',
      },
      name: '4449',
      manufacturer: 'SMITH NEPHEW',
      slug: '4449',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description:
        'Retrograde Knife, Blue, Sterile, For Smith & Nephew ECTRA II Ligament Release System',
      descriptionBulk: 'sample description box',
      price: 44,
      priceBulk: 0,
      countInStock: 5,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:56:40.662Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:45:22.609Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de97c1a53a8127eebbac33',
      },
      name: 'UPP-210HD',
      manufacturer: 'SONY',
      slug: 'UPP-210HD',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description: 'sample description',
      descriptionBulk: 'High-Density Black & White Media',
      price: 0,
      priceBulk: 199,
      countInStock: 0,
      countInStockBulk: 1,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:57:21.954Z',
      },
      updatedAt: {
        $date: '2023-08-17T23:35:48.512Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de97f5a53a8127eebbac41',
      },
      name: 'LF-0031',
      manufacturer: 'SAFESTEP',
      slug: 'LF-0031',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description: 'sample description',
      descriptionBulk: 'Huber Needle Set',
      price: 0,
      priceBulk: 150,
      countInStock: 0,
      countInStockBulk: 1,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:58:13.579Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:46:45.839Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de9828a53a8127eebbac4f',
      },
      name: '231057G',
      manufacturer: 'ARGON',
      slug: '231057G',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description: 'sample description',
      descriptionBulk: 'HOMER BLN 20GA X 7.5CM',
      price: 0,
      priceBulk: 200,
      countInStock: 0,
      countInStockBulk: 1,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T21:59:04.548Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:46:17.405Z',
      },
      __v: 0,
    },
    {
      _id: {
        $oid: '64de9862a53a8127eebbac5d',
      },
      name: '8925',
      manufacturer: 'EZEM',
      slug: '8925',
      lot: 'sample lot',
      expiration: 'sample expiration',
      image:
        'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
      reference: 'sample reference',
      description: 'Super XL Enema System',
      descriptionBulk: 'sample description box',
      price: 24,
      priceBulk: 0,
      countInStock: 4,
      countInStockBulk: 0,
      sentOverNight: false,
      notes: 'sample notes',
      includes: 'sample includes',
      createdAt: {
        $date: '2023-08-17T22:00:02.112Z',
      },
      updatedAt: {
        $date: '2023-08-18T13:47:03.329Z',
      },
      __v: 0,
    },
  ],
};

export default data;
