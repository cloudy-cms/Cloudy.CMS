﻿import notificationManager from "../NotificationSupport/notification-manager.js";

class FieldControlProvider {
    constructor() {
        this.modulePathsPromise = fetch('Control/ModulePaths', {
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`${response.status} (${response.statusText})`);
                }

                return response.json();
            })
            .catch(error => notificationManager.addNotification(item => item.setText(`Could not get module paths for form field controls --- ${error.message}`)));

        this.typeModulesPromises = {};
    }
    
    async getFor(field) {
        var modulePaths = await this.modulePathsPromise;
        var modulePath = modulePaths[field.control.id];

        try {
            if (!modulePath) {
                throw new Error(`Control \`${field.control.id}\` not found, used on field \`${field.id}\``);
            }

            if (!this.typeModulesPromises[field.control.id]) {
                if (modulePath.indexOf('/') == 0 || modulePath.indexOf('://') != -1) {
                    if (location.href.indexOf('https://') == 0 && modulePath.indexOf(`http://${location.hostname}`) == 0) { // unterminate SSL termination
                        modulePath = modulePath.replace('http://', 'https://');
                    }
                } else {
                    modulePath = `../${modulePath}`;
                }

                this.typeModulesPromises[field.control.id] = import(modulePath);
            }

            try {
                var module = await this.typeModulesPromises[field.control.id];
            } catch (error) {
                throw new Error(`Could not load field control \`${field.control.id}\` --- ${error.message} (${error.name})`);
            }
        } catch (error) {
            notificationManager.addNotification(item => item.setText(error.message));
            throw error;
        }

        return module.default;
    }
}

export default new FieldControlProvider();