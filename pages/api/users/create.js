import database from '../../../services/database';
import User from '../../../models/User';
import { requireAuth } from '@clerk/nextjs/api';

/* * */
/* CREATE NEW USER */
/* Explanation needed. */
/* * */

export default requireAuth(async (req, res) => {
  //

  // 0. Refuse request if not POST
  if (req.method != 'POST') {
    await res.setHeader('Allow', ['POST']);
    await res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    return;
  }

  // 1. Try to save a new document with req.body
  try {
    req.body = await JSON.parse(req.body);
  } catch (err) {
    console.log(err);
    await res.status(500).json({ message: 'JSON parse error.' });
    return;
  }

  // 2. Try to connect to the database
  try {
    await database.connect();
  } catch (err) {
    console.log(err);
    await res.status(500).json({ message: 'Database connection error.' });
    return;
  }

  // 3. Check for uniqueness
  try {
    // The values that need to be unique are ['pwd'].
    // Reasons: The User only needs to input the password when logging into the POS,
    // otherwise the system will choose one of the duplicates at random.
    if (req.body.pwd) {
      const existsPwd = await User.exists({ pwd: req.body.pwd });
      if (existsPwd) throw new Error('Já existe um colaborador com a mesma password.');
    }
  } catch (err) {
    console.log(err);
    await res.status(409).json({ message: err.message });
    return;
  }

  // 4. Try to save a new document with req.body
  try {
    const newUser = await User(req.body).save();
    await res.status(201).json(newUser);
    return;
  } catch (err) {
    console.log(err);
    await res.status(500).json({ message: 'User creation error.' });
    return;
  }
});
