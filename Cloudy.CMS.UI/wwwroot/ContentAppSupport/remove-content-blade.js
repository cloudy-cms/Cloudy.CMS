﻿import Blade from '../blade.js';
import Button from '../button.js';
import notificationManager from '../NotificationSupport/notification-manager.js';



/* REMOVE CONTENT */

class RemoveContentBlade extends Blade {
    onCompleteCallbacks = [];

    constructor(app, contentType, content) {
        super();

        var name = null;

        if (contentType.isNameable) {
            name = contentType.nameablePropertyName ? content[contentType.nameablePropertyName] : content.name;
        }
        if (!name) {
            name = `${contentType.name} ${content.id}`;
        }

        this.setTitle(`Remove ${name}`);

        var container = document.createElement('div');
        container.style.padding = '16px';
        container.innerText = 'Are you sure?';

        this.setContent(container);

        var saveButton = new Button('Remove')
            .setPrimary()
            .onClick(() =>
                fetch('RemoveContent/RemoveContent', {
                    credentials: 'include',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: content.id,
                        contentTypeId: contentType.id
                    })
                })
                    .catch(error => notificationManager.addNotification(item => item.setText(`Could not remove content (${error.name}: ${error.message})`)))
                    .then(() => {
                        var name = null;

                        if (!contentType.isSingleton) {
                            if (contentType.isNameable) {
                                name = contentType.nameablePropertyName ? content[contentType.nameablePropertyName] : content.name;
                            }
                            if (!name) {
                                name = content.id;
                            }
                        }

                        notificationManager.addNotification(item => item.setText(`Removed ${contentType.name} ${name || ''}`));
                        this.onCompleteCallbacks.forEach(callback => callback(content));
                        app.removeBlade(this);
                    })
            );
        var cancelButton = new Button('Cancel').onClick(() => app.removeBlade(this));

        this.setFooter(saveButton, cancelButton);
    }

    onComplete(callback) {
        this.onCompleteCallbacks.push(callback);

        return this;
    }
}

export default RemoveContentBlade;