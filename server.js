var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var multer = require('multer');//接收图片
var fs = require('fs');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var rimraf = require('rimraf');
var mkdirp = require("mkdirp");

var sqlite3 = require('sqlite3');

var identityKey = 'skey';

var db = new sqlite3.Database('./database.db');

const defaultUsername = '';
const ip = '66.112.215.111';

async function hasUser(username, password) {
  return new Promise((resolve, reject) => {
    db.each(`SELECT count(*) AS count from user where name='${username}' and password='${password}'`, function (err, row) {
      if(row && row.count > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  })
}

async function insertUser(username, password) {
  return new Promise((resolve) => {
    db.run(`INSERT INTO user (ID, NAME, PASSWORD) VALUES ((SELECT max(Id) FROM user)+1, '${username}', '${password}')`);

    console.log(`a new user is created: username: ${username}, password: ${password}`);
    resolve(true)
  })
}

async function deleteDir(path) {
  console.log(`try to delete ${path}`)
  return new Promise((resolve, reject) => {
    if(typeof path === 'string') {
      rimraf(path, function (err) {
        if(!fs.existsSync(path)) {
          console.log(`delete success:  ${path}`)
          resolve();
        } else {
          console.log(`delete fail: ${path}`)
          reject();
        }
      })
    } else if(Array.isArray(path)) {
      let len = path.length;
      console.log(len)
      console.log(path);

      path.forEach((item) => {
        rimraf(item, function (err) {
          if(!fs.existsSync(item)) {
            console.log(`delete success:  ${item}`)
            len--;
            if(len <= 0) {
              resolve();
            }
          } else {
            console.log(`delete fail: ${item}`)
            reject();
          }
        })
      });
    }
  })
}

async function mkdirs(path) {
  return new Promise((resolve, reject) => {
    mkdirp(path, function (err) {
      if(err) {
        reject(err);
      } else {
        resolve()
      }
    })
  })
}

app.use(session({
  name: identityKey,
  secret: 'cnmmmp',  // 用来对session id相关的cookie进行签名
  store: new FileStore(),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
  saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
  resave: false,  // 是否每次都重新保存会话，建议false
  cookie: {
    maxAge: 24 * 3600 * 1000  // 有效期，单位是毫秒
  }
}));

multer({
  limits: { fieldSize: 1024 * 1024 * 1024 }
})

let upload = multer({
  dest: './uploads'
});//定义图片上传的临时目录

app.use(bodyParser({uploadDir: './uploads'}));

app.use(express.static(path.join(__dirname, './dist/')));

app.use(express.static(path.join(__dirname, './uploads/')));

app.post('/api/login', async function (req, res) {
  let username = req.body.username,
      password = req.body.password,
      sess = req.session;

  let isExist = await hasUser(username, password);

  if(isExist) {
    req.session.regenerate(function (err) {
      if(err) {
        return res.json({code: 2, data: false, msg: 'login failed'});
      }

      req.session.username = username;
      res.json({code: 1, data: true, msg: 'login success'});
    })
  } else {
    res.json({ code: 3, data: false, msg: 'username or password is not right!' });
  }
});

app.post('/api/logout', function (req, res) {
  req.session.destroy(function (err) {
    if(err) {
      res.json({ code: 2, msg: 'logout failed' });
      return;
    }

    res.clearCookie(identityKey);
    res.json({ code: 1, msg: 'logout success' });
  })
})

app.get('/api/info', function (req, res) {
  let sess = req.session,
      username = sess.username || defaultUsername,
      isLogin = !!username;

  res.json({ code: 1, data: { username, isLogin } });
})

app.post('/api/register', async function (req, res) {
  let username = req.body.username,
      password = req.body.password;

  let isExist = await hasUser(username, password);

  if(!isExist) {
    await insertUser(username, password);

    req.session.regenerate(function (err) {
      if(err) {
        return
      }

      req.session.username = username;
      res.json({code: 1, data: true, msg: 'login success'});
    })
  } else {
    res.json({
      code: 1,
      data: false,
      msg: 'the user is already exist'
    });
  }
})

app.post('/api/upload', upload.array('file', 10), async function (req, res) {
  let name = req.body.name,
      reqPath = req.body.path || '',
      file = req.body.file;

  let sess = req.session,
      username = sess.username || defaultUsername,
      isLogin = !!username;

  if(!isLogin) {
    res.json({ code: 2, msg: 'you are not login' });
    return;
  }

  let dirPath = path.resolve(__dirname, `./uploads/${username}/${reqPath}`),
      imgDir = `${dirPath}/${name}`;

  let base64Data = file.replace(/^data:image\/\w+;base64,/, "");
  let buf = new Buffer(base64Data, 'base64');

  console.log(`try to find dirPath: ${dirPath}`);
  if(!fs.existsSync(dirPath)) {
    await mkdirs(dirPath)
  }

  console.log(`try to save image to path: { ${imgDir} }`)
  fs.writeFile(imgDir, buf);

  res.json({ code: 1, msg: 'save img successfully' });
});

app.post('/api/createDir', async function (req, res) {
  let path = req.body.path || '',
      dirName = req.body.dirName || '';

  let sess = req.session,
    username = sess.username || defaultUsername,
    isLogin = !!username;

  if(!isLogin) {
    res.json({ code: 2, data: false, msg: 'you are not login' });
    return;
  }

  let resDirPath = `./uploads/${username}/${path}/${dirName}`;

  if(!fs.existsSync(resDirPath)) {
    try {
      await mkdirs(resDirPath);
      res.json({ code: 1, data: true, msg: 'create directory successfully' });
    } catch (e) {
      res.json({ code: 2, data: false, msg: e || 'create directory fail' });
    }
  } else {
    res.json({ code: 3, data: false, msg: 'the directory is already exist' });
  }
});

app.get('/api/getDir', function (req, res) {
  let reqPath = req.query.path || '';

  let sess = req.session,
    username = sess.username || defaultUsername,
    isLogin = !!username;

  if(!isLogin) {
    res.json({ code: 2, data: false, msg: 'you are not login' });
    return;
  }

  let resDirPath = path.resolve(__dirname, `./uploads/${username}/${reqPath}/`);
  console.log(resDirPath)

  fs.readdir(resDirPath, function(err, files){
    if(err) {
      res.json({ code: 2, msg: 'get files failed' });
    } else {
      files = files.map((item) => {
        if(item.indexOf('.') < 0) {
          return {
            type: 1,
            name: item
          };
        } else {
          return {
            type: 2,
            name: item,
            url: `http://${ip}:${server.address().port}/${username}/${reqPath}/${item}`
          };
        }
      });
      res.json({ code: 1, data: files });
    }
  });
});

app.post('/api/deleteDir', async function (req, res) {
  let reqPath = req.body.path || '';

  let sess = req.session,
    username = sess.username || defaultUsername,
    isLogin = !!username,
    targetPath = '';

  if (typeof reqPath === 'string') {
    targetPath = path.resolve(__dirname, `./uploads/${username}/${reqPath}`)
  } else if(Array.isArray(reqPath)) {
    targetPath = reqPath.map((item) => {
      return path.resolve(__dirname, `./uploads/${username}/${item}`)
    })
  }


  if(!isLogin) {
    res.json({ code: 2, data: false, msg: 'you are not login' });
    return;
  }
  try {
    await deleteDir(targetPath);

    res.json({ code: 1, data: true, msg: 'delete success' });
  } catch (e) {
    res.json({ code: 3, data: false, msg: 'delete fail' });
  }
})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
