import { requireAuth } from '@clerk/nextjs/api';
import database from '../../../services/database';
import Model from '../../../models/Device';
import Schema from '../../../schemas/Device';
import generator from '../../../services/generator';

/* * */
/* CREATE DEVICE */
/* Explanation needed. */
/* * */

export default requireAuth(async (req, res) => {
  //

  // 0. Refuse request if not POST
  if (req.method != 'POST') {
    await res.setHeader('Allow', ['POST']);
    return await res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // 1. Parse request body into JSON
  try {
    req.body = JSON.parse(req.body);
  } catch (err) {
    console.log(err);
    return await res.status(500).json({ message: 'JSON parse error.' });
  }

  // 2. Validate req.body against schema
  try {
    req.body = Schema.parse(req.body);
  } catch (err) {
    console.log(err);
    return await res.status(400).json({ message: JSON.parse(err.message)[0].message });
  }

  // 3. Try to connect to the database
  try {
    await database.connect();
  } catch (err) {
    console.log(err);
    return await res.status(500).json({ message: 'Database connection error.' });
  }

  // 4. Check for uniqueness
  try {
    // The values that need to be unique are ['code'].
    // Reason: The Device Code is the device identifier.
    let deviceCodeIsNotUnique = true;
    while (deviceCodeIsNotUnique) {
      req.body.code = generator(6); // Generate a new code with 6 characters
      deviceCodeIsNotUnique = await Model.exists({ code: req.body.code });
    }
  } catch (err) {
    console.log(err);
    await res.status(409).json({ message: err.message });
    return;
  }

  // 5. Try to create the Device
  try {
    const newUser = await Model(req.body).save();
    return await res.status(201).json(newUser);
  } catch (err) {
    console.log(err);
    await res.status(500).json({ message: 'Cannot update this Device.' });
    return;
  }
});
