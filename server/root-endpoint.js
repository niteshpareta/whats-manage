// Add a simple root endpoint
app.get('/', (req, res) => {
  res.status(200).send('Email server is running');
});
