import { createApp } from './app.js';

export default context => {
    return new Promise((resolve, reject) => {
        const { app, store, App } = createApp();
        let components = App.components;
        let asyncDataPromiseFns = [];

        Object.values(components).forEach(component => {
            if (component.asyncData) {
                asyncDataPromiseFns.push(component.asyncData({ store }));
            }
        });

        Promise.all(asyncDataPromiseFns).then(res => {
            context.state = store.state;

            console.log(222);
            console.log(store.state);
            console.log(context.state);
            console.log(context);

            resolve(app);
        }, reject);
    })
}
