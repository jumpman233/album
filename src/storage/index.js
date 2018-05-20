import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    isLogin: false,
    username: '',
    curPath: '',
    dirs: [],
    photos: []
  },
  getters: {
    isLogin: state => state.isLogin,
    username: status => status.username,
    dirs: state => state.dirs,
    photos: state => state.photos,
    curPath: state => state.curPath
  },
  mutations: {
    setUsername (state, username) {
      state.username = username;
    },
    setLogin (state, isLogin) {
      state.isLogin = isLogin;
    },
    setDirs (state, dirs) {
      state.dirs = dirs;
    },
    setPhotos (state, photos) {
      state.photos = photos;
    },
    setCurPath (state, curPath) {
      state.curPath = curPath;
    }
  },
  actions: {
    getInfo ({ commit }) {
      axios.get('/api/info')
        .then((res) => {
          if(res.data.code === 1) {
            commit('setLogin', res.data.data.isLogin);
            commit('setUsername', res.data.data.username);
          }
        })
    },
    login ({ commit }, { username, password }) {
      return axios.post('/api/login', {
        username, password
      }).then((res) => {
        if(res.data.code === 1 && res.data.data) {
          commit('setLogin', true);
          commit('setUsername', username);
        } else {
          commit('setLogin', false);
          return res.data.msg;
        }
      })
    },
    register ({ commit }, { username, password }) {
      return axios.post('/api/register', {
        username, password
      }).then((res) => {
        if(res.data.code === 1 && res.data.data) {
          commit('setLogin', true);
          commit('setUsername', username);
        } else {
          commit('setLogin', false);
          return res.data.msg;
        }
      })
    },
    getDir ({ commit }, { path = '' }) {
      return axios.get('/api/getDir', {
        params: {
          path
        }
      }).then((res) => {
        if(res.data.code === 1) {
          commit('setDirs', res.data.data.filter((item) => {
            item.checked = false;
            return item.type === 1
          }));
          commit('setPhotos', res.data.data.filter((item) => {
            item.checked = false;
            return item.type === 2;
          }));
          commit('setCurPath', path)
          return 'success';
        } else {
          return res.data.msg
        }
      });
    },
    newFolder ({ commit, state, dispatch }, { path = '', dirName = '' }) {
      return axios.post('/api/createDir', {
        path, dirName
      }).then((res) => {
        if(res.data.code === 1 && res.data.data) {
          return dispatch('getDir', { path: state.curPath  });
        } else {
          return res.data.msg;
        }
      })
    },
    deletePath ({ commit, dispatch, state }, { path = '' }) {
      return axios.post('/api/deleteDir', {
        path
      }).then((res) => {
        if(res.data.code === 1) {
          return dispatch('getDir', { path: state.curPath });
        } else {
          return res.data.msg;
        }
      })
    },
    uploadImg ({ state, dispatch }, param) {
      return axios.post('/api/upload', param, {
        headers: {
          headers: {'Content-Type': 'multipart/form-data'}
        }
      }).then((res) => {
        if(res.data.code === 1) {
          return dispatch('getDir', { path: state.curPath });
        } else {
          return res.data.msg;
        }
      }, (res) => {
        return 'server error';
      })
    },
    logout ({ commit }) {
      return axios.post('/api/logout')
        .then((res) => {
          if(res.data.code === 1) {
            commit('setLogin', false);
            commit('setUsername', '');
            commit('setDirs', []);
            commit('setPhotos', []);
          }
        })
    }
  }
})

export default store;
