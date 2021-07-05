require("dotenv").config();

module.exports = [
    {
        "email": "user1@gmail.com",
        "password": "1",
        "name": "hs1",
        "phone": "0866633805",
        "status": "inactive",
        "avatar": `${ process.env.NODE_ENV !== 'production' ? process.env.HOST_DOMAIN_DEV : process.env.DOMAIN}/public/images/logo.png`,
        "role": "user",
        "createdAt": "2020-08-04T03:09:36.947Z",
        "updatedAt": "2020-08-04T03:09:36.947Z",
    },
    {
        "email": "user2@gmail.com",
        "password": "1",
        "name": "hs2",
        "phone": "0866633805",
        "status": "inactive",
        "avatar": `${ process.env.NODE_ENV !== 'production' ? process.env.HOST_DOMAIN_DEV : process.env.DOMAIN}/public/images/logo.png`,
        "role": "user",
        "createdAt": "2020-08-04T03:09:36.947Z",
        "updatedAt": "2020-08-04T03:09:36.947Z",
    },
    {
        "email": "user3@gmail.com",
        "password": "1",
        "name": "hs3",
        "phone": "0866633805",
        "status": "inactive",
        "avatar": `${ process.env.NODE_ENV !== 'production' ? process.env.HOST_DOMAIN_DEV : process.env.DOMAIN}/public/images/logo.png`,
        "role": "user",
        "createdAt": "2020-08-04T03:09:36.947Z",
        "updatedAt": "2020-08-04T03:09:36.947Z",
    },
    {
        "email": "teacher1@gmail.com",
        "password": "1",
        "name": "teacher 1",
        "phone": "0866633805",
        "status": "active",
        "avatar": `${ process.env.NODE_ENV !== 'production' ? process.env.HOST_DOMAIN_DEV : process.env.DOMAIN}/public/images/logo.png`,
        "role": "teacher",
        "createdAt": "2020-08-04T03:09:36.947Z",
        "updatedAt": "2020-08-04T03:09:36.947Z",
    },
    {
        "email": "teacher2@gmail.com",
        "password": "1",
        "name": "teacher 2",
        "phone": "0866633805",
        "status": "active",
        "avatar": `${ process.env.NODE_ENV !== 'production' ? process.env.HOST_DOMAIN_DEV : process.env.DOMAIN}/public/images/logo.png`,
        "role": "teacher",
        "createdAt": "2020-08-04T03:09:36.947Z",
        "updatedAt": "2020-08-04T03:09:36.947Z",
    },
    {
        "email": "admin@gmail.com",
        "password": "1",
        "name": "Admin",
        "phone": "0866633805",
        "status": "active",
        "avatar": `${ process.env.NODE_ENV !== 'production' ? process.env.HOST_DOMAIN_DEV : process.env.DOMAIN}/public/images/logo.png`,
        "role": "admin",
        "createdAt": "2020-08-04T03:09:36.947Z",
        "updatedAt": "2020-08-04T03:09:36.947Z",
    }
]