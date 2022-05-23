import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);
app.config.errorHandler = (err, instance, info) => {
  (console || eAPI).log(err, instance, info);
};
app.mount("#app");
