const { Client } = require('pg');

// Try connecting without password first (if allowed)
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '', // Try empty password
  database: 'postgres'
});

client.connect()
  .then(() => {
    console.log('Connected with empty password!');
    return client.query("ALTER USER postgres WITH PASSWORD 'newpassword123'");
  })
  .then(() => {
    console.log('? Password changed successfully!');
    console.log('New password: newpassword123');
    client.end();
  })
  .catch(err => {
    console.log('Trying with default password "postgres"...');
    const client2 = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'postgres'
    });
    return client2.connect()
      .then(() => {
        console.log('Connected with password "postgres"!');
        return client2.query("ALTER USER postgres WITH PASSWORD 'newpassword123'");
      })
      .then(() => {
        console.log('? Password changed successfully!');
        console.log('New password: newpassword123');
        client2.end();
      })
      .catch(err2 => {
        console.error('? Could not connect with any password');
        console.error('Try connecting with your password manager or reset PostgreSQL password');
      });
  });
