﻿
class Nav {
    constructor(portal) {
        this.portal = portal;
        this.element = document.createElement('poetry-ui-portal-nav');
        document.body.append(this.element);
        this.toggle = document.createElement('poetry-ui-portal-nav-toggle');
        this.element.appendChild(this.toggle);

        this.toggle.tabIndex = 0;
        var hideToggle = () => {
            if (!this.toggle.classList.contains('poetry-ui-active')) {
                return;
            }

            this.toggle.classList.remove('poetry-ui-active');
            this.menu.classList.add('poetry-ui-hidden');
        };
        this.toggle.addEventListener('click', () => {
            if (!this.toggle.classList.contains('poetry-ui-active')) {
                this.toggle.classList.add('poetry-ui-active');
                this.menu.classList.remove('poetry-ui-hidden');
            } else {
                hideToggle();
            }
        });
        this.toggle.addEventListener("keyup", event => {
            if (event.keyCode != 13) {
                return;
            }

            event.preventDefault();
            this.toggle.click();
        });
        document.documentElement.addEventListener('click', event => {
            if (!event.target.matches('poetry-ui-portal-nav, poetry-ui-portal-nav-toggle')) {
                hideToggle();
            }
        });

        this.menu = document.createElement('poetry-ui-portal-nav-menu');
        this.menu.classList.add('poetry-ui-hidden');
        this.element.appendChild(this.menu);

        this.appDescriptorsPromise = fetch('App/GetAll', { credentials: 'include' }).then(response => response.json());
        this.appDescriptorsPromise.then(appDescriptors => appDescriptors.forEach(appDescriptor => {
            var item = document.createElement('poetry-ui-portal-nav-menu-item');

            item.tabIndex = 0;
            item.innerText = appDescriptor.name;
            item.setAttribute('poetry-ui-app-id', appDescriptor.id);
            item.addEventListener('click', () => portal.openApp(appDescriptor));
            item.addEventListener("keyup", event => {
                if (event.keyCode != 13) {
                    return;
                }

                event.preventDefault();
                item.click();
            });

            this.menu.appendChild(item);
        }));

        if (document.readyState != 'loading') {
            this.openStartApp();
        } else {
            document.addEventListener('DOMContentLoaded', this.openStartApp);
        }
    }

    openStartApp() {
        if (!location.hash) {
            return;
        }

        var match = location.hash.substr(1).match(/^[a-z0-9-_.]+/i);

        if (match) {
            var appId = match[0];

            this.appDescriptorsPromise.then(appDescriptors => {
                var appDescriptor = appDescriptors.find(a => a.id == appId);

                if (!appDescriptor) {
                    throw `App not found: ${appId}`;
                }

                this.portal.openApp(appDescriptor);
            });
        }
    }

    openApp(appDescriptor) {
        this.appDescriptorsPromise.then(() => {
            [...this.menu.querySelectorAll('poetry-ui-portal-nav-item')].forEach(c => c.classList.remove('poetry-ui-active'));
            this.menu.querySelector(`[poetry-ui-app-id="${appDescriptor.id}"]`).classList.add('poetry-ui-active');
        });
    }

    setTitle(value) {
        var title = document.createElement('poetry-ui-portal-nav-title');
        title.innerText = value;
        this.element.append(title);
    }
}

export default Nav;