import CustomError from '~/utils/customError';

export const basicAuth = async (req, res, next) => {
  // -----------------------------------------------------------------------
  // authentication middleware

  try {
    const auth = { login: process.env.BASIC_USERNAME, password: process.env.BASIC_PASSWORD }; // change this

    // parse login and password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    // Verify login and password are set and correct
    if (login && password && login === auth.login && password === auth.password) {
      // Access granted...
      return next();
    }

    // Access denied...
    res.set('WWW-Authenticate', 'Basic realm="401"'); // change this
    res.status(401).json({ status: 'fail', message: 'Authentication required' }); // custom message
  } catch (e) {
    console.log(e);
    return next(new CustomError('Terjadi kesalahan pada otorisasi', 404));
  }

  // -----------------------------------------------------------------------
};
