exports.index = function(req, res){
  res.render('main/index.ejs', { title: 'Express' });
};