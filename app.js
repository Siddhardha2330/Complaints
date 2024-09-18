const express = require('express');
const connectDB = require('./db'); 
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session'); 
const User = require('./models/User'); 
const Complaint = require('./models/Complaint');
const Like = require('./models/Like');

const app = express();
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); 

app.use(session({
  secret: 'your_secret_key', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

connectDB();


app.use(express.static('views'));


app.get("/login",(req,res)=>{
  res.render('login',{error:""});
});

app.get("/signup",(req,res)=>{
  res.render('signup',{error:""});
});
app.get("/signup",(req,res)=>{
  res.render('signup',{error:""});
});

app.post('/signup', async (req, res) => {
  const { username, email, password,branch,regno } = req.body;

  try {
   
    let user = await User.findOne({ email });
    if (user) {
      return res.render('signup', { error: 'Email already exists' });
    }

   
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    user = new User({
      username,
      email,
      password: hashedPassword,
      branch,regno
    });

    await user.save();
    res.redirect('/login'); 
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { error: 'User does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid credentials' });
    }

    req.session.user = {
      _id: user._id, 
      username: user.username,
      email: user.email,
      branch: user.branch,
      regno: user.regno
    };
    
    res.redirect('/dashboard'); 
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/dashboard', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const branch = req.query.branch || '';
  const query = branch ? { branch } : {};

  try {
    const complaints = await Complaint.find(query);
    const likedComplaints = await Like.find({ userid: req.session.user._id }).select('complaintid');
console.log(branch);
    res.render('dashboard', {
      complaints,
      branch,
      likedComplaints: likedComplaints.map(like => like.complaintid.toString()),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});



app.get('/add-complaint', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); 
  }

  
  const userInfo = req.session.user;
  res.render('complaint', { userInfo });
});


app.post('/add-complaint', async (req, res) => {
  const { username, email, branch, regno, complaint } = req.body;

  try {
    const newComplaint = new Complaint({
      username,
      email,
      branch,
      regno,
      complaint,
    });

    await newComplaint.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/complaint/:id/like', async (req, res) => {
  if (!req.session.user) {
    return res.status(403).json({ error: 'Not authenticated' });
  }

  const complaintId = req.params.id;

  try {
    const existingLike = await Like.findOne({ userid: req.session.user._id, complaintid: complaintId });

    if (existingLike) {
      return res.status(400).json({ error: 'You have already liked this complaint' });
    }

    const newLike = new Like({
      userid: req.session.user._id,
      complaintid: complaintId,
    });

    await newLike.save();

    const complaint = await Complaint.findById(complaintId);
    complaint.likes = (complaint.likes || 0) + 1;
    await complaint.save();

    res.json({ likes: complaint.likes });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/complaint/:id', async (req, res) => {
  const complaintId = req.params.id;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).send('Complaint not found');
    }

    res.render('viewComplaint', { complaint });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/logout', (req, res) => {
 
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Failed to log out');
    }
   
    res.redirect('/login');
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
