<template>
  <div>
    <el-container>
      <el-header class="page-header">
        <div class="logo-wrapper">
          <img class="logo" src="../img/logo.svg" alt="">
        </div>
        <div>
          <span class="username" v-if="username">Hi, <strong>{{ username }}</strong></span>
          <el-button type="primary" @click="loginDialogVisible = true" round v-if="!isLogin">
            Login
          </el-button>
          <el-button type="primary" @click="registerDialogVisible = true" round v-if="!isLogin">
            Register
          </el-button>
          <el-button type="primary" round @click="logout()" v-if="isLogin">Log Out</el-button>
        </div>
      </el-header>
      <el-main class="page-main" v-loading="containerLoadingVisible">
        <div class="btn-group" v-if="isLogin">
          <el-button type="primary"
                     @click="upload()"
                     icon="el-icon-upload2">
            Upload <input type="file" id="upload" @change="change()" style="display: none;">
          </el-button>

          <el-button type="primary"
                     @click="returnPrev()"
                     icon="el-icon-back"
                     v-if="curPath">Return</el-button>

          <el-button type="primary"
                     @click="deleteMode = !deleteMode"
                     v-if="!deleteMode"
                     icon="el-icon-delete">
            Delete
          </el-button>

          <el-button type="primary"
                     v-if="deleteMode"
                     @click="clickConfirmDelete()">
            {{ paths.length === 0 ? 'Cancel Delete' : 'Confirm Delete' }}
          </el-button>

          <el-button type="primary"
                     @click="newFolderDialogVisible = true"
                     icon="el-icon-plus">New Folder</el-button>
        </div>
        <div class="path" v-if="isLogin">
          Current Path:
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>
              <a href="javascript:;" @click="clickPath('/', -1)">home</a>
            </el-breadcrumb-item>
            <el-breadcrumb-item v-for="(item, index) in sepPath"
                                :key="index">
              <a href="javascript:;" @click="clickPath(item, index)">{{ item }}</a>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="main-wrapper">
          <div class="folder item"
               v-for="(dir, index) in dirs"
               :key="dir.name"
               @click="clickFolder(dir)"
               :title="dir.name">
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
               @click="clickPhoto(photo)"
               :title="photo.name">
            <img :src="photo.url"
                 :alt="photo.name">
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
        <div class="tip-login" v-if="!isLogin">
          Please
          <a href="javascript:;" @click="loginDialogVisible = true">Login</a>
          first to visit your album
        </div>
        <div class="tip-upload" v-if="isLogin && isEmpty">
          The directory is empty. You can
          <a href="javascript:;" @click="newFolderDialogVisible = true">Create Folder</a>
          or
          <a href="javascript:;" @click="upload()">Upload Img</a>
        </div>
      </el-main>
    </el-container>
    <div class="img-detail-wrapper"
         v-if="imgDetailVisible">
      <i class="icon-close"
         @click="imgDetailVisible = false"></i>
      <div class="img-detail-header">
        {{ curImgName }}
      </div>
      <div class="img-wrapper">
        <img :src="curImgUrl"
             :alt="curImgName">
      </div>
    </div>
    <el-dialog
      title="Register"
      :visible.sync="registerDialogVisible"
      width="50%"
      v-loading="registerDialogLoading">
      <el-input placeholder="Your Username" v-model="inputRegisterUsername" style="margin-bottom: 20px;"></el-input>
      <el-input placeholder="Your Password" type="password" v-model="inputRegisterPassword"></el-input>
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
      <el-input placeholder="Your Password" type="password" v-model="inputPassword"></el-input>
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
    <el-dialog
      title="Upload Success"
      :visible.sync="uploadSuccessVisible"
      width="50%">
      <span>Upload image success!</span>
    </el-dialog>
    <el-dialog
      title="Upload Fail"
      :visible.sync="uploadFailVisible"
      width="50%">
      <span>Upload image fail: {{ uploadFailMsg }}</span>
    </el-dialog>
    <el-dialog
      title="Delete Confirm"
      :visible.sync="deleteDialogVisible"
      width="50%"
      v-loading="deleteDialogLoading">
      <span>Are you sure to delete?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="deletePath()">Confirm</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="Delete Success"
      :visible.sync="deleteSuccessVisible"
      width="50%">
      <span>Delete success!</span>
    </el-dialog>
    <el-dialog
      title="Delete Fail"
      :visible.sync="deleteFailVisible"
      width="50%">
      <span>Delete image fail: {{ deleteFailMsg }}</span>
    </el-dialog>
  </div>
</template>

<script>
import { Container, Header, Footer, Main, Button, ButtonGroup, Dialog, Input, Checkbox, Breadcrumb, BreadcrumbItem } from 'element-ui';
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
      newFolderFailMsg: '',
      uploadSuccessVisible: false,
      uploadFailVisible: false,
      uploadFailMsg: '',
      deleteDialogVisible: false,
      deleteDialogLoading: false,
      deleteSuccessVisible: false,
      deleteFailVisible: false,
      deleteFailMsg: '',
      containerLoadingVisible: false,
      imgDetailVisible: false,
      curImgUrl: '',
      curImgName: ''
    }
  },
  computed: {
    paths() {
      let filDirs = this.dirs.filter((item) => item.checked),
        photoDirs = this.photos.filter((item) => item.checked),
        path = [];
      filDirs.forEach((item) => {
        path.push(`${this.curPath}/${item.name}`);
      });
      photoDirs.forEach((item) => {
        path.push(`${this.curPath}/${item.name}`);
      });

      return path;
    },
    isEmpty() {
      return this.dirs.length === 0 && this.photos.length === 0;
    },
    sepPath() {
      return this.curPath.split('/').filter((item) => item !== '');
    },
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

    this.containerLoadingVisible = true;
    this.$store.dispatch('getDir', { path: '' })
      .then(() => this.containerLoadingVisible = false,
        () => this.containerLoadingVisible = false);
  },
  components: {
    Container, Header, Footer, Main, Button, Dialog, Input, Checkbox, BreadcrumbItem, Breadcrumb
  },
  methods: {
    upload() {
      document.getElementById('upload').click();
    },
    change() {
      let file = document.getElementById('upload').files[0],
          _this = this;

      if(!file) {
        return;
      }

      let param = new FormData();

      let fr= new FileReader();
      fr.onload = function () {
        param.append('name', file.name);
        param.append('path', _this.curPath || '');
        param.append('file', this.result);

        _this.containerLoadingVisible = true;

        _this.$store.dispatch('uploadImg', param)
          .then((msg) => {
            _this.containerLoadingVisible = false;

            if(msg === 'success') {
              _this.uploadSuccessVisible = true;
            } else {
              _this.uploadFailVisible = true;
              _this.uploadFailMsg = msg || 'something wrong';
            }
          }, (msg) => {
            _this.containerLoadingVisible = false;
            _this.uploadFailVisible = true;
            _this.uploadFailMsg = msg || 'something wrong';
          });
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
          this.loginDialogLoading = false;
          this.loginDialogVisible = false;

          if(this.isLogin) {
            this.loginSuccessVisible = true;
            this.$store.dispatch('getDir', {
              path: this.curPath
            })
          } else {
            this.loginFailVisible = true;
            this.loginFailMsg = `Login fail: ${msg || 'something wrong'}`;
          }
        }, (msg) => {
          this.loginDialogLoading = false;
          this.loginDialogVisible = false;

          this.loginFailVisible = true;
          this.loginFailMsg = `Login fail: ${msg || 'something wrong'}`;
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
        }, (msg) => {
          this.registerDialogLoading = false;

          this.registerFailVisible = true;
          this.registerFailMsg = `Register fail: ${msg || 'something wrong'}`;
        });
    },
    clickConfirmDelete() {
      if(this.paths.length === 0) {
        this.deleteMode = false;
        return;
      }
      this.deleteDialogVisible = true
    },
    clickFolder(dir) {
      if(this.deleteMode) {
        dir.checked = !dir.checked;
      } else {
        this.containerLoadingVisible = true;

        this.$store.dispatch('getDir', {
          path: `${this.curPath}/${dir.name}`
        }).then(() => this.containerLoadingVisible = false,
          () => this.containerLoadingVisible = false)
      }
    },
    clickPhoto(photo) {
      if(this.deleteMode) {
        photo.checked = !photo.checked;
      } else {
        this.imgDetailVisible = true;
        this.curImgName = photo.name;
        this.curImgUrl = photo.url;
      }
    },
    clickPath(item, index) {
      this.containerLoadingVisible = true;

      console.log(this.sepPath.slice(0, index + 1).join('/'))

      this.$store.dispatch('getDir', {
        path: this.sepPath.slice(0, index + 1).join('/')
      }).then(() => this.containerLoadingVisible = false,
        ()=>this.containerLoadingVisible = false
      );
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
      }, (msg) => {
        this.newFolderDialogLoading = false;

        this.newFolderFailVisible = true;
        this.newFolderFailMsg = `create fail: ${msg || 'something wrong'}`;
      })
    },
    returnPrev() {
      if(this.curPath) {
        this.containerLoadingVisible = true;
        this.$store.dispatch('getDir', {
          path: this.curPath.substring(0, this.curPath.lastIndexOf('/'))
        }).then(() => this.containerLoadingVisible = false,
          () => this.containerLoadingVisible = false);
      }
    },
    deletePath() {
      if(this.paths.length === 0) {
        this.deleteMode = false;
        return;
      }

      this.deleteDialogLoading = true;

      this.$store.dispatch('deletePath', {
        path: this.paths
      }).then((msg) => {
        this.deleteDialogLoading = false;
        this.deleteMode = false;
        this.deleteDialogVisible = false;

        if(msg === 'success') {
          this.deleteSuccessVisible = true;
        } else {
          this.deleteFailVisible = true;
          this.deleteFailMsg = msg || 'something wrong';
        }
      }, (msg) => {
        this.deleteDialogLoading = false;
        this.deleteMode = false;

        this.deleteFailVisible = true;
        this.deleteFailMsg = msg || 'something wrong';
      });
    },
    logout () {
      this.$store.dispatch('logout')
        .then(() => {
        });
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
    font-size: 20px;
    margin-right: 20px;
    color: #42b983;
  }

  .page-main.el-main {
    padding-top: 10px;
  }

  .page-main .btn-group {
    display: flex;
    justify-content: flex-start;
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
    margin: 20px auto 0;
    white-space: nowrap;
    font-size: 20px !important;
    color: #585858;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .page-main .el-checkbox__label {
    font-size: 20px !important;
  }

  .img-detail-wrapper {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    flex-direction: column;
    background: #000;
  }


  .img-detail-header {
    width: 100%;
    height: 80px;
    display: flex;
    color: #fff;
    align-items: center;
    justify-content: center;
    font-size: 32px;
  }

  .img-detail-wrapper .img-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
  }

  .img-detail-wrapper .img-wrapper img {
    max-width: 100%;
    height: auto;
  }

  .img-detail-wrapper .icon-close {
    display: inline-block;
    background: url(../img/close.png) 0 0 no-repeat;
    width: 25px;
    height: 25px;
    cursor: pointer;
    background-size: 25px 25px;
    position: absolute;
    right: 20px;
    top: 20px;
  }

  .path {
    margin: 20px 0;
    font-size: 20px;
    display: flex;
    align-self: flex-start;
    align-items: center;
  }

  .path .el-breadcrumb {
    margin-left: 20px;
  }

  .logo {
    width: 50px;
  }
</style>
