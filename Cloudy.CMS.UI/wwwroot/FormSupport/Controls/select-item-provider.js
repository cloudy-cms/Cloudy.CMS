﻿import notificationManager from "../../NotificationSupport/notification-manager.js";



class SelectItemProvider {
    async getCreationForm(provider) {
        try {
            var response = await fetch(`SelectControl/GetCreationForm?provider=${provider}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                var text = await response.text();

                if (text) {
                    throw new Error(text.split('\n')[0]);
                } else {
                    text = response.statusText;
                }

                throw new Error(`${response.status} (${text})`);
            }

            return await response.text() || null;
        } catch (error) {
            notificationManager.addNotification(item => item.setText(`Could not get creation action for select control \`${provider}\` --- ${error.message}`));
            throw error;
        }
    }

    async get(provider, type, value) {
        try {
            var response = await fetch(`SelectControl/GetItem?provider=${provider}&type=${type}&value=${value}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status == 404) {
                return null;
            }

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
        } catch (error) {
            notificationManager.addNotification(item => item.setText(`Could not get item \`${value}\` of type \`${type}\` for select control \`${provider}\` --- ${error.message}`));
            throw error;
        }
    }

    async getAll(provider, type, query) {
        try {
            var url = `SelectControl/GetItems?provider=${provider}&type=${type}`;

            if (query.parent) {
                url += `&parent=${query.parent}`;
            }

            var response = await fetch(url, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

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
        } catch (error) {
            notificationManager.addNotification(item => item.setText(`Could not get items of type \`${type}\` for select control \`${provider}\` --- \`${error.message}\``));
            throw error;
        }
    }

    async getProvider(id) {
        try {
            var response = await fetch(`SelectControl/GetProvider?id=${id}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

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
        } catch (error) {
            notificationManager.addNotification(item => item.setText(`Could not get item \`${value}\` for select control \`${provider}\` --- ${error.message}`));
            throw error;
        }
    }
}

export default new SelectItemProvider();