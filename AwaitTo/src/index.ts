import {Vue} from "vue/types/vue";
import ToResult from "./ToResult";
import GetInfoFunType from "./ToResult/types";

export default class To {
  private readonly vue;
  private readonly getInfoFun;

  constructor(vueInstance?: Vue, getInfoFunInstance?: GetInfoFunType) {
    this.vue = vueInstance;
    this.getInfoFun = getInfoFunInstance;
  }

  async<T>(promise: Promise<T>, silence = false) {
    return promise.then(data => new ToResult<T>(data, undefined, this.getInfoFun))
      .catch(e => {
        if (!silence) {
          const messageError = '网络错误';
          const messageForbidden = "无权访问";
          let message: string;
          if (e.message === 'Network Error')
            message = messageError;
          else if (e.message === 'Request failed with status code 404')
            message = messageError;
          else if (e.message === 'Request failed with status code 401')
            message = messageForbidden;
          else if (e.message === 'Request failed with status code 403')
            message = messageForbidden;
          else if (typeof e === 'string')
            message = e;
          else if (e.message && typeof e.message === 'string')
            message = e.message;
          else
            message = '未知错误';
          this.showMessage(message);
        }
        return new ToResult<T>(undefined, e, this.getInfoFun);
      });
  }

  showMessage(message: string) {
    if (this.vue) {
      if (this.vue.$message)
        this.vue.$message(message);
      else if (this.vue.$toast)
        this.vue.$toast(message);
      else
        console.log(message);
    }
  }
}