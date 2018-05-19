<template>
  <div>
    <el-container>
      <el-header class="page-header">
        <div class="main-content">
          <h3 class="main-title">Album</h3>
          <span class="username" v-if="username">Hi, <strong>{{ username }}</strong></span>
        </div>
        <div>
          <el-button type="primary" @click="loginDialogVisible = true" round>
            Login
          </el-button>
          <el-button type="primary" @click="registerDialogVisible = true" round>
            Register
          </el-button>
          <el-button type="primary" round @click="upload()">
            Upload <input type="file" id="upload" @change="change()" style="display: none;">
          </el-button>
          <el-button type="primary" round @click="returnPrev()">Return</el-button>
          <el-button type="primary" round @click="deleteMode = !deleteMode">change delete mode</el-button>
          <el-button type="primary" round @click="deletePath()">delete</el-button>
          <el-button type="primary" round @click="newFolderDialogVisible = true">New Folder</el-button>
          <el-button type="primary" round @click="logout()">Log Out</el-button>
        </div>
      </el-header>
      <el-main class="page-main">
        <div class="main-wrapper">
          <div class="folder item"
               v-for="(dir, index) in dirs"
               :key="dir.name"
               @click="clickFolder(dir)">
            <i class="folder-bk"></i>
            <el-checkbox v-if="deleteMode"
                         v-model="dir.checked"
                         class="item-text">
              {{ dir.name }}
            </el-checkbox>
            <p class="item-text"
               v-if="!deleteMode">
              {{ dir.name }}</p>
          </div>
          <div class="photo item"
               v-for="(photo, index) in photos"
               :key="photo.name"
               @click="clickPhoto(photo)">
            <img :src="photo.url"
                 :alt="photo.name"
                 :title="photo.name">
            <el-checkbox v-if="deleteMode"
                         v-model="photo.checked"
                         class="item-text">
              {{ photo.name }}
            </el-checkbox>
            <p class="item-text"
               v-if="!deleteMode">
              {{ photo.name }}</p>
          </div>
        </div>
      </el-main>
    </el-container>
    <el-dialog
      title="Register"
      :visible.sync="registerDialogVisible"
      width="50%"
      v-loading="registerDialogLoading">
      <el-input placeholder="Your Username" v-model="inputRegisterUsername" style="margin-bottom: 20px;"></el-input>
      <el-input placeholder="Your Password" v-model="inputRegisterPassword"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="registerDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="clickRegister()">Confirm</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="Register Success"
      :visible.sync="registerSuccessVisible"
      width="50%">
      <span>Welcome, <strong>{{ username }}</strong></span>
    </el-dialog>
    <el-dialog
      title="Register Fail"
      :visible.sync="registerFailVisible"
      width="50%">
      <span>{{ registerFailMsg }}</span>
    </el-dialog>
    <el-dialog
      title="Login"
      :visible.sync="loginDialogVisible"
      width="50%"
      v-loading="loginDialogLoading">
      <el-input placeholder="Your Username" v-model="inputUsername" style="margin-bottom: 20px;"></el-input>
      <el-input placeholder="Your Password" v-model="inputPassword"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="loginDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="clickLogin()">Confirm</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="Login Success"
      :visible.sync="loginSuccessVisible"
      width="50%">
      <span>Welcome back, <strong>{{ username }}</strong></span>
    </el-dialog>
    <el-dialog
      title="Login Fail"
      :visible.sync="loginFailVisible"
      width="50%">
      <span>{{ loginFailMsg }}</span>
    </el-dialog>
    <el-dialog
      title="New Folder"
      :visible.sync="newFolderDialogVisible"
      width="50%"
      v-loading="newFolderDialogLoading">
      <el-input placeholder="Folder Name" v-model="inputFolderName"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="newFolderDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="clickNewFolder()">Confirm</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="Create Success"
      :visible.sync="newFolderSuccessVisible"
      width="50%">
      <span>Create folder success!</span>
    </el-dialog>
    <el-dialog
      title="Create Fail"
      :visible.sync="newFolderFailVisible"
      width="50%">
      <span>{{ newFolderFailMsg }}</span>
    </el-dialog>
  </div>
</template>

<script>
import { Container, Header, Footer, Main, Button, ButtonGroup, Dialog, Input, Checkbox } from 'element-ui';
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      deleteMode: false,
      loginDialogVisible: false,
      loginDialogLoading: false,
      loginSuccessVisible: false,
      loginFailVisible: false,
      inputUsername: '',
      inputPassword: '',
      loginFailMsg: '',
      registerDialogVisible: false,
      registerDialogLoading: false,
      registerSuccessVisible: false,
      registerFailVisible: false,
      inputRegisterUsername: '',
      inputRegisterPassword: '',
      registerFailMsg: '',
      newFolderDialogVisible: false,
      newFolderDialogLoading: false,
      newFolderSuccessVisible: false,
      newFolderFailVisible: false,
      inputFolderName: '',
      newFolderFailMsg: ''
    }
  },
  computed: {
    ...mapGetters([
      'isLogin',
      'username',
      'dirs',
      'photos',
      'curPath'
    ])
  },
  created() {
    this.$store.dispatch('getInfo');

    this.$store.dispatch('getDir', { path: '' }).then((res)=>{
    });
  },
  components: {
    Container, Header, Footer, Main, Button, Dialog, Input, Checkbox
  },
  methods: {
    upload() {
      document.getElementById('upload').click();
    },
    change() {
      let file = document.getElementById('upload').files[0],
          _this = this;

      let param = new FormData();

      let fr= new FileReader();
      fr.onload = function () {
        param.append('name', file.name);
        param.append('path', _this.curPath || '');
        param.append('file', this.result);

        _this.$store.dispatch('uploadImg', param);
      }

      fr.readAsDataURL(file);
    },
    clickLogin() {
      this.loginDialogLoading = true;

      this.$store.dispatch('login', {
        username: this.inputUsername,
        password: this.inputPassword
      })
        .then((msg) => {
          if(this.isLogin) {
            this.loginSuccessVisible = true;
            this.loginDialogLoading = false;
            this.loginDialogVisible = false;
            this.$store.dispatch('getDir', {
              path: this.curPath
            })
          } else {
            this.loginFailVisible = true;
            this.loginDialogLoading = false;
            this.loginDialogVisible = false;
            this.loginFailMsg = `Login fail: ${msg || 'something wrong'}`;
          }
        });
    },
    clickRegister() {
      this.registerDialogLoading = true;

      this.$store.dispatch('register', {
        username: this.inputRegisterUsername,
        password: this.inputRegisterPassword
      })
        .then((msg) => {
          this.registerDialogLoading = false;
          this.registerDialogVisible = false;

          if(this.isLogin) {
            this.registerSuccessVisible = true;
            this.$store.dispatch('getDir', {
              path: this.curPath
            })
          } else {
            this.registerFailVisible = true;
            this.registerFailMsg = `Register fail: ${msg || 'something wrong'}`;
          }
        });
    },
    clickFolder(dir) {
      if(this.deleteMode) {
        console.log(dir.checked)
        dir.checked = !dir.checked;
      } else {
        this.$store.dispatch('getDir', {
          path: `${this.curPath}/${dir.name}`
        })
      }
    },
    clickPhoto(photo) {
      if(this.deleteMode) {
        photo.checked = !photo.checked;
      }
    },
    clickNewFolder() {
      this.newFolderDialogLoading = true;
      this.$store.dispatch('newFolder', {
        path: this.curPath,
        dirName: this.inputFolderName
      }).then((msg)=>{
        this.newFolderDialogLoading = false;
        this.newFolderDialogVisible = false;

        if(msg === 'success') {
          this.newFolderSuccessVisible = true;
        } else {
          this.newFolderFailVisible = true;
          this.newFolderFailMsg = `create fail: ${msg || 'something wrong'}`;
        }
      })
    },
    returnPrev() {
      if(this.curPath) {
        this.$store.dispatch('getDir', {
          path: this.curPath.substring(0, this.curPath.lastIndexOf('/'))
        });
      }
    },
    deletePath() {
      let filDirs = this.dirs.filter((item) => item.checked),
          photoDirs = this.photos.filter((item) => item.checked),
          path = [];
      filDirs.forEach((item) => {
        path.push(`${this.curPath}/${item.name}`);
      });
      photoDirs.forEach((item) => {
        path.push(`${this.curPath}/${item.name}`);
      })
      this.$store.dispatch('deletePath', {
        path
      })
    },
    logout () {
      this.$store.dispatch('logout');
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
  .page-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ddd;
  }

  .page-header .main-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .page-header .main-title {
    font-size: 30px;
    margin: 0;
    color: #409EFF;
  }

  .page-header .username {
    align-self: flex-end;
    font-size: 12px;
    margin-left: 25px;
    color: #42b983;
  }

  .page-main {

  }

  .page-main .main-wrapper {
    padding: 20px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .page-main .main-wrapper .item {
    width: 175px;
    padding: 15px;
    margin: 15px;
    max-height: 200px;
  }

  .page-main .main-wrapper .item:hover {
    cursor: pointer;
    background: #eee;
  }

  .page-main .main-wrapper .item img {
    width: 100%;
    height: 150px;
  }

  .page-main .main-wrapper .item .folder-bk {
    display: inline-block;
    width: 175px;
    height: 150px;
    background: url(../img/folder.png) 0 0 no-repeat;
    background-size: 175px 150px;
  }

  .page-main .main-wrapper .item .item-text {
    margin: 20px 0 0;
    font-size: 20px !important;
    color: #585858;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .page-main .el-checkbox__label {
    font-size: 20px !important;
  }
</style>
