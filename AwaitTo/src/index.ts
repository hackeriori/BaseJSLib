import ToResult from "./ToResult";
import GetInfoFunType from "./ToResult/types";

export default class To {
  private readonly messenger: any = undefined;
  private readonly getInfoFun;

  constructor(getInfoFunInstance?: GetInfoFunType) {
    this.getInfoFun = getInfoFunInstance;
    if ((window as any).ElementPlus) {
      this.messenger = (window as any).ElementPlus.ElMessage.error
    } else if ((window as any).ELEMENT) {
      this.messenger = (window as any).ELEMENT.Message.error;
    }
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
    if (this.messenger) {
      this.messenger(message);
    }
  }
}