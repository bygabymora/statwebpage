import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
      name: 'Admin User',
      email: 'admin1@statsurgicalsupply.com',
      password: bcrypt.hashSync('Statsurgicalsupply1*'),
      isAdmin: true,
    },
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
      name: 'Medtronic name 1',
      manufacturer: 'MEDTRONIC',
      slug: 'MEDTRONIC7510400',
      lot: 'WE1',
      expiration: '2022-01-01',
      image: '/images/7510400-WE1.png',
      reference: '7510400',
      description: 'Bone Graft Kit, Medium Size',
      price: 4240,
      size: 'Medium',
      countInStock: 10,
      notes: 'notes',
      includes:
        '2) Vials of Sterile rhBMP-2 (4.2 mg), (1) Package of 4 Sterile Absorbable Collagen Sponges (ACS) 1 x 2 in., (2) Vials of Sterile Water for Injection (5 mL), (4) Sterile 5 mL Syringes with 20G 1.5 in. Needle',
    },
    {
      name: 'Medtronic 7510200',
      manufacturer: 'MEDTRONIC',
      slug: 'MEDTRONIC7510200',
      lot: 'WE1',
      expiration: '2022-01-01',
      image: '/images/7510200-WE1.png',
      reference: '7510200',
      description: 'Bone Graft Kit, Small Size',
      price: 3044,
      size: 'Small',
      countInStock: 10,
      notes: 'notes',
      includes:
        '(1) Vial of Sterile rhBMP-2 (4.2 mg), (1) Package of 2 Sterile Absorbable Collagen Sponge (ACS) 1 x 2 in., (1) Vial of Sterile Water for Injection (5 mL), (2) Sterile 5 mL Syringes with 20G 1.5 in. Needle',
    },

    {
      name: 'Medtronic2',
      manufacturer: 'MEDTRONIC',
      slug: 'MEDTRONIC7510600',
      lot: 'WE1',
      expiration: '2022-01-01',
      image: '/images/7510600-WE1.png',
      reference: '7510600',
      description: 'Bone Graft Kit, Large Size',
      price: 4500,
      size: 'Large',
      countInStock: 10,
      notes: 'notes',
      includes:
        '(1) Vial of Sterile rhBMP-2 (12 mg), (1) Package of 6 Sterile Absorbable Collagen Sponge (ACS) 1 x 2 in., (1) Vial of Sterile Water for Injection (10 mL), (2) Sterile 10 mL Syringes with 20G 1.5 in. Needle',
    },

    {
      name: 'Medtronic 7510800',
      manufacturer: 'COVIDIEN ENERGY',
      slug: 'COVIDIENENERGYLF1837',
      lot: 'WE1',
      expiration: '2022-01-01',
      image: '/images/LF1837-WE1.png',
      reference: 'LF1837',
      description:
        'Sealer/Divider, 5 mm dia. x 37 cm Shaft Length, 17.8 mm Cut Length, 19.5 mm Seal Length, Blunt, Double-action Jaw Style, 180° Shaft Rotation, Sterile, Single-Use, For Compatible with ForceTriad SW v3.6 or Higher',
      price: 750,
      size: '5 mm dia. x 37 cm',
      countInStock: 10,
      notes: 'notes',
      includes: '1) Sealer/Divider',
    },

    {
      name: 'Medtronic 7510800',
      manufacturer: 'STRYKER',
      slug: 'STRYKER5820-107-530C',
      lot: 'WE1',
      expiration: '2022-01-01',
      image: '/images/5820-107-530C-WE1.png',
      reference: '5820-107-530C',
      description: 'Head Drill, 3 x 3.8 mm, Neuro Carbide',
      price: 75,
      size: '3 x 3.8 mm',
      countInStock: 10,
      notes: 'notes',
      includes: '1) Sealer/Divider',
    },
  ],
};

export default data;
