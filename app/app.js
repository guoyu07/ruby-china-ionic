import { App, IonicApp, Platform } from 'ionic-framework/ionic';
import { HTTP_PROVIDERS } from "angular2/http";
// import { BrowserDomAdapter } from "angular2/platform/browser";
import { TutorialPage } from './pages/tutorial/tutorial';
import { TopicService } from "./services/topic.service";
import { WeberService } from "./services/weber.service";
import { TopicsPage } from './pages/topics/topics';

@App({
  templateUrl: 'build/app.html',
  providers: [HTTP_PROVIDERS, TopicService, WeberService],
  config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
export class RubyChinaApp {
  static get parameters() {
    return [[IonicApp], [Platform]];
  }

  constructor(app, platform, view) {
    this.app = app;
    this.platform = platform;

    this.rootPage = TutorialPage;
    this.appPages = [
      { title: "讨论区", component: TopicsPage, type: "last_actived", icon: "chatboxes", color: "red" },
      { title: "优质帖子", component: TopicsPage, type: "excellent", icon: "star", color: "orange" }
    ];
  }

  // initializeApp() {
  //   this.platform.ready().then(() => {
  //     // Keyboard.setAccessoryBarVisible(false);
  //     // StatusBar.setStyle(1);
  //   });
  // }

  openPage(page) {
    let nav = this.app.getComponent('nav');
    nav.setRoot(page.component, { type: page.type });
  }

  // onPageLoaded() {}
  // onPageWillEnter() {}
  // onPageDidEnter() {}
  // onPageWillLeave() {}
  // onPageDidLeave() {}
  // onPageWillUnload() {}
  // onPageDidUnload() {}
}