﻿import notificationManager from "../NotificationSupport/notification-manager.js";



/* FORM FIELD DESCRIPTOR PROVIDER */

class FormFieldDescriptorProvider {
    promises = {};

    async getFor(formId) {
        if (!this.promises[formId]) {
            this.promises[formId] = (async () => {
                var response = await fetch(`Field/GetAllForForm?id=${formId}`, { credentials: 'include' });

                if (!response.ok) {
                    var text = await response.text();

                    if (text) {
                        throw new Error(text.split('\n')[0]);
                    } else {
                        text = response.statusText;
                    }

                    throw new Error(`${response.status} (${text})`);
                }

                return await response.json();
            })();
        }
        try {
            return await this.promises[formId];
        } catch (error) {
            notificationManager.addNotification(item => item.setText(`Could not get field descriptors for form \`${formId}\` --- ${error.message}`));
            throw error;
        }
    }
}

export default new FormFieldDescriptorProvider();