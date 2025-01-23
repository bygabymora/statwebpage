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
};

export default data;
