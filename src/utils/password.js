const generator = require('generate-password');

exports.generatePassword = () => {
  try {
    const password = generator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
      lowercase: true,
      symbols: '@$!%*?&'
    });
    return password;
  } catch (err) {
    return err;
  }
};